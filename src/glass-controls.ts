import { GLASS_RANGES, validGlassValue, type GlassKey, type GlassValues } from './glass-settings'

type GlassEditor = {
  preview(key: GlassKey, value: number): void
  commit(key: GlassKey, value: number): Promise<void>
  cancel(key: GlassKey): void
}
type ControlsProps = GlassEditor & {
  values: GlassValues
  zh: boolean
  disabled: boolean
  children: React.ReactNode
}
type RangeProps = GlassEditor & {
  setting: GlassKey
  value: number
  label: string
  zh: boolean
  disabled: boolean
}

const adjustmentKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'])
const rangeKeys = {
  shell: ['glassTransparency', 'glassBlur'],
  menu: ['menuTransparency', 'menuBlur'],
} as const

export function createGlassControls(React: typeof import('react')) {
  const h = React.createElement

  function GlassRange(props: RangeProps) {
    const { setting, label, value, zh, disabled } = props
    const range = GLASS_RANGES[setting]
    const id = React.useId()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const latest = React.useRef(props)
    const stageInput = React.useRef<() => void>(undefined)
    const abortEdit = React.useRef<() => void>(undefined)
    const [local, setLocal] = React.useState<number | null>(null)

    React.useLayoutEffect(() => {
      latest.current = props
      if (disabled) abortEdit.current?.()
    })

    React.useLayoutEffect(() => {
      const input = inputRef.current
      let draft: number | null = null
      let submitted: number | null = null
      let pointer: number | null = null
      let keyboard = false
      let revision = 0

      const stage = () => {
        const number = input.valueAsNumber
        if (latest.current.disabled || !validGlassValue(setting, number) || number === draft) return
        if (draft === null && number === latest.current.value) return
        ++revision
        submitted = null
        draft = number
        latest.current.preview(setting, number)
        setLocal(number)
      }

      stageInput.current = stage

      const cancel = () => {
        keyboard = false
        pointer = null
        if (draft === null) return
        ++revision
        draft = null
        latest.current.cancel(setting)
        input.value = String(latest.current.value)
        setLocal(null)
      }
      abortEdit.current = cancel

      const finish = () => {
        if (draft === null) return
        const number = draft
        draft = null
        submitted = number
        const own = ++revision
        const settled = () => {
          if (own !== revision) return
          submitted = null
          setLocal(null)
        }
        if (number === latest.current.value) {
          latest.current.cancel(setting)
          settled()
        } else {
          // Leave the thumb in place until the profile accepts or rejects the write.
          Promise.resolve(latest.current.commit(setting, number)).then(settled, settled)
        }
      }

      const change = () => {
        // Some assistive technologies emit a change without input or pointer events.
        if (draft !== null || input.valueAsNumber !== submitted) stage()
        if (pointer === null && !keyboard) finish()
      }
      const pointerDown = (event: PointerEvent) => {
        if (!event.isPrimary || event.button !== 0) return
        pointer = event.pointerId
        submitted = null
      }
      const pointerUp = (event: PointerEvent) => {
        if (pointer !== event.pointerId) return
        pointer = null
        finish()
      }
      const pointerCancel = (event: PointerEvent) => {
        if (pointer === event.pointerId) cancel()
      }
      const keyDown = (event: KeyboardEvent) => {
        if (adjustmentKeys.has(event.key)) {
          keyboard = true
          submitted = null
        } else if (event.key === 'Escape' && draft !== null) {
          cancel()
        }
      }
      const keyUp = (event: KeyboardEvent) => {
        if (!adjustmentKeys.has(event.key)) return
        keyboard = false
        finish()
      }
      const blur = () => {
        keyboard = false
        pointer = null
        finish()
      }
      const listeners = new window.AbortController()
      const { signal } = listeners
      input.addEventListener('change', change, { signal })
      input.addEventListener('keydown', keyDown, { signal })
      input.addEventListener('keyup', keyUp, { signal })
      input.addEventListener('pointerdown', pointerDown, { signal })
      input.addEventListener('blur', blur, { signal })
      // A mouse can leave the thumb or the sheet before release.
      window.addEventListener('pointerup', pointerUp, { capture: true, signal })
      window.addEventListener('pointercancel', pointerCancel, { capture: true, signal })
      return () => {
        listeners.abort()
        stageInput.current = undefined
        ++revision
        abortEdit.current = undefined
        if (draft !== null) latest.current.cancel(setting)
      }
    }, [setting])

    const shown = local ?? value
    return h('div', { className: 'df-glass-range' },
      h('label', { htmlFor: id }, label),
      h('input', { ref: inputRef, id, name: setting, type: 'range', 'data-df-glass-key': setting,
        min: range.min, max: range.max, step: range.step, value: shown, onInput: () => stageInput.current?.(),
        'aria-valuetext': range.unit === '%' ? shown + '%' : shown + (zh ? ' 像素' : ' pixels'), disabled }),
      h('span', { className: 'df-glass-value', 'aria-hidden': true }, shown + (range.unit === '%' ? '%' : ' px')))
  }

  return function GlassControls({ values, disabled, zh, preview, commit, cancel, children }: ControlsProps) {
    const name = React.useId()
    const [target, setTarget] = React.useState<keyof typeof rangeKeys>('shell')
    const surface = target === 'shell'
    const [transparency, blur] = rangeKeys[target]
    const slider = (setting: GlassKey, label: string) =>
      h(GlassRange, { key: setting, setting, value: values[setting], label, zh, disabled, preview, commit, cancel })

    return h('fieldset', { className: 'df-glass-controls', disabled },
      h('legend', { className: 'fish-sr' }, zh ? '磨砂玻璃参数' : 'Frosted glass settings'),
      h('div', { className: 'df-glass-bar' },
        h('span', { className: 'df-glass-heading' }, zh ? '材质预览' : 'Material preview',
          h('span', { className: 'df-glass-solid-note' }, zh ? ' · 系统使用实色' : ' · solid surface')),
        h('div', { role: 'radiogroup', 'aria-label': zh ? '调节对象' : 'Surface', className: 'fish-segment-track' },
          (['shell', 'menu'] as const).map(item =>
            h('label', { key: item, className: 'fish-segment' },
              h('input', { name, type: 'radio', className: 'fish-sr', value: item, checked: item === target,
                'data-df-glass-target': item, onChange: () => setTarget(item) }),
              item === 'shell' ? (zh ? '界面' : 'Interface') : (zh ? '命令菜单' : 'Command menu'))))),
      h('div', { className: 'df-glass-sample', 'data-material': target, 'aria-hidden': true },
        children,
        h('div', { className: 'df-glass-face' },
          surface ? h('span', { className: 'df-glass-caret' }) : h('b', null, '/model'),
          h('span', null, surface ? (zh ? '发消息…' : 'Message…') : (zh ? '选择模型' : 'Select model')))),
      slider(transparency, zh ? '透明度' : 'Transparency'),
      slider(blur, zh ? '模糊程度' : 'Blur'))
  }
}

export const glassControlsCss = `
.fish-studio fieldset.df-glass-controls {
  display: grid; gap: 5px; margin: 0 0 8px; min-width: 0; padding: 9px 11px 6px;
  border: 1px solid var(--fish-edge); border-radius: 10px; color: var(--fish-label);
}
.df-glass-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; }
.df-glass-heading { color: var(--fish-muted); font-size: 11px; font-weight: 600; }
.df-glass-solid-note { display: none; }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .df-glass-solid-note { display: inline; }
}
.df-glass-sample {
  --df-sample-pigment: calc(100% - var(--df-glass-transparency, 6%));
  --df-sample-blur: var(--df-glass-blur, 18px);
  --df-sample-film: var(--df-shell-film, none);
  --df-sample-saturation: 1.12;
  position: relative; isolation: isolate; overflow: hidden; display: grid; place-items: center;
  min-height: 65px; border-radius: 7px; background: var(--df-shell-surface, var(--fish-well));
}
.df-glass-sample[data-material="menu"] {
  --df-sample-pigment: calc(100% - var(--df-menu-transparency, 2%));
  --df-sample-blur: var(--df-menu-blur, 20px);
  --df-sample-saturation: 1.1;
  --df-sample-film: linear-gradient(155deg, color-mix(in srgb, var(--df-accent) 4%, transparent), transparent 55%);
}
.df-glass-sample > svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.df-glass-face {
  position: relative; display: flex; align-items: center; gap: 7px; width: min(61%, 215px); min-height: 35px; padding: 3px 10px;
  border: 1px solid var(--df-shell-line, var(--fish-edge)); border-radius: 7px;
  box-shadow: inset 0 1px var(--df-shell-highlight, transparent), 0 2px 7px rgb(14 22 34 / .15);
  color: var(--df-shell-ink, var(--fish-label)); background: var(--df-shell-raised, var(--fish-panel));
  font-size: 11px; line-height: 1.25;
}
.df-glass-face b { font-size: 10px; color: var(--df-shell-ink, var(--fish-label)); }
.df-glass-caret { height: 1.2em; width: 1.5px; background: var(--df-accent); }
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root:not(.df-off-glass) .df-glass-face {
    background: var(--df-sample-film), color-mix(in srgb, var(--df-shell-raised, var(--fish-panel)) var(--df-sample-pigment), transparent);
    -webkit-backdrop-filter: blur(var(--df-sample-blur)) saturate(var(--df-sample-saturation));
    backdrop-filter: blur(var(--df-sample-blur)) saturate(var(--df-sample-saturation));
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  .df-glass-solid-note { display: inline; }
  :root:not(.df-off-glass) .df-glass-face {
    background: var(--df-shell-raised, var(--fish-panel)); -webkit-backdrop-filter: none; backdrop-filter: none;
  }
}
.df-glass-range { display: grid; grid-template-columns: minmax(62px, auto) minmax(32px, 1fr) 5ch; align-items: center; gap: 8px; min-height: 25px; }
.df-glass-range label { color: var(--fish-label); font-size: 12px; }
.df-glass-range input { width: 100%; min-width: 0; height: 24px; margin: 0; accent-color: var(--df-accent, #4d6bfe); cursor: pointer; }
.df-glass-range input:disabled { cursor: default; }
.df-glass-range input:focus-visible { outline: 2px solid var(--df-accent); outline-offset: 1px; border-radius: 4px; }
.df-glass-value { color: var(--fish-muted); font: 500 11px/1.3 var(--fish-font, monospace); font-variant-numeric: tabular-nums; text-align: end; white-space: nowrap; }
`
