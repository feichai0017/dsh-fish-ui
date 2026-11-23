import atlas from '../assets/scenes/atlas-day.webp'
import atlasNight from '../assets/scenes/atlas.webp'
import { atlasCurrent, atlasCurrentCss } from './atlas-current'
import aurora from '../assets/scenes/aurora-day.webp'
import auroraNight from '../assets/scenes/aurora.webp'
import orbit from '../assets/scenes/orbit-day.webp'
import orbitNight from '../assets/scenes/orbit.webp'
import dunes from '../assets/scenes/dunes.webp'
import dunesNight from '../assets/scenes/dunes-night.webp'
import rain from '../assets/scenes/harbor-day.webp'
import rainNight from '../assets/scenes/harbor-night.webp'
import lotus from '../assets/scenes/lotus.webp'
import lotusNight from '../assets/scenes/lotus-night.webp'

export const paintings = { atlas, aurora, orbit, dunes, rain, lotus }
type Scene = keyof typeof paintings
const nightPaintings: Record<Scene, string> = {
  atlas: atlasNight, aurora: auroraNight, orbit: orbitNight,
  dunes: dunesNight, rain: rainNight, lotus: lotusNight,
}
type PlateProps = { scene: Scene; className?: string; align?: string; live?: boolean }
type ReactRuntime = typeof import('react')

// The six paintings and their effects use the same 600 × 300 artboard.
const canyon = 'M-12 309 C39 300 86 276 134 270 S187 269 214 253 S236 210 269 209 S316 206 335 192 S338 169 361 163 S383 147 387 132 S404 119 420 117 S453 110 462 92 S461 73 481 66'
const auroralFold = 'M565 -19 C555 28 534 80 476 96 S399 87 355 111 S319 134 344 151 S404 173 358 195 C312 215 266 208 242 227'
const duneCrest = 'M-13 280 C81 264 164 244 225 213 S327 165 383 139 C428 119 466 106 489 85 Q503 69 479 53'
const stars = [[35,43,1],[107,116,.7],[192,75,.65],[219,33,.85],[329,24,.7],[543,63,.8],[574,171,.85],[128,171,.7]]

function dashedTrail(React: ReactRuntime, d: string, color: string, width: number) {
  return React.createElement('path', { d, fill: 'none', stroke: color, strokeWidth: width, strokeLinecap: 'round',
    pathLength: 100, strokeDasharray: '11 110', strokeDashoffset: 11, 'data-df-sweep': '' })
}

function sceneEffects(React: ReactRuntime, scene: Scene, gradientId: string) {
  const h = React.createElement
  const layers = (ambient: React.ReactNode, arrival: React.ReactNode) => h('g', null,
    h('g', { className: 'df-scene-weather' }, ambient),
    h('g', { className: 'df-scene-arrival', 'data-df-arrival': scene }, arrival))
  const line = (d: string, stroke: string, width: number, opacity = 1) =>
    h('path', { d, stroke, strokeWidth: width, fill: 'none', opacity, strokeLinecap: 'round' })
  const halo = (x: number, y: number, rx: number, ry: number) =>
    h('ellipse', { cx: x, cy: y, rx, ry, fill: 'url(#' + gradientId + ')' })
  if (scene === 'atlas') {
    return layers(
      atlasCurrent(React),
      h('g', null, dashedTrail(React, canyon, '#b8f7ff', 2.4), dashedTrail(React, canyon, '#b6dbff', 7)))
  }
  if (scene === 'aurora') {
    const fold = h('path', { d: auroralFold, stroke: 'url(#' + gradientId + ')', strokeWidth: 11, fill: 'none' })
    return layers(h('g', { className: 'df-polar-silk' }, fold),
      h('g', null, dashedTrail(React, auroralFold, '#a1ffcf', 3), dashedTrail(React, auroralFold, '#beffec', .85)))
  }
  if (scene === 'orbit') {
    return layers(h('g', { className: 'df-orbital-stars' }, stars.map(([cx, cy, r]) =>
      h('circle', { key: cx, cx, cy, r, fill: '#d5dcff', opacity: .65 }))),
    h('g', null, halo(0, 0, 8, 8), h('circle', { r: 1.3, fill: '#fff4d7' }),
      line('M-10 4.4L-1 .4', '#f8d4a7', .6, .76)))
  }
  if (scene === 'dunes') {
    const grains = Array.from({ length: 25 }, (_, index) => {
      const x = 280 + ((index * 137) % 208)
      const y = 172 - (x - 280) * .49 - (index * 13 % 19)
      return h('circle', { key: index, cx: x, cy: y, r: index % 4 ? .48 : .72, fill: 'var(--df-dune-glint, #ffe5ab)' })
    })
    return layers(h('g', { className: 'df-sand-grains' }, grains),
      h('g', null, dashedTrail(React, duneCrest, 'var(--df-dune-glint, #ffe5a6)', 2.15), dashedTrail(React, duneCrest, 'var(--df-dune-lip, #fff1cd)', .72)))
  }
  if (scene === 'rain') {
    const rainStrokes = Array.from({ length: 34 }, (_, i) => {
      const x = (i * 137) % 645, y = (i * 59) % 190 - 20
      return 'M' + x + ' ' + y + 'l-1.3 5.5'
    }).join(' ')
    // Positions on the two registered paintings, directly under the quay lamps.
    const reflections = [[350,'#fc8393'],[389,'#ffc680'],[419,'#ffe3a4'],[511,'#e6ae8a'],[549,'#ffb584']] as const
    const shimmer = reflections.map(([cx, color], column) => {
      const marks = Array.from({ length: 12 }, (_, row) => {
        const x = cx + ((row * 7 + column * 3) % 17 - 8) * (row / 17)
        const y = 212 + row * 2.8 + row * row * .11
        const width = 1.6 + row * .66 + (row * 5 % 6)
        return 'M' + (x - width / 2).toFixed(1) + ' ' + y.toFixed(1) + 'h' + width.toFixed(1)
      }).join(' ')
      return h('path', { key: cx, d: marks, stroke: color, strokeWidth: 1.35, strokeLinecap: 'round', fill: 'none' })
    })
    const currents = h('g', { className: 'df-harbor-surface', fill: 'none', strokeLinecap: 'round' },
      h('path', { className: 'df-harbor-crest', pathLength: 100, stroke: '#c7fbff', strokeWidth: .85,
        d: 'M-7 124C12 147 1 160 29 190S71 225 120 235S200 248 243 263S347 276 389 284' }),
      h('path', { className: 'df-harbor-crest df-harbor-crest-far', pathLength: 100, stroke: '#8feaff', strokeWidth: .65,
        d: 'M-9 193C34 212 61 234 109 245S189 259 234 276S297 287 324 291' }),
      [[161,221,8], [302,239,12], [461,272,16]].map(([cx,cy,rx], i) =>
        h('ellipse', { key: cx, className: 'df-harbor-drop', cx, cy, rx, ry: rx * .14,
          stroke: '#c3f5ff', strokeWidth: .6, style: { animationDelay: (-1.9 * i) + 's' } })))
    return layers(h('g', null,
      h('path', { className: 'df-harbour-rain', d: rainStrokes, fill: 'none', stroke: '#afcfe4', strokeWidth: .38 }), currents),
      h('g', null, ...shimmer))
  }
  const rings = (color: string, width: number) => h('g', { fill: 'none', stroke: color, strokeWidth: width },
    h('ellipse', { cx: 331, cy: 201, rx: 53, ry: 6.2 }),
    h('ellipse', { cx: 331, cy: 201, rx: 43, ry: 4.6, opacity: .62 }))
  return layers(h('g', { className: 'df-jade-ripples' }, rings('var(--df-lotus-pearl, #e8ffdf)', .62)),
    h('g', null, rings('var(--df-lotus-pearl, #f2ffe1)', 1.8), line('M289 198q32-7 63-1', '#284f47', .75, .8)))
}

const glint: Record<Scene, string> = {
  atlas: '#b3edff', aurora: '#9bffcf', orbit: '#ffd4ae', dunes: '#ffe0a0', rain: '#9cdbff', lotus: '#f5ffe7',
}

// Anchor the crop to the subject as the window gets narrower.
const focusX: Record<Scene, number> = { atlas: 355, aurora: 355, orbit: 454, dunes: 421, rain: 410, lotus: 398 }
const outgoingPaintings = new WeakMap<HTMLImageElement, HTMLImageElement>()

export function setWindowPainting(image: HTMLImageElement, scene?: Scene) {
  const root = document.documentElement
  const nightPlate = document.body.hasAttribute('data-ds-dark-theme')
  const changed = image.dataset.dfPainting !== scene || image.hasAttribute('data-df-night-plate') !== nightPlate
  if (!scene || changed) {
    const outgoing = outgoingPaintings.get(image)
    outgoing?.getAnimations().forEach(animation => animation.cancel())
    outgoing?.remove()
    outgoingPaintings.delete(image)
  }
  if (!scene) {
    image.remove()
    root.removeAttribute('data-df-window-scene')
    return
  }
  if (changed) {
    const fade = image.isConnected && image.complete && image.naturalWidth > 0 && !document.hidden
      && root.dataset.fishPace !== 'still' && !root.classList.contains('df-off-fishmotion')
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const outgoing = fade ? image.cloneNode(false) as HTMLImageElement : undefined
    if (outgoing) {
      outgoing.className = 'df-window-transition'
      image.after(outgoing)
      outgoingPaintings.set(image, outgoing)
    }
    image.src = nightPlate ? nightPaintings[scene] : paintings[scene]
    image.toggleAttribute('data-df-night-plate', nightPlate)
    image.style.objectPosition = focusX[scene] / 6 + '% 50%'
    image.dataset.dfPainting = scene
    if (outgoing) {
      // Keep the previous painting visible until the incoming artwork can paint.
      // A newer selection or an unmount cancels this transition synchronously.
      void image.decode().then(() => {
        if (outgoingPaintings.get(image) === outgoing && !document.hidden) {
          return outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 360, easing: 'ease-in-out', fill: 'forwards',
          }).finished
        }
      }).catch(() => {}).finally(() => {
        outgoing.remove()
        if (outgoingPaintings.get(image) === outgoing) outgoingPaintings.delete(image)
      })
    }
  }
  if (!image.isConnected) document.body.prepend(image)
  root.dataset.dfWindowScene = scene
}

// Project the pane's slice of the window onto the artboard. This lets arrivals
// remain local to their conversation even when sidebars or split panes resize.
function alignPaneEffects(node: SVGSVGElement, scene: Scene) {
  const pane = node.getBoundingClientRect()
  const windowWidth = document.documentElement.clientWidth
  const windowHeight = document.documentElement.clientHeight
  const scale = Math.max(windowWidth / 600, windowHeight / 300)
  if (!scale || !pane.width || !pane.height) return
  const imageX = (windowWidth - 600 * scale) * focusX[scene] / 600
  const imageY = (windowHeight - 300 * scale) / 2
  const view = [(pane.left - imageX) / scale, (pane.top - imageY) / scale, pane.width / scale, pane.height / scale].join(' ')
  if (node.getAttribute('viewBox') !== view) node.setAttribute('viewBox', view)
}

export function dfCreateScenePlate(React: ReactRuntime) {
  return React.memo(function FishPlate({ scene, className, align = 'xMidYMid slice', live = false }: PlateProps) {
    const id = 'df-scene-glint-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
    const h = React.createElement
    const ref = React.useRef<SVGSVGElement>(null)
    React.useLayoutEffect(() => {
      const node = ref.current
      if (!live || !node || typeof ResizeObserver === 'undefined') return
      const crop = () => alignPaneEffects(node, scene)
      crop()
      const observer = new ResizeObserver(crop)
      observer.observe(node)
      observer.observe(document.documentElement)
      return () => observer.disconnect()
    }, [scene, live])
    const artwork = !live && h('g', { className: 'df-scene-print' },
      h('image', { key: scene, className: 'df-plate-day',
        href: paintings[scene], width: 600, height: 300, preserveAspectRatio: 'none' }),
      h('image', { className: 'df-plate-night', href: nightPaintings[scene], width: 600, height: 300, preserveAspectRatio: 'none' }))
    return h('svg', { className, ref, 'data-df-painting': live ? undefined : scene, 'data-df-pane-effects': live ? scene : undefined,
      viewBox: '0 0 600 300', preserveAspectRatio: live ? 'none' : align, 'aria-hidden': true, focusable: false },
      artwork,
      live && h('svg', { width: 600, height: 300, viewBox: '0 0 600 300' },
        h('defs', null, h('radialGradient', { id }, h('stop', { offset: 0, stopColor: glint[scene], stopOpacity: .8 }),
          h('stop', { offset: .35, stopColor: glint[scene], stopOpacity: .35 }), h('stop', { offset: 1, stopColor: glint[scene], stopOpacity: 0 }))),
        sceneEffects(React, scene, id)))
  })
}

const arrivals = new WeakMap<HTMLElement, Animation[]>()

/** Run once for a new visible response, within that conversation's backdrop. */
export function dfPlaySceneArrival(backdrop: HTMLElement) {
  const layer = backdrop.querySelector<SVGGElement>('[data-df-arrival]')
  if (!layer || document.hidden || document.documentElement.dataset.fishPace === 'still'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !layer.animate) return
  arrivals.get(backdrop)?.forEach(animation => animation.cancel())
  const scene = layer.dataset.dfArrival
  const projection = backdrop.querySelector<SVGSVGElement>('svg[data-df-pane-effects]')
  if (projection && Object.hasOwn(paintings, scene)) alignPaneEffects(projection, scene as Scene)
  const duration = scene === 'orbit' ? 1470 : scene === 'rain' ? 1000 : 1310
  const animations: Animation[] = []
  const animate = (node: Element, frames: Keyframe[], easing = 'ease-in-out') => {
    animations.push(node.animate(frames, { duration, easing }))
  }
  const fade = [{ opacity: 0 }, { opacity: 1, offset: .24 }, { opacity: .86, offset: .57 }, { opacity: 0 }]
  animate(layer, fade)
  if (scene === 'orbit') {
    // A moving point crosses the bright limb and rejoins the orbit etched in the painting.
    const positions = [[395,67],[435,52],[477,41],[520,33],[566,29]]
    animate(layer, positions.map(([x,y]) => ({ transform: 'translate(' + x + 'px,' + y + 'px)' })), 'linear')
  } else if (scene === 'lotus') {
    animate(layer, [{ transform: 'scale(.22)' }, { transform: 'scale(1.82)' }], 'cubic-bezier(.18,.55,.35,1)')
  } else if (scene === 'rain') {
    animate(layer, [{ transform: 'scaleY(.76)' }, { transform: 'scaleY(1.03)', offset: .5 }, { transform: 'scaleY(1)' }])
  } else {
    layer.querySelectorAll('[data-df-sweep]').forEach(node => {
      animate(node, [{ strokeDashoffset: '11' }, { strokeDashoffset: '-100' }], 'cubic-bezier(.28,.12,.38,1)')
    })
  }
  arrivals.set(backdrop, animations)
  animations[0].onfinish = () => {
    if (arrivals.get(backdrop) === animations) arrivals.delete(backdrop)
  }
}

export const DF_SCENE_ART_CSS = `
/* A single painting below the window frame gives every material the same
   backdrop to sample. A narrower conversation crops a different part of it. */
html[data-df-window-scene] body {
  isolation: isolate;
  --df-reading-paper: #eff3f3;
  --df-reading-strength: 97%;
  --df-reading-edge: 80%;
  --df-paint-grade: saturate(.89);
  --df-day-haze: color-mix(in srgb, var(--df-scene-glow, #9cbfff) 12%, #d6e6e5);
  --df-window-light: linear-gradient(168deg, rgb(250 248 239 / .40) 7%,
    color-mix(in srgb, var(--df-day-haze) 24%, transparent) 52%, transparent 94%);
}
html[data-df-window-scene] body[data-ds-dark-theme] {
  --df-dune-glint: #a9c8f1;
  --df-dune-lip: #e1eefa;
  --df-lotus-pearl: #c9e6f0;
  --df-reading-paper: #13202c;
  --df-reading-strength: 96%;
  --df-reading-edge: 58%;
  --df-paint-grade: saturate(.88);
  --df-window-light: linear-gradient(160deg, rgb(15 28 39 / .43) 4%,
    rgb(16 31 44 / .24) 54%, rgb(12 25 37 / .12));
}
/* The painted harbor has its own daylight and night lighting. Keep its local
   highlights and reserve the opaque paper layer for reading conversations. */
html[data-df-window-scene="rain"] body:not([data-ds-dark-theme]) {
  --df-paint-grade: saturate(.95);
  --df-window-light: linear-gradient(176deg, rgb(235 244 255 / .32), rgb(230 243 255 / .16) 44%,
    rgb(218 237 249 / .35) 70%, rgb(139 187 224 / .07));
}
html[data-df-window-scene="rain"] body[data-ds-dark-theme] {
  --df-paint-grade: saturate(.97);
  --df-window-light: linear-gradient(165deg, rgb(7 17 42 / .24), rgb(9 27 48 / .08) 60%, rgb(8 18 36 / .19));
}
html[data-df-window-scene="atlas"] body:not([data-ds-dark-theme]) {
  --df-reading-paper: #e4ecef;
  --df-reading-strength: 95%;
  --df-paint-grade: saturate(.86);
  --df-window-light: linear-gradient(148deg, rgb(234 246 252 / .65) 8%,
    rgb(234 245 250 / .48) 40%, rgb(224 246 245 / .21) 72%, transparent);
}
html[data-df-window-scene="atlas"] body[data-ds-dark-theme] {
  --df-reading-paper: #182b3d;
  --df-reading-strength: 90%;
  --df-paint-grade: saturate(.92);
  --df-window-light: linear-gradient(155deg, rgb(10 22 47 / .62), rgb(10 29 48 / .41) 56%, rgb(8 30 45 / .22));
}
/* The canyon can move directly behind the cyan hair when a sidebar closes.
   Follow the measured portrait bounds so the ink keeps its own light. */
html[data-df-window-scene="atlas"] body:not([data-ds-dark-theme]) .dwe-water {
  background:
    radial-gradient(ellipse calc(var(--df-portrait-w) * .72) calc(var(--df-portrait-h) * .76)
      at calc(var(--df-portrait-x) + var(--df-portrait-w) * .07) var(--df-portrait-y),
      rgb(246 252 254 / .87) 5%, rgb(239 249 252 / .67) 49%, rgb(237 248 253 / .22) 76%, transparent),
    linear-gradient(160deg, var(--df-water-light), transparent 68%);
}
.df-plate-night, body[data-ds-dark-theme] .df-plate-day { display: none; }
body[data-ds-dark-theme] .df-plate-night { display: inline; }
body:not([data-ds-dark-theme]) .df-orbital-stars { display: none; }
/* The subjects in these paired paintings can pass under the portrait as a
   dock resizes. Keep the local ink legible without dimming the whole scene. */
html:is([data-df-window-scene="orbit"], [data-df-window-scene="aurora"],
    [data-df-window-scene="lotus"], [data-df-window-scene="dunes"]) .dwe-water {
  --df-portrait-matte: 240 244 241;
  background: radial-gradient(ellipse calc(var(--df-portrait-w) * .72) calc(var(--df-portrait-h) * .78)
    at var(--df-portrait-x) var(--df-portrait-y), rgb(var(--df-portrait-matte) / .85),
    rgb(var(--df-portrait-matte) / .62) 45%, transparent 97%),
    linear-gradient(160deg, var(--df-water-light), transparent 68%);
}
html[data-df-window-scene] body[data-ds-dark-theme] .dwe-water { --df-portrait-matte: 11 23 40; }
/* Keep the light common to the outgoing and incoming paintings during a fade.
   It sits below the chrome, so the four glass edges sample the same landscape. */
html[data-df-window-scene] body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--df-window-light);
}
.df-window-painting, .df-window-transition {
  position: fixed;
  inset: 0;
  z-index: -2;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  filter: var(--df-paint-grade);
  pointer-events: none;
  user-select: none;
}
html[data-df-window-scene] :is(div:has(> [data-rightbar-col]), div:has(> div > [data-slot="sidebar"]),
  [data-phase]:has(> [data-conversation-content])) {
  background: transparent;
}
/* Harness wraps registered slots. Its per-pane phase is stable across those
   wrappers and distinguishes the reading surface from the welcome artwork. */
html[data-df-window-scene] [data-conversation-content]:is([data-content-phase="active"], [data-content-phase="settling"]) {
  isolation: isolate;
  /* The column stays calm for long conversations. Only the spare width of a
     wide pane exposes the painting; split and narrow panes get solid margins. */
  --df-reading-gutter: clamp(0px, calc(50% - 22rem), 18%);
  --df-column: color-mix(in srgb, var(--df-reading-paper) var(--df-reading-strength), transparent);
  --df-margin: color-mix(in srgb, var(--df-reading-paper) var(--df-reading-edge), transparent);
  background: linear-gradient(90deg, var(--df-margin), var(--df-column) var(--df-reading-gutter),
    var(--df-column) calc(100% - var(--df-reading-gutter)), var(--df-margin));
}
/* Match the dock tint at the seam. Keep the text on its own reading surface
   even when the user increases glass transparency or narrows a split. */
html[data-df-window-scene="atlas"] [data-conversation-content]:is([data-content-phase="active"], [data-content-phase="settling"]) {
  --df-margin: var(--df-shell-chrome-fill, var(--df-reading-paper));
  --df-reading-gutter: clamp(22px, calc(50% - 22rem), 18%);
}
html.df-off-glass[data-df-window-scene="atlas"] [data-conversation-content] {
  --df-reading-strength: 100%;
}
@media (prefers-reduced-transparency: reduce) {
  html[data-df-window-scene="atlas"] [data-conversation-content] { --df-reading-strength: 100%; }
}
/* Harness marks finalized Markdown for text selection. Its live response uses
   the same Markdown component before that attribute is available. */
@media (prefers-contrast: no-preference) and (forced-colors: none) {
  html[data-df-window-scene]:not(.df-off-reading) body:not([data-ds-dark-theme])
    [data-chat-flow-kind="assistant-step"] :is([data-text-interaction-source], [class*="_markdown_"]) table {
    --df-table-rule: rgb(46 66 80 / .11);
    border-color: var(--df-table-rule);
    & :is(thead, tbody, tfoot, tr, td) { border-color: var(--df-table-rule); }
    & th { border-color: rgb(46 66 80 / .14); }
  }
}
/* Keep a first-word gesture at the edges of the page. In the margins it has
   more room; inside the text column even the bright canyon trace stays faint. */
html[data-df-window-scene] .fish-backdrop[data-home="false"] > svg {
  mask-image: linear-gradient(90deg, #0008, #00000014 13%, #00000008 24% 76%, #00000014 87%, #0008);
}
.fish-backdrop[data-home="false"] [data-df-sweep] {
  vector-effect: non-scaling-stroke;
}
.fish-backdrop {
  --df-weather-time: 29s;
  --df-rain-time: 3.6s;
}
@media (forced-colors: active), (prefers-contrast: more) {
  .df-window-painting, .df-window-transition, .fish-backdrop { display: none; }
  html[data-df-window-scene] body::before { content: none; }
  html[data-df-window-scene] [data-conversation-content][data-content-phase] { background: var(--dsw-alias-bg-base, Canvas); }
}
html:is(.df-off-fishmotion, [data-fish-pace="still"]) .df-window-transition { display: none; }
@media (prefers-reduced-motion: reduce) { .df-window-transition { display: none; } }
.df-scene-arrival, .df-scene-weather { pointer-events: none; }
.df-scene-arrival { opacity: 0; transform-box: view-box; }
.df-scene-arrival[data-df-arrival="lotus"] { transform-origin: 55.17% 67%; }
.df-scene-arrival[data-df-arrival="rain"] { transform-origin: 70% 59.7%; }
.df-scene-arrival[data-df-arrival="atlas"] [data-df-sweep]:last-child { opacity: .13; }
.df-scene-weather { opacity: 0; }
.df-harbor-surface { display: none; }
@media (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none) {
  :root:not(.df-off-fishmotion,.df-off-wave,[data-fish-pace="still"],[data-fish-paused]) .fish-backdrop[data-home="true"] .df-harbor-surface { display: inline; }
  .df-harbor-crest {
    stroke-dasharray: 7 4 1 108; animation: df-harbor-crest calc(var(--df-weather-time) * .42) linear infinite;
  }
  .df-harbor-crest-far { animation-delay: -3.9s; }
  .df-harbor-drop {
    transform-box: fill-box; transform-origin: center; animation: df-harbor-ring calc(var(--df-weather-time) * .19) ease-out infinite;
  }
  @keyframes df-harbor-crest {
    from { stroke-dashoffset: 13; opacity: 0; }
    14%, 66% { opacity: .88; }
    to { stroke-dashoffset: -107; opacity: 0; }
  }
  @keyframes df-harbor-ring {
    0%, 40% { opacity: 0; transform: scale(.12); }
    48% { opacity: .74; }
    95%, 100% { opacity: 0; transform: scale(1.2); }
  }
}
html[data-fish-pace="flow"] .fish-backdrop { --df-weather-time: 12s; --df-rain-time: 1.5s; }
@media (prefers-reduced-motion: no-preference) {
  html:not(.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused]) .fish-cover .df-scene-print > image {
    transform-box: fill-box;
    transform-origin: center;
    animation: df-scene-develop 380ms cubic-bezier(.22,.72,.2,1);
  }
  html:not([data-fish-pace="still"]) .df-scene-weather { opacity: .75; }
  .df-polar-silk { animation: df-polar-silk var(--df-weather-time) ease-in-out infinite alternate; }
  .df-orbital-stars { animation: df-starlight calc(var(--df-weather-time) * .4) ease-in-out infinite alternate; }
  .df-sand-grains { animation: df-sand-whisper calc(var(--df-weather-time) * .4) linear infinite; }
  .df-harbour-rain { animation: df-harbour-rain var(--df-rain-time) linear infinite; }
  .df-jade-ripples { transform-box: view-box; transform-origin: 55.17% 67%; animation: df-jade-ripple calc(var(--df-weather-time) * .36) ease-out infinite; }
  html:is([data-fish-pace="still"],[data-fish-paused]) .df-scene-weather * { animation-play-state: paused; }
}
@keyframes df-scene-develop {
  from { opacity: .64; transform: scale(1.018); }
  to { opacity: 1; transform: scale(1); }
}
html[data-fish-pace="still"] .df-scene-arrival, html[data-fish-paused] .df-scene-arrival { display: none; }
@media (prefers-reduced-motion: reduce) { .df-scene-arrival { display: none; } }
@keyframes df-polar-silk { from {opacity:.23;transform:translate(-2px,1px);} to {opacity:.88;transform:translate(3px,-2px);} }
@keyframes df-starlight { from {opacity:.19;} to {opacity:.83;} }
@keyframes df-sand-whisper { 0% {opacity:0;transform:translate(-6px,3px);} 28%,65% {opacity:.75;} 100% {opacity:0;transform:translate(12px,-4px);} }
@keyframes df-harbour-rain { 0% {opacity:0;transform:translate(2px,-8px);} 14%,79% {opacity:.6;} 100% {opacity:0;transform:translate(-2px,10px);} }
@keyframes df-jade-ripple { 0% {opacity:0;transform:scale(.58);} 25% {opacity:.8;} 100% {opacity:0;transform:scale(1.38);} }
${atlasCurrentCss}
`
