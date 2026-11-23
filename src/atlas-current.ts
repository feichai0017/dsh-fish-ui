// Both atlas paintings share these banks. Coordinates are on the 600 × 300
// master: the pale shelf runs along the right edge of the deep blue channel.
const shelf = 'M104 305 C131 293 150 282 164 273 S184 261 199 265 C222 272 245 268 265 259 S298 255 306 236 C312 220 307 207 326 205 S360 209 378 198 C392 190 386 180 401 176 S426 159 427 141 C428 130 419 119 435 116 S465 118 478 107 C489 98 481 91 496 81 S519 73 520 57'
const channel = 'M62 308 C95 296 119 283 137 277 S162 262 184 260 S218 271 245 262 C262 257 281 249 288 234 S296 207 315 202 C338 196 365 204 381 182 S412 161 415 142 C416 127 412 117 429 110 S457 113 469 102 S475 85 491 76 S505 63 504 53'

const bends = [
  { x: 265, y: 259, tilt: -18, phase: .33 },
  { x: 381, y: 196, tilt: -27, phase: .60 },
  { x: 436, y: 116, tilt: -12, phase: .84 },
]

export function atlasCurrent(React: typeof import('react')) {
  const h = React.createElement
  return h('g', { className: 'df-atlas-current', fill: 'none', strokeLinecap: 'round', pointerEvents: 'none' },
    h('g', { className: 'df-atlas-stream' },
      h('path', { d: shelf, pathLength: 100, stroke: '#0778b8', strokeWidth: 2.35, opacity: .62 }),
      h('path', { d: shelf, pathLength: 100, stroke: '#f1ffff', strokeWidth: .85 })),
    h('path', { className: 'df-atlas-undertow', d: channel, pathLength: 100,
      stroke: '#83dcff', strokeWidth: .65 }),
    bends.map(({ x, y, tilt, phase }) =>
      h('g', { key: x, transform: `translate(${x} ${y}) rotate(${tilt})` },
        h('g', { className: 'df-atlas-eddy', style: { animationDelay: `calc(var(--df-atlas-period) * ${phase - 1})` } },
          h('path', { d: 'M-7 1.4 Q-2 -1.6 3.5 -.65 T8 -1.25', stroke: '#ecffff', strokeWidth: .8 }),
          h('path', { d: 'M-4.5 3.1 Q-.8 1.2 3 1.65', stroke: '#72caff', strokeWidth: .6 })))))
}

export const atlasCurrentCss = `
.df-atlas-current { display: none; --df-atlas-period: calc(var(--df-weather-time, 18s) * .64); }
@media (prefers-reduced-motion: no-preference) and (prefers-contrast: no-preference) and (forced-colors: none) {
  :root:not(.df-off-fishmotion,.df-off-wave,[data-fish-pace="still"],[data-fish-paused]) .fish-backdrop[data-home="true"] .df-atlas-current {
    display: inline;
    --df-atlas-run: df-atlas-slip; --df-atlas-spread: df-atlas-eddy;
  }
  .df-atlas-stream, .df-atlas-undertow {
    stroke-dasharray: 6 110;
    animation: var(--df-atlas-run, none) var(--df-atlas-period) linear infinite;
  }
  .df-atlas-undertow {
    stroke-dasharray: 3 .9 .7 111;
    animation-delay: calc(var(--df-atlas-period) * -.42);
  }
  .df-atlas-eddy { transform-origin: 0 0; animation: var(--df-atlas-spread, none) var(--df-atlas-period) linear infinite; }
  @keyframes df-atlas-slip {
    0% { stroke-dashoffset: 7; opacity: 0; }
    9%, 82% { opacity: .93; }
    100% { stroke-dashoffset: -103; opacity: 0; }
  }
  @keyframes df-atlas-eddy {
    0% { opacity: 0; transform: scale(.25); }
    4% { opacity: .85; }
    17% { opacity: 0; transform: scale(1.48,1.9); }
    100% { opacity: 0; transform: scale(1.48,1.9); }
  }
}
`
