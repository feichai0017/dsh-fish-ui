import { mountWhale, whalePaintEvent } from './whale-welcome'

export const staticArrivalMedia = '(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)'
let currentLaunch: (() => void) | undefined

/** Light the real window around the welcome portrait. Only a settings preview needs another canvas. */
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
/* Quiet the painting directly behind the original halftone. Its rim follows the
   measured artwork when the composer or either side of the window moves. */
.dwe-water {
  --df-field-ink: #203f68; --df-portrait-paper: #f5f7fc; --df-portrait-wash: 93%;
  --df-portrait-x: 50%; --df-portrait-y: 32%; --df-portrait-w: 54vw; --df-portrait-h: 36vh;
  position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
  background:
    radial-gradient(ellipse calc(var(--df-portrait-w) * 1.02) calc(var(--df-portrait-h) * 1.06)
      at var(--df-portrait-x) var(--df-portrait-y),
      color-mix(in srgb, var(--df-portrait-paper) var(--df-portrait-wash), transparent) 30%,
      color-mix(in srgb, var(--df-portrait-paper) 75%, transparent) 53%,
      color-mix(in srgb, var(--df-portrait-paper) 25%, transparent) 78%, transparent),
    radial-gradient(ellipse max(1px, var(--df-word-w, 0px)) max(1px, var(--df-word-h, 0px))
      at var(--df-word-x, 0px) var(--df-word-y, 0px),
      color-mix(in srgb, var(--df-portrait-paper) 69%, transparent) 20%, transparent 95%);
}
body[data-ds-dark-theme] .dwe-water { --df-field-ink: #c4e6ff; --df-portrait-paper: #0b1732; --df-portrait-wash: 91%; }
.dwe-water > .df-portrait-light {
  position: absolute; left: var(--df-portrait-x); top: var(--df-portrait-y);
  width: calc(var(--df-portrait-w) * 1.6); height: calc(var(--df-portrait-h) * 1.7);
  transform: translate(-50%, -50%); opacity: 0;
  background: radial-gradient(ellipse 48% 26% at 40% 33%, color-mix(in srgb, var(--df-scene-glow, #9cbfff) 48%, transparent), transparent);
}
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
  :root:not(.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused]) .dwe-frame[data-df-whale-start] .df-portrait-light {
    animation: df-portrait-rise-light 2.7s ease-in-out both;
  }
  @keyframes df-portrait-rise-light {
    0%, 100% { opacity: 0; }
    20% { opacity: .23; }
    52% { opacity: .48; }
  }
  @keyframes df-welcome-tide { to { transform: translate(2%, -4%) scale(1.04); } }
}
.fish-cover > .df-whale-preview { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%;
  pointer-events: none; background: radial-gradient(ellipse, #f4f7ffed, #e6effbdc 52%, #dfebf7a3); }
body[data-ds-dark-theme] .fish-cover > .df-whale-preview { background: radial-gradient(ellipse, #0b1732e6, #142b4cb3 52%, #12264a59); }
.fish-cover[data-df-whale-start] :is(.fish-cover-copy,.fish-swatches) { visibility: hidden; }
@media (forced-colors: active) {
  .dwe-water { display: none; }
}
`
