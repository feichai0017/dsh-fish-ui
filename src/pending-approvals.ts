type ReactRuntime = typeof import('react')
type Source<T> = { getSnapshot(): T; subscribe(listener: () => void): () => void }
type Interaction = { kind: string; sessionId: string; key: string; toolName?: string; answerable?: boolean }
type Statuses = ReadonlyMap<string, { pendingInteraction?: Interaction }>
type Catalog = { byId: Readonly<Record<string, { displayTitle: string }>> }
interface ApprovalScope {
  uiSession: { sessionStatus: Source<Statuses> }
  uiWorkspace: { openSession(id: string): void }
  sessions: { list: Source<Catalog> }
}

function approval(statuses: Statuses, id: string) {
  const request = statuses.get(id)?.pendingInteraction
  return request?.kind === 'approval' && request.sessionId === id && request.answerable !== false ? request : undefined
}

const css = `
.df-approval-row, .df-approval-footer, .df-approval-option {
  --df-attention-ink: #78430a;
  --df-attention-wash: color-mix(in srgb, #efa73d 20%, var(--df-shell-raised, #fff));
  font: inherit; cursor: pointer; box-sizing: border-box;
}
body[data-ds-dark-theme] :is(.df-approval-row,.df-approval-footer,.df-approval-option) {
  --df-attention-ink: #ffd599;
  --df-attention-wash: color-mix(in srgb, #ffb754 13%, var(--df-shell-surface, #222631));
}
.df-approval-row {
  display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  min-height: 22px; padding: 1px 8px; color: var(--df-attention-ink); background: var(--df-attention-wash);
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent); border-radius: 99px; font-size: 11px; font-weight: 650;
}
/* The stock row normally swaps its resting strip for its actions on hover.
   Keep the navigation button under the pointer; replace the redundant status label only. */
[data-row-key] > span:has(.df-approval-row) { display: inline-flex !important; order: 1; }
[data-row-key] > span:has(.df-approval-row) > span:first-child[aria-hidden="true"] { display: none; }
.df-approval-footer {
  width: 100%; display: flex; align-items: center; gap: 8px; padding: 7px 10px; color: var(--df-attention-ink);
  background: var(--df-attention-wash); border: 1px solid color-mix(in srgb, currentColor 27%, transparent); border-radius: 10px;
  font-size: 13px; font-weight: 600;
}
.df-approval-footer[data-rail] { justify-content: center; padding-inline: 3px; gap: 2px; }
.df-approval-count { margin-inline-start: auto; font-variant-numeric: tabular-nums; }
.df-approval-footer[data-rail] .df-approval-count { margin: 0; font-size: 11px; }
.df-approval-list {
  position: fixed; inset: auto; margin: 0; box-sizing: border-box; width: min(296px,calc(100vw - 16px)); overflow-y: auto;
  padding: 8px; border-radius: 14px; color: var(--df-shell-ink,CanvasText); background: var(--df-shell-surface,Canvas);
  border: 1px solid var(--df-shell-line,GrayText); box-shadow: 0 9px 30px var(--df-shell-shadow,#0003);
}
.df-approval-list h3 { margin: 5px 8px 6px; color: var(--df-shell-muted,CanvasText); font-size: 12px; font-weight: 600; }
.df-approval-option {
  width: 100%; display: grid; gap: 2px; text-align: start; padding: 8px; border-radius: 7px; border: 0;
  background: transparent; color: inherit; font-size: 13px;
}
.df-approval-option strong, .df-approval-option small { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.df-approval-option small { color: var(--df-attention-ink); font-size: 11px; }
.df-approval-option:hover { background: var(--df-attention-wash); }
:root[data-fish-pace] button:is(.df-approval-row,.df-approval-footer,.df-approval-option):hover { transform: none; }
:is(.df-approval-row,.df-approval-footer,.df-approval-option):focus-visible, [data-approval-scroll][data-df-approval-focus]:focus {
  outline: 2px solid var(--df-shell-accent, Highlight); outline-offset: -2px;
}
`

/** Display Harness's elected, answerable approvals across sessions. The native
 * composer remains the sole consumer of the approval and its decision. */
export function installPendingApprovals(ctx: FishClientContext, React: ReactRuntime) {
  const h = React.createElement
  const zh = () => /^zh\b/i.test(document.documentElement.lang || navigator.language)
  ctx.inject(['slots', 'sessions', 'uiSession', 'uiWorkspace'], basic => {
    const { sessions, uiSession, uiWorkspace } = basic as unknown as ApprovalScope
    const source = uiSession.sessionStatus
    if (!source || typeof uiWorkspace.openSession !== 'function') return
    let visit: AbortController | undefined

    function reveal(request: Interaction) {
      visit?.abort()
      if (approval(source.getSnapshot(), request.sessionId)?.key !== request.key) return
      uiWorkspace.openSession(request.sessionId)
      // Selection is synchronous but the session's React tree and the elected
      // composer can mount later. Match both identities even in split layouts.
      const controller = visit = new AbortController()
      const cancel = () => controller.abort()
      const locate = () => {
        if (approval(source.getSnapshot(), request.sessionId)?.key !== request.key) { cancel(); return }
        const selector = `[data-conversation-session="${CSS.escape(request.sessionId)}"] [data-approval-key="${CSS.escape(request.key)}"] [data-approval-scroll]`
        const group = Array.from(document.querySelectorAll<HTMLElement>(selector)).find(el =>
          !el.closest('[inert],[aria-hidden="true"],[data-sidebar-right-panel]') && el.getClientRects().length > 0)
        if (!group) return
        cancel()
        group.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
        group.dataset.dfApprovalFocus = ''
        group.addEventListener('blur', () => { delete group.dataset.dfApprovalFocus }, { once: true })
        group.focus({ preventScroll: true })
      }
      const observer = new MutationObserver(locate)
      observer.observe(document.body, { subtree: true, childList: true, attributes: true,
        attributeFilter: ['data-approval-key', 'data-conversation-session', 'inert', 'aria-hidden'] })
      const unsubscribe = source.subscribe(locate)
      window.addEventListener('pointerdown', cancel, { capture: true, signal: controller.signal })
      window.addEventListener('keydown', cancel, { capture: true, signal: controller.signal })
      const timeout = window.setTimeout(cancel, 15000)
      controller.signal.addEventListener('abort', () => {
        observer.disconnect(); unsubscribe(); clearTimeout(timeout)
        if (visit === controller) visit = undefined
      }, { once: true })
      locate()
    }

    function Glyph() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M8 1.5 13 3.4v4c0 3.2-2.3 5.4-5 7-2.7-1.6-5-3.8-5-7v-4L8 1.5Z', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M8 5.1v3.2m0 2.1v.1', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }))
    }
    function ApprovalBadge({ sessionId }: { sessionId: string }) {
      const request = React.useSyncExternalStore(source.subscribe, () => approval(source.getSnapshot(), sessionId))
      if (!request) return null
      const label = zh() ? '待批准' : 'Approval'
      return h('button', { type: 'button', className: 'df-approval-row', title: zh() ? '查看此会话的审批卡' : 'Go to this approval',
        onClick: (event: React.MouseEvent) => { event.stopPropagation(); reveal(request) } }, label)
    }
    function Inbox({ wide }: { wide: boolean }) {
      const statuses = React.useSyncExternalStore(source.subscribe, source.getSnapshot)
      const catalog = React.useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot)
      const id = React.useId()
      const trigger = React.useRef<HTMLButtonElement>(null)
      const panel = React.useRef<HTMLDivElement>(null)
      const pending = Array.from(statuses.keys(), key => approval(statuses, key)).filter(Boolean)
      if (!pending.length) return null
      const name = zh() ? '待你处理' : 'Needs your attention'
      // The native top layer escapes the sidebar's clipping, handles outside
      // clicks and Escape, and returns focus to the invoking button.
      const place = () => {
        if (!panel.current || !trigger.current) return
        const rect = trigger.current.getBoundingClientRect()
        panel.current.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - 304))}px`
        panel.current.style.bottom = `${innerHeight - rect.top + 5}px`
        panel.current.style.maxHeight = `${Math.max(80, rect.top - 15)}px`
      }
      return h(React.Fragment, null,
        h('button', { type: 'button', ref: trigger, popoverTarget: id, className: 'df-approval-footer',
          'data-rail': wide ? undefined : '', 'aria-label': `${name} (${pending.length})`, title: name, onClick: place },
          h(Glyph), wide && name, h('span', { className: 'df-approval-count' }, pending.length)),
        h('div', { id, ref: panel, popover: 'auto', className: 'df-approval-list', role: 'region', 'aria-label': name },
          h('h3', null, name), pending.map(request => h('button', { key: request.key, type: 'button', className: 'df-approval-option',
            onClick: () => { panel.current?.hidePopover(); reveal(request) } },
            h('strong', null, catalog.byId[request.sessionId]?.displayTitle || request.sessionId),
            h('small', null, [zh() ? '待批准' : 'Approval', request.toolName].filter(Boolean).join(' · '))))))
    }
    basic.effect(() => {
      const style = document.createElement('style')
      style.dataset.dshPlugin = 'dsh-fish-ui: pending approvals'
      style.textContent = css
      document.head.append(style)
      return () => { visit?.abort(); style.remove() }
    }, 'dsh-fish-ui: pending approvals')
    for (const [name, component] of [
      ['sidebar.session.row.trailing', ApprovalBadge], ['sidebar.footer.action', Inbox],
    ] as const) {
      basic.slots.inject(name, () => basic.slots.register({ name, id: 'df-pending-approvals', order: -15 }, component as React.ComponentType<{}>))
    }
  })
}
