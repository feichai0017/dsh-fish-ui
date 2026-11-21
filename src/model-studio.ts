import { dfReplyPhase, dfSubscribeReplyPhase } from './reply-motion'

type ReactRuntime = typeof import('react')
type Provider = { id: string; name: string }
type Selection = { provider: string; model: string; reasoningEffort?: string }
type Effort = { id: string; name: string }
type CatalogModel = {
  id: string
  name: string
  reasoning?: { defaultEffort?: string; efforts: readonly Effort[] }
  badge?: { text: unknown }
}
type Group = Provider & { models: readonly CatalogModel[] }
interface DirectoryState {
  current: Selection | null
  pending: Selection | null
  groups: readonly Group[]
  retainedEffort?: string
}
interface Directory {
  store: { getSnapshot(): DirectoryState; subscribe(fn: () => void): () => void }
  select(selection: Selection): Promise<{ ok: boolean; error?: { code: string; message: string } }>
}
type DirectoryProps = { directory: Directory; studioSessionId: string }
type LabelProps = DirectoryProps & {
  provider: Provider
  model: CatalogModel
  placement: 'trigger' | 'menu' | 'option'
  resolveBadge(text: unknown): string
}
type StudioProps = DirectoryProps & { locked: boolean; reportFailure(message: string): void }
interface ModelScope {
  modelDirectories: { directoryFor(sessionId: string): Directory }
  locale: { resolveText(text: unknown): string }
  slots: {
    inject(name: string, setup: () => void): void
    register<P>(entry: { name: string; id?: string; order?: number; inject(sessionId: string): object }, view: React.ComponentType<P>): void
  }
}

function displayModel(model: CatalogModel) {
  const match = /^(DeepSeek)[- ](V\d+(?:\.\d+)*)[- ](Flash|Pro)$/i.exec(model.name)
  return match ? { title: match[3], family: match[1] + ' ' + match[2], variant: match[3].toLowerCase() }
    : { title: model.name, family: '', variant: 'model' }
}

function selectedModel(state: DirectoryState) {
  const current = state.current
  if (!current) return undefined
  const provider = state.groups.find(group => group.id === current.provider)
  const model = provider?.models.find(item => item.id === current.model)
  return provider && model ? { provider, model } : undefined
}

function effectiveEffort(current: Selection | null, model: CatalogModel) {
  return current?.reasoningEffort ?? model.reasoning?.defaultEffort
}

function effortPower(id: string | undefined, model: CatalogModel) {
  const efforts = model.reasoning?.efforts ?? []
  if (id == null || /^(off|none|disabled)$/i.test(id)) return 0
  const index = efforts.findIndex(item => item.id === id)
  return index < 0 ? .5 : (index + 1) / efforts.length
}

function ridgeRows(power: number, variant: string) {
  // A common sampling grid allows the SVG to interpolate the contours as one surface.
  const broad = variant === 'pro' ? 1 : variant === 'flash' ? 0 : .45
  return Array.from({ length: 29 }, (_, row) => {
    const z = row / 28
    const crest = .60 + .10 * Math.sin(4.8 * z) - z * .12 + broad * .04
    const shoulder = .34 + .53 * Math.exp(-Math.pow((z - .48) / .33, 2))
    const points: string[] = []
    for (let i = 0; i <= 65; i++) {
      const x = i / 65
      const dist = (x - crest) / (x < crest ? .15 + broad * .17 : .075 + broad * .095)
      const side = .22 * Math.exp(-Math.pow((x - (.92 - .1 * Math.cos(z * 5))) / .13, 2))
      const wave = shoulder * Math.exp(-dist * dist) * (.92 + .09 * Math.sin(z * 17 + x * 8)) + side
      const lift = 12 + power * 48
      const px = 90 + x * 390 + z * 31
      const py = 60 + z * 56 - x * 9 - lift * wave + 2 * Math.sin(x * 19 + z * 10)
      points.push((i === 0 ? 'M' : 'L') + px.toFixed(1) + ' ' + py.toFixed(1))
    }
    return points.join('')
  })
}

const STUDIO_CSS = `
[role="menu"]:has(.df-ms-hero) {
  --df-ms-ink: var(--df-accent,var(--dsw-alias-brand-primary,#4d6bfe));
  --df-ms-edge: var(--dsw-alias-border-l1,#414550);
  --df-ms-muted: var(--dsw-alias-label-secondary,#929bb0);
  width:min(436px,calc(100vw - 24px));min-width:0;max-width:min(436px,calc(100vw - 24px));
  max-height:min(470px,calc(100dvh - 80px));padding:6px;gap:1px;border-radius:16px;
  overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;
}
.df-ms-hero {
  position:relative;isolation:isolate;overflow:hidden;flex:none;order:-5;
  padding:13px 16px 14px;min-height:102px;border-radius:10px;margin:0 0 5px;
  background:linear-gradient(111deg,#101622,color-mix(in srgb,var(--df-ms-ink) 24%,#0e1525));
  color:#f1f4ff;box-sizing:border-box;box-shadow:inset 0 0 0 1px #abbdff20
}
.df-ms-ridge {position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;overflow:hidden}
.df-ms-ridge path {transition:d .42s cubic-bezier(.2,.75,.25,1)}
.df-ms-ridge g {transform-origin:center;animation:df-ms-tide 6s ease-in-out infinite alternate}
.df-ms-hero[data-phase="thinking"] .df-ms-ridge g {animation-duration:2.6s}
.df-ms-hero[data-phase="streaming"] .df-ms-ridge g {animation-duration:4s}
.df-ms-hero[data-phase="done"] .df-ms-ridge g {animation:none}
@keyframes df-ms-tide {from{transform:translate(0,0)}to{transform:translate(3px,-2.5px)}}
.df-ms-family,.df-ms-title,.df-ms-detail {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.df-ms-family {max-width:66%;font:10px/1.5 ui-monospace,monospace;color:#c5d2f7;letter-spacing:.04em}
.df-ms-title {max-width:76%;font:italic 39px/1.1 Baskerville,"Iowan Old Style",Georgia,serif;letter-spacing:-.03em;margin:2px 0 5px}
.df-ms-detail {max-width:72%;font-size:11px;color:#d5dcf1}
.df-ms-detail .df-ms-signal {margin-inline-end:7px}
[role="menu"]:has(.df-ms-hero) > button[role="menuitem"] {min-height:27px;height:27px;flex:none;padding:0 7px;color:var(--df-ms-muted);font-size:11px}
[role="menu"]:has(.df-ms-hero) > button[role="menuitem"]:first-of-type {order:-4}
[role="menu"]:has(.df-ms-hero) > button[role="menuitem"]:nth-of-type(2) {order:-2}
.df-ms-models,.df-ms-efforts {display:grid;gap:5px;flex:none;margin:0 2px 5px}
.df-ms-models {grid-template-columns:repeat(auto-fit,minmax(min(145px,100%),1fr));order:-3}
.df-ms-efforts {grid-template-columns:repeat(auto-fit,minmax(min(66px,100%),1fr));order:-1;padding:3px;border:1px solid var(--df-ms-edge);border-radius:8px}
.df-ms-models button,.df-ms-efforts button {
  appearance:none;display:flex;align-items:center;gap:6px;min-width:0;font:inherit;line-height:1.2;
  border:1px solid var(--df-ms-edge);border-radius:8px;background:transparent;color:inherit;cursor:pointer
}
.df-ms-models button {padding:8px 9px;min-height:44px;text-align:start}
.df-ms-models button > span:nth-child(2) {min-width:0;flex:1}
.df-ms-models strong,.df-ms-models small {display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.df-ms-models strong {font-size:12px;font-weight:650}.df-ms-models small {color:var(--df-ms-muted);font-size:10px;margin-top:3px}
.df-ms-models button[aria-checked=true],.df-ms-efforts button[aria-checked=true] {
  border-color:color-mix(in srgb,var(--df-ms-ink) 65%,var(--df-ms-edge));
  background:color-mix(in srgb,var(--df-ms-ink) 14%,transparent)
}
.df-ms-bubble {display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:6px;
  color:var(--df-ms-ink);background:color-mix(in srgb,var(--df-ms-ink) 12%,transparent)}
.df-ms-icon {width:14px;height:14px;flex:none}
.df-ms-check {color:var(--df-ms-ink);font-weight:700}
.df-ms-efforts button {min-height:28px;justify-content:center;flex-wrap:wrap;padding:4px 5px;font-size:11px;border-color:transparent;border-radius:5px;overflow-wrap:anywhere}
.df-ms-models button:focus-visible,.df-ms-efforts button:focus-visible {outline:2px solid var(--df-ms-ink);outline-offset:-2px}
.df-ms-models button:hover:not(:disabled),.df-ms-efforts button:hover:not(:disabled) {background:color-mix(in srgb,var(--df-ms-ink) 10%,transparent)}
.df-ms-models button:disabled,.df-ms-efforts button:disabled {opacity:.6;cursor:default}
.df-ms-signal,.df-ms-caption {display:inline-flex;align-items:center;vertical-align:middle}
.df-ms-signal {height:12px;gap:2px;color:var(--df-accent,#8098ff)}
.df-ms-signal i {display:inline-block;width:2px;max-width:2px;background:currentColor;border-radius:1.5px;transition:height .18s}
.df-ms-caption {gap:5px;max-width:100%;font-weight:550}
.df-ms-caption > .df-ms-name {overflow:hidden;text-overflow:ellipsis}
.df-ms-caption small {font-size:.82em;color:var(--dsw-alias-label-secondary);font-weight:400}
.df-ms-caption[data-phase=thinking] .df-ms-signal {animation:df-ms-pulse 1.4s ease-in-out infinite alternate}
@keyframes df-ms-pulse {from{opacity:.6}to{opacity:1}}
button[aria-haspopup=menu]:has(.df-ms-trigger) {box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--df-accent,#4d6bfe) 26%,transparent);border-radius:7px}
button[aria-haspopup=menu]:has(.df-ms-trigger):focus-visible {outline:2px solid var(--df-accent,#4d6bfe);outline-offset:1px}
html.df-off-effortbadge .df-ms-trigger .df-ms-signal {display:none}
html:is(.df-off-fishmotion,.df-off-effortbadge,[data-fish-paused]) :is(.df-ms-ridge g,.df-ms-caption .df-ms-signal) {animation:none}
@media (prefers-reduced-motion:reduce) {.df-ms-ridge path,.df-ms-signal i {transition:none}.df-ms-ridge g,.df-ms-caption .df-ms-signal {animation:none!important}}
@media (max-height:480px) {.df-ms-hero {min-height:0;padding:7px 12px}.df-ms-title {font-size:23px;margin:1px 0}}
`

export function installModelStudio(ctx: FishClientContext, React: ReactRuntime) {
  const h = React.createElement
  const zh = () => /^zh\b/i.test(document.documentElement.lang || navigator.language)
  function useDirectory(directory: Directory) {
    return React.useSyncExternalStore(
      React.useCallback(fn => directory.store.subscribe(fn), [directory]),
      React.useCallback(() => directory.store.getSnapshot(), [directory]))
  }
  function usePhase(sessionId?: string) {
    return React.useSyncExternalStore(
      React.useCallback(fn => dfSubscribeReplyPhase(sessionId, fn), [sessionId]),
      React.useCallback(() => dfReplyPhase(sessionId), [sessionId]))
  }
  function signal(power: number) {
    return h('span', { className: 'df-ms-signal', 'aria-hidden': true },
      [3, 8, 11, 7, 4].map((height, key) => h('i', { key, style: { height: 2 + height * power } })))
  }
  function icon(variant: string) {
    const d = variant === 'flash' ? 'm14 2-9 12h6l-1 8 9-13h-6z'
      : variant === 'pro' ? 'm12 2 9 5-9 5-9-5z M3 12l9 5 9-5 M3 17l9 5 9-5'
      : 'M12 3 21 8v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v8'
    return h('svg', { className: 'df-ms-icon', viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round', 'aria-hidden': true }, h('path', { d }))
  }
  function Trigger(props: LabelProps) {
    const state = useDirectory(props.directory)
    const phase = usePhase(props.studioSessionId)
    const details = displayModel(props.model)
    const effort = effectiveEffort(state.current, props.model)
    return h('span', { className: 'df-ms-caption df-ms-trigger', 'data-phase': phase },
      icon(details.variant), h('span', { className: 'df-ms-name' }, details.title),
      props.model.badge && h('small', null, props.resolveBadge(props.model.badge.text)),
      effort !== undefined && signal(effortPower(effort, props.model)))
  }
  function Label(props: LabelProps) {
    if (props.placement === 'trigger') return h(Trigger, props)
    return h('span', { className: 'df-ms-caption' }, h('span', { className: 'df-ms-name' }, props.model.name),
      props.model.badge && h('small', null, props.resolveBadge(props.model.badge.text)))
  }
  function Ridges({ power, variant }: { power: number; variant: string }) {
    const uid = React.useId().replace(/[^a-z0-9_-]/gi, '')
    const gradient = 'df-ms-crest-' + uid
    const rows = React.useMemo(() => ridgeRows(power, variant), [power, variant])
    return h('svg', { className: 'df-ms-ridge', viewBox: '0 0 460 118', preserveAspectRatio: 'none', 'aria-hidden': true },
      h('defs', null, h('linearGradient', { id: gradient, x1: '0%', x2: '100%' },
        h('stop', { offset: '0%', stopColor: 'var(--df-ms-ink)', stopOpacity: 0 }),
        h('stop', { offset: '30%', stopColor: 'var(--df-ms-ink)', stopOpacity: .25 }),
        h('stop', { offset: '72%', stopColor: '#bed8ff', stopOpacity: .88 }),
        h('stop', { offset: '100%', stopColor: 'var(--df-ms-ink)', stopOpacity: .32 }))),
      h('g', { fill: 'none', stroke: 'url(#' + gradient + ')' },
        rows.map((d, i) => h('path', { key: i, d, strokeWidth: i % 6 === 0 ? .95 : .57,
          opacity: .39 + .47 * (.5 + .5 * Math.cos(i * .38)) }))))
  }
  function Studio({ studioSessionId, directory, locked, reportFailure }: StudioProps) {
    const state = useDirectory(directory)
    const phase = usePhase(studioSessionId)
    const selected = selectedModel(state)
    const current = state.current
    if (!selected || !current) return null
    const { model, provider } = selected
    const reasoning = model.reasoning
    const effort = effectiveEffort(current, model)
    const power = effortPower(effort, model)
    const localeZh = zh()
    const details = displayModel(model)
    const providerName = (p: Provider) => p.id === 'deepseek-account' ? (localeZh ? 'DeepSeek 账号' : 'DeepSeek Account') : p.name
    const providerDefault = localeZh ? '默认' : 'Default'
    const caption = reasoning?.efforts.find(item => item.id === effort)?.name ?? effort ?? state.retainedEffort
    const phaseCaption = phase === 'thinking' ? (localeZh ? '思考中' : 'Thinking')
      : phase === 'streaming' ? (localeZh ? '正在输出' : 'Writing') : ''
    const pending = state.pending !== null
    const blocked = locked || pending
    async function choose(next: Selection, button: HTMLButtonElement) {
      if (blocked || directory.store.getSnapshot().pending) return
      // Native rows disable while selecting. Keep focus in the menu's React subtree during the write.
      const menu = button.closest<HTMLElement>('[role="menu"]')
      const trigger = menu?.id && document.activeElement === button
        ? Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-controls]'))
          .find(node => node.getAttribute('aria-controls') === menu.id) : undefined
      trigger?.focus()
      try {
        const result = await directory.select(next)
        if (!result.ok && result.error) reportFailure(result.error.code === 'session/writer-held'
          ? (localeZh ? '此会话正在另一个窗口中使用。' : 'This session is in use in another window.')
          : result.error.message)
      } catch (err) {
        reportFailure(err instanceof Error ? err.message : String(err))
      } finally {
        if (trigger) requestAnimationFrame(() => {
          if (button.isConnected && !button.disabled && document.activeElement === trigger) button.focus()
        })
      }
    }
    // Quick choices stay small. The native model header opens the full searchable provider catalog.
    const entries = [provider, ...state.groups.filter(group => group.id !== provider.id)]
      .flatMap(group => group.models.map(candidate => ({ group, candidate })))
    const cards = entries.slice(0, 4)
    if (!cards.some(item => item.group.id === provider.id && item.candidate.id === model.id)) {
      cards[cards.length - 1] = { group: provider, candidate: model }
    }
    const efforts: { id: string | undefined; name: string }[] = reasoning
      ? [...(reasoning.defaultEffort === undefined ? [{ id: undefined, name: providerDefault }] : []), ...reasoning.efforts] : []
    const quickEfforts = efforts.length <= 6 ? efforts : []
    return h(React.Fragment, null,
      h('div', { className: 'df-ms-hero', 'data-phase': phase },
        h(Ridges, { power, variant: details.variant }),
        h('span', { className: 'df-ms-family' }, details.family || providerName(provider)),
        h('span', { className: 'df-ms-title', title: model.name }, details.title),
        h('span', { className: 'df-ms-detail' }, reasoning && signal(power),
          [phaseCaption, caption ?? (reasoning ? providerDefault : '')].filter(Boolean).join(' · '))),
      h('div', { className: 'df-ms-models', role: 'group', 'aria-label': localeZh ? '快捷模型' : 'Quick model choices' },
        cards.map(({ group, candidate }) => {
          const active = group.id === provider.id && candidate.id === model.id
          const style = displayModel(candidate)
          const changing = state.pending?.provider === group.id && state.pending.model === candidate.id
          return h('button', { type: 'button', key: JSON.stringify([group.id, candidate.id]),
            role: 'menuitemradio', 'aria-checked': active, 'aria-busy': changing || undefined,
            disabled: blocked, title: providerName(group) + ' · ' + candidate.name,
            onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
              if (!active) void choose({ provider: group.id, model: candidate.id }, event.currentTarget)
            } },
          h('span', { className: 'df-ms-bubble' }, icon(style.variant)),
          h('span', null, h('strong', null, style.title), h('small', null,
            state.groups.length === 1 && style.family ? style.family : providerName(group))),
          h('span', { className: 'df-ms-check', 'aria-hidden': true }, changing ? '…' : active ? '✓' : ''))
        })),
      quickEfforts.length > 0 && h('div', { className: 'df-ms-efforts', role: 'group', 'aria-label': localeZh ? '推理强度' : 'Reasoning effort' },
        quickEfforts.map(item => h('button', { type: 'button', key: JSON.stringify([item.id]),
          role: 'menuitemradio', 'aria-checked': item.id === effort, disabled: blocked,
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            if (item.id !== effort) void choose({ provider: provider.id, model: model.id,
              ...(item.id === undefined ? {} : { reasoningEffort: item.id }) }, event.currentTarget)
          } }, signal(effortPower(item.id, model)), item.name))))
  }
  ctx.inject(['slots', 'modelDirectories', 'locale'], basic => {
    const scope = basic as unknown as ModelScope
    basic.effect(() => {
      const style = document.createElement('style')
      style.dataset.dshPlugin = 'dsh-fish-ui:model-studio'
      style.textContent = STUDIO_CSS
      document.head.append(style)
      return () => style.remove()
    }, 'dsh-fish-ui: model studio')
    scope.slots.inject('conversation.input.model.label', () => scope.slots.register({
      name: 'conversation.input.model.label',
      inject: sessionId => ({ studioSessionId: sessionId, directory: scope.modelDirectories.directoryFor(sessionId),
        resolveBadge: (text: unknown) => scope.locale.resolveText(text) }),
    }, Label))
    scope.slots.inject('conversation.input.model.options', () => scope.slots.register({
      name: 'conversation.input.model.options', id: 'dsh-fish-ui.studio', order: -40,
      inject: sessionId => ({ studioSessionId: sessionId, directory: scope.modelDirectories.directoryFor(sessionId) }),
    }, Studio))
  })
}
