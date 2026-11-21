import atlas from '../assets/scenes/atlas.webp'
import aurora from '../assets/scenes/aurora.webp'
import orbit from '../assets/scenes/orbit.webp'
import dunes from '../assets/scenes/dunes.webp'
import rain from '../assets/scenes/rain.webp'
import lotus from '../assets/scenes/lotus.webp'

const paintings = { atlas, aurora, orbit, dunes, rain, lotus }
type Scene = keyof typeof paintings
type PlateProps = { scene: Scene; className?: string; align?: string; live?: boolean }
type ReactRuntime = typeof import('react')

// Artwork and effects share a 2:1 coordinate system so the waterline, moon limb
// and sand crest still line up when the host crops a tall conversation panel.
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
      h('path', { className: 'df-canyon-tracer', d: canyon, pathLength: 100, strokeDasharray: '1.1 99',
        fill: 'none', stroke: '#a9ebff', strokeWidth: .8, strokeLinecap: 'round' }),
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
      return h('circle', { key: index, cx: x, cy: y, r: index % 4 ? .48 : .72, fill: '#ffe5ab' })
    })
    return layers(h('g', { className: 'df-sand-grains' }, grains),
      h('g', null, dashedTrail(React, duneCrest, '#ffe5a6', 2.15), dashedTrail(React, duneCrest, '#fff1cd', .72)))
  }
  if (scene === 'rain') {
    // Rain falls mostly in the upper plane; reflected light breaks into short
    // horizontal facets that line up with the towers in the painting.
    const rainStrokes = Array.from({ length: 44 }, (_, i) => {
      const x = (i * 137) % 645, y = (i * 59) % 190 - 20
      return 'M' + x + ' ' + y + 'l-2 9'
    }).join(' ')
    const reflections = [[270,'#ff799e'],[334,'#62e4fa'],[383,'#ff8aba'],[406,'#7fdfff'],[450,'#7decff'],[483,'#ff82ae'],[513,'#ffc38c']] as const
    const shimmer = reflections.map(([cx, color], column) => {
      const marks = Array.from({ length: 12 }, (_, row) => {
        const x = cx + ((row * 7 + column * 3) % 17 - 8) * (row / 17)
        const y = 179 + row * 3.4 + row * row * .1
        const width = 1.6 + row * .66 + (row * 5 % 6)
        return 'M' + (x - width / 2).toFixed(1) + ' ' + y.toFixed(1) + 'h' + width.toFixed(1)
      }).join(' ')
      return h('path', { key: cx, d: marks, stroke: color, strokeWidth: 1.35, strokeLinecap: 'round', fill: 'none' })
    })
    return layers(h('path', { className: 'df-harbour-rain', d: rainStrokes, fill: 'none', stroke: '#abcddb', strokeWidth: .5 }),
      h('g', null, ...shimmer))
  }
  const rings = (color: string, width: number) => h('g', { fill: 'none', stroke: color, strokeWidth: width },
    h('ellipse', { cx: 331, cy: 201, rx: 53, ry: 6.2 }),
    h('ellipse', { cx: 331, cy: 201, rx: 43, ry: 4.6, opacity: .62 }))
  return layers(h('g', { className: 'df-jade-ripples' }, rings('#e8ffdf', .62)),
    h('g', null, rings('#f2ffe1', 1.8), line('M289 198q32-7 63-1', '#284f47', .75, .8)))
}

const glint: Record<Scene, string> = {
  atlas: '#b3edff', aurora: '#9bffcf', orbit: '#ffd4ae', dunes: '#ffe0a0', rain: '#9cdbff', lotus: '#f5ffe7',
}

// Portrait panes should keep the subject in frame (especially the narrow crescent).
const focusX: Record<Scene, number> = { atlas: 355, aurora: 355, orbit: 454, dunes: 421, rain: 410, lotus: 398 }

export function dfCreateScenePlate(React: ReactRuntime) {
  return React.memo(function FishPlate({ scene, className, align = 'xMidYMid slice', live = false }: PlateProps) {
    const id = 'df-scene-glint-' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
    const h = React.createElement
    const ref = React.useRef<SVGSVGElement>(null)
    React.useLayoutEffect(() => {
      const node = ref.current
      if (!live || !node || typeof ResizeObserver === 'undefined') return
      const crop = (width: number, height: number) => {
        if (width <= 0 || height <= 0) return
        const span = Math.min(600, 300 * width / height)
        const left = Math.min(600 - span, Math.max(0, focusX[scene] - span / 2))
        node.setAttribute('viewBox', left + ' 0 ' + span + ' 300')
      }
      const rect = node.getBoundingClientRect()
      crop(rect.width, rect.height)
      const observer = new ResizeObserver(entries => {
        const box = entries[0]?.contentRect
        if (box) crop(box.width, box.height)
      })
      observer.observe(node)
      return () => observer.disconnect()
    }, [scene, live])
    const artwork = h('g', { className: 'df-scene-print' },
      h('image', { key: scene, href: paintings[scene], width: 600, height: 300, preserveAspectRatio: 'none' }))
    return h('svg', { className, ref, 'data-df-painting': scene, viewBox: '0 0 600 300', preserveAspectRatio: align, 'aria-hidden': true, focusable: false },
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
.fish-backdrop, .fish-backdrop[data-home="true"],
body[data-ds-dark-theme] .fish-backdrop, body[data-ds-dark-theme] .fish-backdrop[data-home="true"] {
  opacity: 1;
}
.fish-backdrop {
  --df-weather-time: 29s;
  --df-rain-time: 3.6s;
  --df-print-opacity: .24;
  mask-image: linear-gradient(90deg, #000 0%, rgb(0 0 0 / .4) 23%, rgb(0 0 0 / .28) 53%, rgb(0 0 0 / .55) 80%, #000 100%);
}
.fish-backdrop[data-home="true"] {
  --df-print-opacity: .7;
  mask-image: radial-gradient(ellipse at 43% 44%, rgb(0 0 0 / .38) 9%, rgb(0 0 0 / .7) 55%, #000 91%);
}
body[data-ds-dark-theme] .fish-backdrop { --df-print-opacity: .46; }
body[data-ds-dark-theme] .fish-backdrop[data-home="true"] { --df-print-opacity: .92; }
.fish-backdrop .df-scene-print { opacity: var(--df-print-opacity); }
.df-scene-arrival, .df-scene-weather { pointer-events: none; }
.df-scene-arrival { opacity: 0; transform-box: view-box; }
.df-scene-arrival[data-df-arrival="lotus"] { transform-origin: 55.17% 67%; }
.df-scene-arrival[data-df-arrival="rain"] { transform-origin: 70% 59.7%; }
.df-scene-arrival[data-df-arrival="atlas"] [data-df-sweep]:last-child { opacity: .13; }
.df-scene-weather { opacity: 0; }
html[data-fish-pace="flow"] .fish-backdrop { --df-weather-time: 12s; --df-rain-time: 1.5s; }
@media (prefers-reduced-motion: no-preference) {
  html:not(.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused]) :is(.fish-cover,.fish-backdrop) .df-scene-print > image {
    transform-box: fill-box;
    transform-origin: center;
    animation: df-scene-develop 380ms cubic-bezier(.22,.72,.2,1);
  }
  html:not([data-fish-pace="still"]) .df-scene-weather { opacity: .75; }
  .df-canyon-tracer { animation: df-canyon-current var(--df-weather-time) linear infinite; }
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
@keyframes df-canyon-current { from {stroke-dashoffset:1;} to {stroke-dashoffset:-99;} }
@keyframes df-polar-silk { from {opacity:.23;transform:translate(-2px,1px);} to {opacity:.88;transform:translate(3px,-2px);} }
@keyframes df-starlight { from {opacity:.19;} to {opacity:.83;} }
@keyframes df-sand-whisper { 0% {opacity:0;transform:translate(-6px,3px);} 28%,65% {opacity:.75;} 100% {opacity:0;transform:translate(12px,-4px);} }
@keyframes df-harbour-rain { 0% {opacity:0;transform:translate(2px,-8px);} 14%,79% {opacity:.6;} 100% {opacity:0;transform:translate(-2px,10px);} }
@keyframes df-jade-ripple { 0% {opacity:0;transform:scale(.58);} 25% {opacity:.8;} 100% {opacity:0;transform:scale(1.38);} }
`
