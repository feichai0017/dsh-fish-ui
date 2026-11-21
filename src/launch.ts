import fishLogo from '../icon.svg'

interface LaunchOptions {
  painting?: string
  sceneName?: string
  accent: string
  still: boolean
}

const svgNamespace = 'http://www.w3.org/2000/svg'
const duration = 1660
let currentLaunch: (() => void) | undefined

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string) {
  const node = document.createElement(tag)
  node.className = className
  return node
}

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) {
  const node = document.createElementNS(svgNamespace, tag)
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  return node
}

// A bundle of currents bends below the title and meets the rim of the scene lens.
function tidalLines() {
  const field = svg('svg', { class: 'df-launch-current', viewBox: '0 0 1200 720', preserveAspectRatio: 'none' })
  for (let i = 0; i < 12; i++) {
    const d = `M-35 ${573 + i * 10} C148 ${555 + i * 9} 170 ${469 + i * 3} 315 ${458 + i * 6}
      S522 ${535 + i * 7} 627 ${467 + i * 2} S755 ${313 + i * 5} 893 ${344 + i * 9}
      S1070 ${461 + i * 6} 1240 ${336 + i * 8}`
    field.append(svg('path', { d, 'stroke-width': i === 4 ? '1.25' : '.8',
      opacity: i === 4 ? '.48' : String(.12 + .1 * Math.sin(i / 11 * Math.PI)) }))
  }
  return field
}

function sceneLens(painting?: string) {
  const lens = element('div', 'df-launch-lens')
  const aperture = element('div', 'df-launch-aperture')
  if (painting) {
    const image = element('img', 'df-launch-painting')
    image.alt = ''
    image.src = painting
    aperture.append(image)
  } else {
    aperture.append(tidalLines())
  }
  const rim = svg('svg', { class: 'df-launch-rim', viewBox: '0 0 240 240' })
  rim.append(
    svg('circle', { cx: '120', cy: '120', r: '117', opacity: '.28', 'stroke-width': '.38' }),
    svg('circle', { cx: '120', cy: '120', r: '111.8', opacity: '.62', 'stroke-width': '1.4', 'stroke-dasharray': '.3 5.188' }),
    svg('circle', { cx: '120', cy: '120', r: '105', opacity: '.62', 'stroke-width': '.5' }),
    svg('path', { d: 'M31 55 A110 110 0 0 1 159 17', class: 'df-launch-arc', pathLength: '1' }),
    svg('path', { d: 'M202 195 A110 110 0 0 1 170 218', class: 'df-launch-arc df-launch-arc-pearl', pathLength: '1' }),
  )
  lens.append(aperture, rim)
  return lens
}

/** The host owns navigation and focus throughout the launch and its dismissal. */
export function playFishLaunch({ painting, sceneName, accent, still }: LaunchOptions): () => void {
  currentLaunch?.()
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (still || motion.matches || window.matchMedia('(forced-colors: active)').matches || document.hidden || !document.body) return () => {}

  const stage = element('div', 'df-launch')
  stage.setAttribute('aria-hidden', 'true')
  if (/^#[0-9a-f]{6}$/i.test(accent)) stage.style.setProperty('--df-launch-accent', accent)
  const copy = element('div', 'df-launch-copy')
  const mark = element('img', 'df-launch-mark')
  mark.src = fishLogo
  mark.alt = ''
  const title = element('div', 'df-launch-title')
  const suffix = element('span', 'df-launch-edition')
  suffix.textContent = ' UI'
  title.append('Deep Fish', suffix)
  copy.append(mark, title)
  if (sceneName && painting) {
    const caption = element('div', 'df-launch-scene')
    caption.textContent = sceneName
    copy.append(caption)
  }
  stage.append(tidalLines(), sceneLens(painting), copy)

  const listeners = new AbortController()
  const timer = window.setTimeout(stop, duration + 120)
  function stop() {
    listeners.abort()
    window.clearTimeout(timer)
    stage.remove()
    if (currentLaunch === stop) currentLaunch = undefined
  }
  const options = { capture: true, passive: true, signal: listeners.signal }
  for (const name of ['pointerdown', 'keydown', 'beforeinput', 'wheel']) window.addEventListener(name, stop, options)
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop() }, options)
  motion.addEventListener('change', () => { if (motion.matches) stop() }, options)
  stage.addEventListener('animationend', (event) => {
    if (event.target === stage && event.animationName === 'df-launch-out') stop()
  }, { signal: listeners.signal })
  currentLaunch = stop
  stage.style.setProperty('--df-launch-duration', duration + 'ms')
  document.body.append(stage)
  return stop
}

export const DF_LAUNCH_CSS = `
.df-launch {
  --df-launch-accent: #4d6bfe;
  --df-launch-ink: #132246;
  --df-launch-muted: #485c7b;
  --df-launch-field: #f3f7fc;
  --df-launch-shadow: #c1d2e2;
  --df-launch-line: color-mix(in srgb, var(--df-launch-accent) 47%, #42718a);
  position: fixed; inset: 0; z-index: 2147483600; overflow: hidden; isolation: isolate; pointer-events: none;
  user-select: none; color: var(--df-launch-ink);
  background:
    radial-gradient(ellipse at 72% 43%, color-mix(in srgb, var(--df-launch-accent) 14%, transparent) 0%, transparent 48%),
    linear-gradient(135deg, var(--df-launch-field) 24%, color-mix(in srgb, var(--df-launch-shadow) 55%, var(--df-launch-field)) 100%);
  font-family: 'Avenir Next', Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  animation: df-launch-out var(--df-launch-duration, 1660ms) linear both;
}
body[data-ds-dark-theme] .df-launch {
  --df-launch-ink: #f0f5ff; --df-launch-muted: #a7bed5;
  --df-launch-field: #090f20; --df-launch-shadow: #10314a;
  --df-launch-line: color-mix(in srgb, var(--df-launch-accent) 32%, #96d9e8);
}
.df-launch-current { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke: var(--df-launch-line); }
.df-launch > .df-launch-current { animation: df-launch-current 1150ms cubic-bezier(.2,.72,.18,1) both; }
.df-launch-lens {
  position: absolute; left: 67%; top: 48%; width: min(49vw, 67vh, 690px); aspect-ratio: 1;
  transform: translate(-50%, -50%); color: var(--df-launch-line);
}
.df-launch-aperture {
  position: absolute; inset: 6.25%; overflow: hidden; border-radius: 50%;
  background: radial-gradient(ellipse at 80% 0%, #7398c1 -6%, transparent 50%),
    linear-gradient(148deg, #25396e 0%, #101e3b 49%, #254152 100%);
  box-shadow: 0 18px 56px -22px color-mix(in srgb, var(--df-launch-shadow) 70%, transparent);
  animation: df-launch-open 780ms cubic-bezier(.17,.72,.25,1) both;
}
.df-launch-aperture::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgb(219 242 255 / .35), inset 0 -15px 38px rgb(6 24 46 / .18);
}
.df-launch-aperture .df-launch-current { color: #eef6ff; stroke: currentColor; transform: scale(1.7); }
.df-launch-painting { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 68% center;
  animation: df-launch-drift 1480ms cubic-bezier(.18,.71,.28,1) both; }
.df-launch-rim { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke: currentColor;
  transform-origin: 50% 50%; animation: df-launch-register 1050ms cubic-bezier(.18,.75,.3,1) both; }
.df-launch-arc { stroke: var(--df-launch-accent); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 1;
  animation: df-launch-etch 740ms 120ms cubic-bezier(.22,.75,.24,1) both; }
.df-launch-arc-pearl { stroke: #e8bb8a; stroke-width: 1; animation-delay: 290ms; }
.df-launch-copy { position: absolute; left: 11%; top: 48%; transform: translateY(-50%); }
.df-launch-mark {
  display: block; width: clamp(54px, 5.3vw, 90px); height: auto; aspect-ratio: 1; border-radius: 22%;
  box-shadow: 0 8px 22px -9px rgb(10 34 67 / .38); animation: df-launch-mark-in 620ms 40ms cubic-bezier(.16,.78,.18,1) both;
}
.df-launch-title {
  margin-top: clamp(13px, 2.4vh, 25px); font-size: clamp(40px, 6.3vw, 100px); font-weight: 600;
  line-height: 1.06; letter-spacing: -.069em; white-space: nowrap;
  animation: df-launch-type 650ms 110ms cubic-bezier(.16,.79,.2,1) both;
}
.df-launch-edition { display: inline-block; margin-left: .29em; font-size: .42em; font-weight: 500;
  letter-spacing: -.045em; color: var(--df-launch-muted); vertical-align: .08em; }
.df-launch-scene {
  display: flex; align-items: center; gap: .74em; margin-top: clamp(11px, 1.7vh, 18px); color: var(--df-launch-muted);
  font-size: clamp(11px, 1.05vw, 15px); font-weight: 550; line-height: 1.5; letter-spacing: .075em;
  animation: df-launch-type 620ms 220ms cubic-bezier(.18,.82,.26,1) both;
}
.df-launch-scene::before { content: ''; width: 27px; height: 2px; background: var(--df-launch-accent); }
@keyframes df-launch-current { from { opacity: 0; transform: translateY(18px) scaleY(1.025); } to { opacity: 1; transform: none; } }
@keyframes df-launch-open { from { opacity: .2; transform: scale(.91); } to { opacity: 1; transform: none; } }
@keyframes df-launch-drift { from { transform: scale(1.12) translate(-1%, 1.3%); } to { transform: none; } }
@keyframes df-launch-register { from { opacity: .12; transform: rotate(-18deg); } to { opacity: 1; transform: none; } }
@keyframes df-launch-etch { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes df-launch-mark-in { from { opacity: 0; transform: translate(-6px, 7px) scale(.95); } to { opacity: 1; transform: none; } }
@keyframes df-launch-type { from { opacity: 0; transform: translateY(.18em); } to { opacity: 1; transform: none; } }
@keyframes df-launch-out { 0%, 76% { opacity: 1; } 100% { opacity: 0; } }
@media (max-aspect-ratio: 1/1) {
  .df-launch-lens { left: 58%; top: 34%; width: min(78vw, 46vh); }
  .df-launch-copy { left: 13%; top: 62%; transform: none; }
  .df-launch-mark { width: clamp(43px, 9vw, 66px); }
  .df-launch-title { font-size: clamp(38px, 8.6vw, 78px); }
}
@media (max-height: 420px) and (min-aspect-ratio: 1/1) {
  .df-launch-mark { width: 40px; }
  .df-launch-title { margin-top: 9px; font-size: clamp(32px, 6vw, 58px); }
}
@media (prefers-reduced-motion: reduce), (forced-colors: active) { .df-launch { display: none; } }
`
