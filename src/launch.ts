import { mountWhale, whalePaintEvent } from './whale-welcome'

export const staticArrivalMedia = '(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)'
let currentLaunch: (() => void) | undefined

/** Light the real window around the existing whale. Only a settings preview needs another canvas. */
export function playFishLaunch(holder: HTMLElement, preview = false) {
  currentLaunch?.()
  const root = document.documentElement
  const media = matchMedia(staticArrivalMedia)
  if (document.hidden || !holder.isConnected || media.matches || root.matches('[data-fish-pace="still"], .df-off-fishmotion, .df-off-hero')) {
    return () => {}
  }
  const events = new AbortController()
  let canvas: HTMLCanvasElement | undefined
  let unmount: (() => void) | undefined
  holder.dataset.dfWhaleStart = String(performance.now())
  root.dataset.dfArrival = 'emerge'
  if (preview) {
    canvas = document.createElement('canvas')
    canvas.className = 'df-whale-preview'
    canvas.setAttribute('aria-hidden', 'true')
    holder.append(canvas)
    unmount = mountWhale(canvas, true)
  }
  const timers = [
    window.setTimeout(() => { root.dataset.dfArrival = 'illuminate' }, 980),
    window.setTimeout(() => { root.dataset.dfArrival = 'settle' }, 2180),
    window.setTimeout(stop, 3000),
  ]
  // Native navigation, a setting change or a closed preview can remove the host of the art.
  const watch = new MutationObserver(() => {
    if (!holder.isConnected || (!preview && (holder.dataset.dfWelcome !== 'true' || root.classList.contains('df-off-launchintro')))
        || root.matches('[data-fish-pace="still"], .df-off-fishmotion, .df-off-hero')) stop()
  })
  watch.observe(root, { attributes: true, attributeFilter: ['data-fish-pace', 'class'] })
  watch.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-df-welcome'] })
  function stop() {
    if (events.signal.aborted) return
    events.abort()
    for (const timer of timers) clearTimeout(timer)
    watch.disconnect()
    unmount?.()
    canvas?.remove()
    delete holder.dataset.dfWhaleStart
    delete root.dataset.dfArrival
    document.dispatchEvent(new Event(whalePaintEvent))
    if (currentLaunch === stop) currentLaunch = undefined
  }
  const options = { capture: true, passive: true, signal: events.signal }
  for (const name of ['pointerdown', 'keydown', 'beforeinput', 'wheel']) window.addEventListener(name, stop, options)
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop() }, options)
  media.addEventListener('change', () => { if (media.matches) stop() }, options)
  currentLaunch = stop
  document.dispatchEvent(new Event(whalePaintEvent))
  return stop
}

export const DF_LAUNCH_CSS = `
.dwe-whale, .df-whale-preview {
  --df-whale-0: #587caa; --df-whale-1: #4a739e; --df-whale-2: #34577f;
  --df-whale-3: #254770; --df-whale-4: #193958; --df-whale-5: #102f50;
}
body[data-ds-dark-theme] .dwe-whale, .df-whale-preview {
  --df-whale-0: #476a91; --df-whale-1: #6a92b9; --df-whale-2: #85b2d6;
  --df-whale-3: #a9cbe4; --df-whale-4: #c7e4f3; --df-whale-5: #ebf8ff;
}
.dwe-water { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
  --df-field-ink: #203f68; --df-water-haze: #eff5fc91;
  background: radial-gradient(ellipse 42% 30% at 50% 30%, var(--df-water-haze), transparent); }
body[data-ds-dark-theme] .dwe-water { --df-field-ink: #c4e6ff; --df-water-haze: #071a3d83; }
.dwe-water::before, .dwe-water::after { content: ''; position: absolute; inset: 0; }
:root:not(.df-off-field) .dwe-water::before {
  background-image: radial-gradient(circle, var(--df-field-ink) .62px, transparent .95px);
  background-size: 7px 7px; opacity: .17;
  mask-image: linear-gradient(150deg, #000 0%, transparent 53%, #000 100%);
}
:root:not(.df-off-wave) .dwe-water::after {
  inset: 65% -8% -5%; opacity: .13;
  background: repeating-radial-gradient(ellipse 90% 68% at 64% 125%, transparent 0 12px, var(--df-field-ink) 13px, transparent 14px 26px);
  mask-image: linear-gradient(transparent, #000 88%);
}
.dwe-water i { position: absolute; width: 100px; height: 100px; border-radius: 50%;
  margin: -50px; box-shadow: inset 0 0 0 1px var(--df-field-ink); opacity: 0; }
@media (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none) {
  :root:not(.df-off-wave,.df-off-fishmotion,[data-fish-paused],[data-fish-pace="still"]) .dwe-water::after {
    animation: df-welcome-tide 17s ease-in-out infinite alternate;
  }
  @keyframes df-welcome-tide { to { transform: translate(2%, -4%) scale(1.04); } }
}
.fish-cover > .df-whale-preview { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%;
  pointer-events: none; background: radial-gradient(ellipse, #061a3796, #12264a59); }
.fish-cover[data-df-whale-start] :is(.fish-cover-copy,.fish-swatches) { visibility: hidden; }
@media (forced-colors: active) {
  .dwe-water { display: none; }
  .dwe-whale { --df-whale-0: CanvasText; --df-whale-1: CanvasText; --df-whale-2: CanvasText;
    --df-whale-3: CanvasText; --df-whale-4: CanvasText; --df-whale-5: CanvasText; }
}
`
