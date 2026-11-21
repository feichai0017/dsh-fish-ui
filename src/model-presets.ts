import type { Directory, DirectoryState, Selection } from './model-studio'

const keys = ['dailyModelPreset', 'deepModelPreset'] as const
type PresetKey = typeof keys[number]
type Form = ReturnType<FishClientContext['configForms']['get']>

function readSelection(value: unknown): Selection | undefined {
  if (!value || typeof value !== 'object') return
  const { provider, model, reasoningEffort } = value as Partial<Selection>
  if (typeof provider !== 'string' || !provider || typeof model !== 'string' || !model) return
  if (reasoningEffort !== undefined && typeof reasoningEffort !== 'string') return
  return { provider, model, ...(reasoningEffort === undefined ? {} : { reasoningEffort }) }
}

function resolveSelection(state: DirectoryState, selection?: Selection | null) {
  if (!selection) return
  const provider = state.groups.find(group => group.id === selection.provider)
  const model = provider?.models.find(entry => entry.id === selection.model)
  if (!model) return
  const effort = selection.reasoningEffort ?? model.reasoning?.defaultEffort
  const level = model.reasoning?.efforts.find(entry => entry.id === effort)
  if (effort !== undefined && !level) return
  return {
    selection: { provider: selection.provider, model: selection.model,
      ...(effort === undefined ? {} : { reasoningEffort: effort }) },
    caption: [model.name, level?.name].filter(Boolean).join(' · '),
    providerName: provider.name,
  }
}

function matches(a?: Selection | null, b?: Selection | null) {
  return !!a && !!b && a.provider === b.provider && a.model === b.model && a.reasoningEffort === b.reasoningEffort
}

// The host closes this portaled menu when focus leaves it. Park focus on its
// trigger before a pending write disables the focused row, just as the native
// model selector does. Never steal focus if the user went elsewhere meanwhile.
export function holdModelMenuFocus(button: HTMLButtonElement) {
  const menuId = button.closest('[role="menu"]')?.id
  const trigger = menuId && document.activeElement === button
    ? Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-controls]'))
      .find(node => node.getAttribute('aria-controls') === menuId) : undefined
  trigger?.focus()
  return () => {
    if (trigger) requestAnimationFrame(() => {
      if (button.isConnected && !button.disabled && document.activeElement === trigger) button.focus()
    })
  }
}

interface PresetProps {
  directory: Directory
  form: Form
  studioSessionId: string
  available: boolean
  compact?: boolean
  locked?: boolean
}

interface PresetScope {
  modelDirectories: { directoryFor(sessionId: string): Directory }
  sessions: { subagentAddress(sessionId: string): unknown }
  slots: {
    inject(slot: string, setup: () => () => void): () => void
    register(entry: { name: string; id: string; order: number; inject(id: string): PresetProps },
      view: React.ComponentType<PresetProps>): () => void
  }
}

const presetCss = `
.df-ms-presets {--df-preset-ink:var(--df-accent,#4d6bfe);--df-preset-edge:var(--df-shell-line,#75809655);
  --df-preset-muted:var(--df-shell-muted,var(--dsw-alias-label-secondary));color:var(--df-shell-ink,inherit)}
.df-ms-presets button {appearance:none;cursor:pointer;font:inherit;color:inherit;background:transparent;border:0;
  transform:none!important;min-width:0}
.df-ms-presets button:disabled {cursor:default;opacity:.55}
.df-ms-presets button:focus-visible {outline:2px solid var(--df-preset-ink);outline-offset:-2px}
.df-ms-presets[data-mode="menu"] {order:-4;margin:2px 2px 7px;flex:none}
.df-ms-presets-head {display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-height:17px;
  padding:1px 3px 3px;color:var(--df-preset-muted);font-size:11px}
.df-ms-presets-head [role=status] {text-align:end}
.df-ms-preset-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.df-ms-preset-card {display:flex;align-items:center;min-width:0;padding:3px;border-radius:9px;
  border:1px solid var(--df-preset-edge);background:var(--df-shell-card-fill,var(--df-ms-tile))}
.df-ms-preset-card:has([aria-pressed=true]) {border-color:color-mix(in srgb,var(--df-preset-ink) 64%,var(--df-preset-edge))}
.df-ms-preset-card .df-ms-preset-select {min-width:0;flex:1;display:grid;text-align:start;gap:2px;padding:4px 5px;border-radius:6px}
.df-ms-preset-select strong {font-weight:650;font-size:12px}
.df-ms-preset-select small {font-size:10px;color:var(--df-preset-muted);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
.df-ms-preset-save {width:27px;height:29px;display:grid;place-items:center;flex:none;border-radius:5px}
.df-ms-preset-save svg {width:15px;height:15px;stroke:currentColor;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.6}
.df-ms-presets[data-mode="toolbar"] {display:inline-flex;position:relative;align-items:center;align-self:center;flex:none;
  height:24px;padding:1px;box-sizing:border-box;gap:1px;border:1px solid var(--df-preset-edge);border-radius:7px;
  background:var(--df-shell-card-fill,var(--dsw-alias-bg-layer-1))}
.df-ms-presets[data-mode="toolbar"] button {display:inline-flex;align-items:center;justify-content:center;
  border-radius:5px;padding:0 5px;min-height:20px;line-height:18px;font-size:11px;white-space:nowrap}
.df-ms-presets button[aria-pressed=true] {color:var(--df-preset-ink);background:color-mix(in srgb,var(--df-preset-ink) 14%,transparent)}
.df-ms-presets button[aria-busy=true] {border-bottom:1px dotted currentColor}
.df-ms-preset-notice:not(:empty) {position:absolute;bottom:calc(100% + 5px);right:0;z-index:2;
  width:max-content;max-width:min(230px,55vw);background:var(--df-shell-raised,var(--dsw-alias-bg-base));border:1px solid var(--df-preset-edge);
  border-radius:6px;padding:5px 8px;font-size:11px;box-shadow:0 2px 8px #0002}
@media (hover:hover) {.df-ms-presets button:not(:disabled):hover {background:color-mix(in srgb,var(--df-preset-ink) 12%,transparent)}}
@media (max-width:520px) {.df-ms-presets[data-mode="toolbar"] button {padding-inline:3px}}
@media (forced-colors:active) {.df-ms-presets button[aria-pressed=true] {outline:2px solid Highlight;outline-offset:-2px}}
`

export function installModelPresets(ctx: FishClientContext, React: typeof import('react')) {
  const h = React.createElement
  function PresetControls({ directory, form, compact, locked }: PresetProps) {
    const state = React.useSyncExternalStore(React.useCallback(cb => directory.store.subscribe(cb), [directory]),
      React.useCallback(() => directory.store.getSnapshot(), [directory]))
    const prefs = React.useSyncExternalStore(React.useCallback(cb => form.subscribe(cb), [form]),
      React.useCallback(() => form.getSnapshot(), [form]))
    const zh = /^zh\b/i.test(document.documentElement.lang || navigator.language)
    const name = (key: PresetKey) => key === 'dailyModelPreset' ? (zh ? '日常' : 'Daily') : (zh ? '深入' : 'Deep')
    const [notice, notify] = React.useState('')
    const [busySave, setBusySave] = React.useState<PresetKey | null>(null)
    const saving = React.useRef(false)
    const element = React.useRef<HTMLDivElement>(null)
    const native = React.useRef<HTMLButtonElement | null>(null)
    const [nativeLocked, setNativeLocked] = React.useState(true)
    const ready = prefs.status === 'ready'
    React.useLayoutEffect(() => {
      if (!compact || !ready) return
      // input.right has no locked prop. Mirror the adjacent native model seat,
      // including its removal when a session does not permit model selection.
      const card = element.current?.closest('[data-composer-card]')
      if (!card) return
      const sync = () => {
        native.current = card.querySelector<HTMLButtonElement>('[data-slot="conversation.input.model"] button[aria-haspopup="menu"]')
        setNativeLocked(!native.current || native.current.disabled)
      }
      sync()
      const observer = new MutationObserver(sync)
      const row = element.current.closest('[data-slot="conversation.input.right"]')?.parentElement ?? card
      observer.observe(row, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
      return () => { observer.disconnect(); native.current = null }
    }, [compact, ready])
    React.useEffect(() => {
      if (!notice) return
      const timer = window.setTimeout(() => notify(''), 5000)
      return () => window.clearTimeout(timer)
    }, [notice])
    if (!ready) return null

    const current = resolveSelection(state, state.current)
    const directoryBusy = state.pending !== null || state.status === 'loading' || state.status === 'idle'
    const blocked = locked || (compact && nativeLocked) || directoryBusy
    function focusSave(key: PresetKey) {
      const trigger = native.current
      if (!trigger?.isConnected || trigger.disabled) return
      if (trigger.getAttribute('aria-expanded') !== 'true') trigger.click()
      requestAnimationFrame(() => {
        const menu = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
        menu?.querySelector<HTMLButtonElement>('[data-df-preset-save="' + key + '"]')?.focus()
      })
    }
    async function apply(key: PresetKey, button: HTMLButtonElement) {
      const live = directory.store.getSnapshot()
      if (blocked || live.pending || (compact && (!native.current?.isConnected || native.current.disabled))) return
      const value = readSelection(form.getSnapshot().value?.[key])
      const preset = resolveSelection(live, value)
      if (!preset) {
        if (compact) focusSave(key)
        return
      }
      if (matches(preset.selection, resolveSelection(live, live.current)?.selection)) return
      notify('')
      const restoreFocus = holdModelMenuFocus(button)
      try {
        // Host updates pending synchronously. Its durable projection alone marks a
        // combination active, including when another window changes the same session.
        const result = await directory.select(preset.selection)
        if (!result.ok) notify(result.error?.message || (zh ? '切换失败，请重试' : 'Could not switch. Try again.'))
      } catch (error) { notify(error instanceof Error ? error.message : String(error)) }
      finally { restoreFocus() }
    }
    async function save(key: PresetKey, button: HTMLButtonElement) {
      const live = directory.store.getSnapshot()
      const snapshot = form.getSnapshot()
      const selection = resolveSelection(live, live.current)?.selection
      if (saving.current || locked || live.pending || !selection || !snapshot.writable || snapshot.status !== 'ready') return
      const restoreFocus = holdModelMenuFocus(button)
      saving.current = true
      setBusySave(key)
      try {
        const ok = await form.mutate([{ op: 'set', path: [key], value: selection }], snapshot.revision)
        notify(ok ? (zh ? '已保存「' + name(key) + '」' : 'Saved ' + name(key))
          : (zh ? '未保存，请检查最新设置后重试' : 'Not saved. Check the latest settings and retry.'))
      } catch (error) { notify(error instanceof Error ? error.message : String(error)) }
      finally { saving.current = false; setBusySave(null); restoreFocus() }
    }
    function controls(key: PresetKey) {
      const label = name(key)
      const value = readSelection(prefs.value?.[key])
      const preset = resolveSelection(state, value)
      const title = value ? (preset ? [preset.providerName, preset.caption].join(' · ')
        : (zh ? '组合不可用，请重新保存' : 'Unavailable. Save a new selection.')) : (zh ? '尚未保存' : 'Not saved')
      const caption = preset?.caption ?? title
      const chooseLabel = !preset && compact ? (zh ? '设置' : 'Set up ') + label
        : (zh ? '切换到' : 'Switch to ') + label
      const pending = matches(resolveSelection(state, state.pending)?.selection, preset?.selection)
      const button = h('button', { type: 'button', key, className: 'df-ms-preset-select',
        role: compact ? undefined : 'menuitem', 'aria-label': chooseLabel, title: label + ' · ' + title,
        'aria-pressed': matches(preset?.selection, current?.selection), 'aria-busy': pending || undefined,
        disabled: blocked || (!compact && !preset) || (!preset && !prefs.writable),
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => { void apply(key, event.currentTarget) } },
        compact ? label : h(React.Fragment, null, h('strong', null, label), h('small', null, caption)))
      if (compact) return button
      const saveLabel = zh ? '保存当前为' + label : 'Save current as ' + label
      return h('div', { key, className: 'df-ms-preset-card' }, button,
        h('button', { type: 'button', role: 'menuitem', className: 'df-ms-preset-save', 'data-df-preset-save': key,
          title: saveLabel, 'aria-label': saveLabel, disabled: blocked || !prefs.writable || !current || busySave !== null,
          'aria-busy': busySave === key || undefined,
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => { void save(key, event.currentTarget) } },
          h('svg', { viewBox: '0 0 20 20', 'aria-hidden': true },
            h('path', { d: 'M5 3h9l2 2v12H4V4z M7 3v5h6V3 M7 17v-6h6v6' }))))
    }
    return h('div', { ref: element, className: 'df-ms-presets', role: 'group',
      'data-mode': compact ? 'toolbar' : 'menu', 'aria-label': zh ? '模型组合' : 'Model presets' },
      compact ? h(React.Fragment, null, keys.map(controls), h('span', { className: 'df-ms-preset-notice', role: 'status' }, notice))
        : h(React.Fragment, null, h('div', { className: 'df-ms-presets-head' }, zh ? '模型组合' : 'Model presets',
          h('span', { role: 'status' }, notice)), h('div', { className: 'df-ms-preset-grid' }, keys.map(controls))))
  }
  ctx.inject(['slots', 'configForms', 'modelDirectories', 'sessions'], basic => {
    const scope = basic as unknown as PresetScope
    const form = basic.configForms.get('dsh-fish-ui')
    basic.effect(() => {
      const style = document.createElement('style')
      style.dataset.dshPlugin = 'dsh-fish-ui:model-presets'
      style.textContent = presetCss
      document.head.append(style)
      return () => style.remove()
    }, 'dsh-fish-ui: model preset controls')
    function register(name: string, compact: boolean) {
      scope.slots.inject(name, () => scope.slots.register({ name, id: 'df-model-presets', order: compact ? 80 : -35,
        inject: sessionId => ({ studioSessionId: sessionId, directory: scope.modelDirectories.directoryFor(sessionId),
          form, compact, available: scope.sessions.subagentAddress(sessionId) === undefined }),
      }, props => props.available ? h(PresetControls, { ...props, key: props.studioSessionId }) : null))
    }
    register('conversation.input.right', true)
    register('conversation.input.model.options', false)
  })
}
