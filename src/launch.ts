import { mountWhale, whalePaintEvent } from './whale-welcome'

export const staticArrivalMedia = '(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)'
let currentLaunch: (() => void) | undefined

// The host can still be loading after the welcome's session-restore deadline,
// or it can restore a conversation instead. Follow its actual spinner lifetime.
export function attachBootSea(onHandoff: () => void) {
  const spinner = document.querySelector('[data-dsh-boot] [data-dsh-boot-spinner]')
  const transparency = matchMedia('(prefers-reduced-transparency: reduce)')
  if (!spinner || transparency.matches) return
  const root = document.documentElement
  const events = new AbortController()
  const options = { capture: true, passive: true, signal: events.signal }
  let expiry: number | undefined
  const watch = new MutationObserver(() => {
    if (spinner.isConnected) return
    watch.disconnect()
    onHandoff()
    // Resolve the ::after style after React removes the loader so the CSS
    // transition and fallback clock start together, even on a busy renderer.
    const duration = Number(getComputedStyle(document.body, '::after').getPropertyValue('--df-boot-sea-ms'))
    if (duration > 0) expiry = window.setTimeout(stop, duration + 100)
    else stop()
  })
  function stop() {
    events.abort()
    watch.disconnect()
    clearTimeout(expiry)
    root.removeAttribute('data-df-boot-sea')
  }
  root.setAttribute('data-df-boot-sea', '')
  watch.observe(spinner.closest('[data-dsh-boot]').parentElement, { childList: true, subtree: true })
  document.body.addEventListener('transitionend', event => {
    if (event.target === document.body && event.pseudoElement === '::after' && event.propertyName === 'opacity'
      && !spinner.isConnected && getComputedStyle(document.body, '::after').opacity === '0') stop()
  }, options)
  for (const event of ['pointerdown', 'keydown', 'wheel', 'beforeinput', 'visibilitychange']) {
    document.addEventListener(event, stop, options)
  }
  transparency.addEventListener('change', () => { onHandoff(); stop() }, options)
  return stop
}

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
/* The boot card is owned by Harness and disappears when React mounts. Keep
   its pigment behind both surfaces so a short or long boot has one dissolve. */
@media (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none) {
  html[data-ds-theme-source][data-df-boot-sea][data-df-window-scene="atlas"]:not(.df-off-launchintro,.df-off-fishmotion,.df-off-hero,[data-fish-pace="still"])
    body:not([data-ds-dark-theme]) {
    --df-boot-sea-ms: 820;
    &::after {
      content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
      background: var(--dsw-alias-bg-base, var(--dsh-boot-bg, Canvas));
      opacity: 0; transition: opacity calc(var(--df-boot-sea-ms) * 1ms) ease-in-out;
    }
    &:has([data-dsh-boot-spinner])::after { opacity: .76; }
    /* Leave the host's opaque failure screen and its diagnostics intact. */
    & [data-dsh-boot]:has([data-dsh-boot-spinner]) { background: transparent; }
    @starting-style { &::after, &:has([data-dsh-boot-spinner])::after { opacity: 1; } }
  }
}
/* A broad wash follows the light on the water. The portrait has its own
   contrast; only the brief reflection needs its precise coordinates. */
.dwe-water {
  --df-field-ink: #294c61; --df-water-light: rgb(255 253 245 / .28);
  --df-portrait-x: 50%; --df-portrait-y: 32%; --df-portrait-w: 54vw; --df-portrait-h: 36vh;
  position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;
  background: linear-gradient(160deg, var(--df-water-light), transparent 68%);
}
body[data-ds-dark-theme] .dwe-water { --df-field-ink: #bddbe3; --df-water-light: rgb(8 20 37 / .33); }
.dwe-water > .df-portrait-light {
  position: absolute; left: var(--df-portrait-x); top: var(--df-portrait-y);
  width: calc(var(--df-portrait-w) * 1.6); height: calc(var(--df-portrait-h) * 1.7);
  transform: translate(-50%, -50%); opacity: 0;
  background: radial-gradient(ellipse 48% 26% at 40% 33%, color-mix(in srgb, var(--df-scene-glow, #9cbfff) 48%, transparent), transparent);
}
.dwe-water::before, .dwe-water::after { content: ''; position: absolute; inset: 0; }
:root:not(.df-off-field) .dwe-water::before {
  background-image: radial-gradient(circle, var(--df-field-ink) .62px, transparent .95px);
  background-size: 8px 8px; opacity: .11;
  mask-image: linear-gradient(156deg, #000, transparent 22% 79%, #000);
}
:root:not(.df-off-wave) .dwe-water::after {
  inset: 76% -8% -5%; opacity: .085;
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
    20% { opacity: .12; }
    52% { opacity: .32; }
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
