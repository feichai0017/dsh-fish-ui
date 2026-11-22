import { portraitColumns, portraitGrid } from './whale-girl-dots'

const portraitRows = portraitGrid.length
const wordColumns = 140
const wordRows = 58
const levels = 16
const tau = Math.PI * 2
type Dot = { x: number; y: number; tone: number }
type Portrait = { dots: Dot[]; highlights: Dot[] }

// Use the original dark-theme paper cut: the unprinted interior of the face
// and apron becomes light ink, and the dark hair is left open to the scene.
function readPortraits() {
  const light: Portrait = { dots: [], highlights: [] }
  const dark: Portrait = { dots: [], highlights: [] }
  const ink = portraitGrid.map(row => Uint8Array.from(row, char => parseInt(char, 16)))
  const firstColumn = ink.map(row => row.findIndex(Boolean))
  const lastColumn = new Int16Array(portraitRows).fill(-1)
  const firstRow = new Int16Array(portraitColumns).fill(portraitRows)
  const lastRow = new Int16Array(portraitColumns).fill(-1)
  for (let y = 0; y < portraitRows; y++) {
    for (let x = 0; x < portraitColumns; x++) {
      if (ink[y][x] === 0) continue
      lastColumn[y] = x
      if (firstRow[x] === portraitRows) firstRow[x] = y
      lastRow[x] = y
    }
  }
  for (let y = 0; y < portraitRows; y++) {
    for (let x = 0; x < portraitColumns; x++) {
      const weight = ink[y][x]
      // Restrict the passing light to actual drawn edges. The eyes, mouth,
      // cheeks and surrounding fringe are excluded from the accent pass.
      const outsideFace = ((x - 55) / 19) ** 2 + ((y - 36) / 15) ** 2 > 1
      const edge = outsideFace && (x + 2 * y) % 3 === 0 &&
        Math.max(Math.abs(weight - (ink[y][x - 1] ?? 0)), Math.abs(weight - (ink[y - 1]?.[x] ?? 0))) >= 3
      if (weight) {
        const dot = { x: x + .5, y: y + .5, tone: weight / 15 }
        light.dots.push(dot)
        if (edge) light.highlights.push(dot)
      }
      if (x < firstColumn[y] || x > lastColumn[y] || y < firstRow[x] || y > lastRow[x]) continue
      const tone = 1 - weight / 15
      if (tone < .45) continue
      const dot = { x: x + .5, y: y + .5, tone }
      dark.dots.push(dot)
      if (edge) dark.highlights.push(dot)
    }
  }
  return { light, dark }
}
let portraits: ReturnType<typeof readPortraits> | undefined

let words: Dot[][] | undefined
function wordmark() {
  if (words) return words
  const large = document.createElement('canvas')
  const small = document.createElement('canvas')
  large.width = 4 * wordColumns
  large.height = 4 * wordRows
  small.width = wordColumns
  small.height = wordRows
  const brush = large.getContext('2d')
  const reader = small.getContext('2d', { willReadFrequently: true })
  if (!brush || !reader) return []
  const lines = ['deepseek', 'harness']
  const family = '"Segoe UI", system-ui, sans-serif'
  brush.font = 'italic 700 100px ' + family
  brush.letterSpacing = '6px'
  const widest = Math.max(...lines.map(line => brush.measureText(line).width), 1)
  brush.font = 'italic 700 ' + (large.width * .94 / widest * 100).toFixed(1) + 'px ' + family
  brush.textBaseline = 'middle'
  brush.fillStyle = 'rgba(255,255,255,.92)'
  words = lines.map((line, i) => {
    brush.clearRect(0, 0, large.width, large.height)
    brush.fillText(line, large.width * .02, large.height * (.34 + .4 * i))
    reader.clearRect(0, 0, wordColumns, wordRows)
    reader.drawImage(large, 0, 0, wordColumns, wordRows)
    const data = reader.getImageData(0, 0, wordColumns, wordRows).data
    const dots: Dot[] = []
    for (let n = 0; n < wordColumns * wordRows; n++) {
      const alpha = data[n * 4 + 3] / 255
      if (alpha >= .08) dots.push({ x: n % wordColumns + .5, y: Math.floor(n / wordColumns) + .5, tone: Math.min(1, alpha * 1.25) })
    }
    return dots
  })
  return words
}

function printDots(ctx: CanvasRenderingContext2D, dots: Dot[], dx: number, dy: number, pitch: number,
    radius: number, ink: string, faint: number, solid: number) {
  const paths = Array.from({ length: levels }, () => new Path2D())
  for (const dot of dots) {
    const r = radius * (.82 + .36 * dot.tone)
    const x = dx + dot.x * pitch
    const y = dy + dot.y * pitch
    const path = paths[Math.round(dot.tone * (levels - 1))]
    path.moveTo(x + r, y)
    path.arc(x, y, r, 0, tau)
  }
  ctx.fillStyle = ink
  paths.forEach((path, level) => {
    ctx.globalAlpha = faint + (solid - faint) * level / (levels - 1)
    ctx.fill(path)
  })
  ctx.globalAlpha = 1
}

function smooth(v: number) {
  const t = Math.max(0, Math.min(1, v))
  return t * t * (3 - 2 * t)
}

export const whalePaintEvent = 'df-whale-paint'
export function mountWhale(canvas: HTMLCanvasElement, preview = false) {
  const ctx = canvas.getContext('2d')
  const holder = canvas.parentElement
  if (!ctx || !holder) return () => {}
  portraits ??= readPortraits()
  const root = document.documentElement
  const water = holder.querySelector<HTMLElement>('.dwe-water')
  const content = canvas.closest<HTMLElement>('[data-conversation-content]')
  const media = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)')
  const forcedColors = matchMedia('(forced-colors: active)')
  const events = new AbortController()
  const plate = document.createElement('canvas')
  const printer = plate.getContext('2d')
  if (!printer) return () => {}
  let frame = 0
  let wake: number | undefined
  let composer: Element | null = null
  let w = 0, h = 0, dpr = 1, pitch = 0, portraitRadius = 0
  let plateX = 0, plateY = 0, portraitX = 0, portraitY = 0
  let portrait = portraits.light
  let lightInk = '#9cbfff'
  let lastStart: string | undefined
  let sweepAt = performance.now() + 7000

  function schedule() {
    clearTimeout(wake)
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw)
  }
  function measure() {
    const box = canvas.getBoundingClientRect()
    w = box.width
    h = box.height
    // Keep the cached ink at backing-store resolution through Retina display
    // changes and browser zoom. Bound allocations on exceptionally large surfaces.
    dpr = Math.min(devicePixelRatio || 1, Math.sqrt(16_777_216 / Math.max(1, w * h)))
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    const owner = content?.closest('[data-phase]') || content
    const card = content?.querySelector('[data-composer-card]') || owner?.querySelector('[data-composer-card]') || null
    if (composer !== card) {
      if (composer) size.unobserve(composer)
      if (card) size.observe(card)
      composer = card
    }
    const bounds = composer?.getBoundingClientRect()
    const hasCard = bounds && bounds.width > 160 && !preview
    const limit = hasCard ? Math.min(w, bounds.width) : w * .94
    const center = hasCard ? bounds.left + bounds.width / 2 - box.left : w / 2
    const controls = content?.querySelector('[class*="heroWorkspaceRow"]')?.getBoundingClientRect()
    const cardTop = hasCard ? bounds.top - box.top : 0
    const floor = preview ? h - 4 : cardTop > 24
      ? (controls?.height ? Math.min(cardTop, controls.top - box.top) : cardTop) - 6 : h * .63
    const room = Math.max(0, Math.min(h - 4, floor) - 6)
    const byHeight = room / portraitRows
    const referencePitch = Math.min(9, limit * .94 / (wordColumns + portraitColumns - 30), byHeight)
    const showWords = !preview && (referencePitch >= 3.6 || (w >= 960 && referencePitch >= 3.3))
    // The lettering occupies a smaller grid of its own. Keep a clear gutter
    // beside it, and give the rest of the space above the controls to the face.
    const wordPitch = showWords ? referencePitch * .71 : 0
    const wordWidth = wordColumns * wordPitch
    const wordHeight = wordRows * wordPitch
    const gutter = showWords ? Math.min(32, Math.max(16, limit * .032)) : 0
    const available = showWords ? Math.min(w * .95, limit * 1.055) : limit * .94
    const portraitDX = wordWidth + gutter
    pitch = Math.min(showWords ? referencePitch * 1.23 : 9, byHeight, (available - portraitDX) / portraitColumns)
    portraitRadius = pitch * .315
    const plateW = portraitDX + portraitColumns * pitch
    const plateH = portraitRows * pitch
    const wordY = .57 * plateH - wordHeight / 2
    // Place the cached layer on physical pixel boundaries at rest.
    plateX = Math.round(Math.max(0, Math.min(w - plateW, center - plateW / 2)) * dpr) / dpr
    plateY = Math.round(Math.max(0, preview ? (h - plateH) / 2 : floor - plateH) * dpr) / dpr
    portraitX = plateX + portraitDX
    portraitY = plateY
    if (water) {
      water.style.setProperty('--df-portrait-x', (portraitX + portraitColumns * pitch / 2) + 'px')
      water.style.setProperty('--df-portrait-y', (portraitY + plateH / 2) + 'px')
      water.style.setProperty('--df-portrait-w', (portraitColumns * pitch) + 'px')
      water.style.setProperty('--df-portrait-h', plateH + 'px')
      water.style.setProperty('--df-word-x', (showWords ? plateX + wordWidth / 2 : 0) + 'px')
      water.style.setProperty('--df-word-y', (showWords ? plateY + wordY + wordHeight / 2 : 0) + 'px')
      water.style.setProperty('--df-word-w', wordWidth + 'px')
      water.style.setProperty('--df-word-h', wordHeight + 'px')
    }
    plate.width = Math.ceil(plateW * dpr)
    plate.height = Math.ceil(plateH * dpr)
    if (!plate.width || !plate.height) return schedule()
    printer.setTransform(dpr, 0, 0, dpr, 0, 0)
    const dark = document.body.hasAttribute('data-ds-dark-theme')
    portrait = dark ? portraits.dark : portraits.light
    const mono = forcedColors.matches
    const ink = mono ? 'CanvasText' : dark ? '#f0f6ff' : '#21324a'
    const style = getComputedStyle(canvas)
    const scene = style.getPropertyValue('--df-scene-glow').trim() || '#9cbfff'
    lightInk = 'color-mix(in srgb, ' + scene + ' 50%, ' + (dark ? '#f5fcff' : '#244e86') + ')'
    // Strong dot cores keep the eyes and fringe legible against the scene.
    // Radius stays below half a cell at every weight, preserving the paper gaps.
    printDots(printer, portrait.dots, portraitDX, 0, pitch, portraitRadius, ink, dark ? .13 : .18, dark ? .94 : .97)
    if (showWords) {
      const accent = mono ? ink : style.getPropertyValue('--df-accent').trim() || '#4d6bfe'
      wordmark().forEach((dots, i) => printDots(printer, dots, 0, wordY, wordPitch,
        Math.max(.75, wordPitch * .34), i === 0 ? ink : accent, dark ? .05 : .06, dark ? .435 : .522))
    }
    schedule()
  }

  function draw(now: number) {
    frame = 0
    if (document.hidden || !w || !h) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const start = holder.dataset.dfWhaleStart
    if (!plate.width || !plate.height || (start === undefined && root.hasAttribute('data-df-await-arrival') && !preview)) return
    const moving = !media.matches && !root.matches('.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused]')
    const flow = root.dataset.fishPace === 'flow'
    const quiet = flow ? 5900 : 10200
    const sweepMs = flow ? 1300 : 1740
    if (start !== lastStart) {
      if (start !== undefined) sweepAt = Number(start) + (flow ? 1370 : 1610)
      else if (now - Number(lastStart) < 2900) sweepAt = now + quiet
      lastStart = start
    }
    const progress = start === undefined || !moving ? 1 : smooth((now - Number(start)) / (flow ? 1860 : 2230))
    const height = plate.height / dpr
    const lift = Math.round((1 - progress) * Math.min(14, height * .035) * dpr) / dpr
    ctx.globalAlpha = smooth(progress * 1.5)
    // Copy already-antialiased dots one physical pixel to one physical pixel.
    ctx.resetTransform()
    ctx.drawImage(plate, Math.round(plateX * dpr), Math.round((plateY + lift) * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    if (progress < 1) {
      // Reveal the existing ink top to bottom, without moving individual
      // dots off their grid or quantising their per-cell alpha every frame.
      const front = plateY + lift + height * (1.68 * progress - .02)
      const fade = ctx.createLinearGradient(0, front - height * .63, 0, front)
      fade.addColorStop(0, '#000')
      fade.addColorStop(1, 'transparent')
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = fade
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }
    if (!moving) return
    const cycle = quiet + sweepMs
    const age = now - sweepAt
    const phase = age < 0 ? age : age % cycle
    if (phase >= 0 && phase < sweepMs) {
      const front = phase / sweepMs * 1.32 - .16
      const path = new Path2D()
      for (const dot of portrait.highlights) {
        const distance = Math.abs(.75 * dot.x / portraitColumns + .25 * dot.y / portraitRows - front)
        if (distance >= .14) continue
        const radius = portraitRadius * (.82 + .36 * dot.tone) * smooth(1 - distance / .14)
        const x = portraitX + dot.x * pitch
        const y = portraitY + lift + dot.y * pitch
        path.moveTo(x + radius, y)
        path.arc(x, y, radius, 0, tau)
      }
      ctx.globalAlpha = (flow ? .5 : .36) * progress
      ctx.fillStyle = lightInk
      ctx.fill(path)
      ctx.globalAlpha = 1
    }
    if (progress < 1 || (phase >= 0 && phase < sweepMs)) schedule()
    else wake = window.setTimeout(schedule, phase < 0 ? -phase : cycle - phase)
  }

  const size = new ResizeObserver(measure)
  const physicalBox = typeof ResizeObserverEntry !== 'undefined' && 'devicePixelContentBoxSize' in ResizeObserverEntry.prototype
  size.observe(canvas, { box: physicalBox ? 'device-pixel-content-box' : 'content-box' })
  const layout = new MutationObserver(() => {
    if (!composer?.isConnected) measure()
  })
  if (content?.parentElement) layout.observe(content.parentElement, { childList: true, subtree: true })
  const theme = new MutationObserver(measure)
  theme.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
  theme.observe(root, { attributes: true, attributeFilter: ['data-df-window-scene'] })
  const motion = new MutationObserver(schedule)
  motion.observe(root, { attributes: true, attributeFilter: ['class', 'data-fish-pace', 'data-fish-paused'] })
  for (const event of ['visibilitychange', whalePaintEvent]) document.addEventListener(event, schedule, { signal: events.signal })
  media.addEventListener('change', measure, { signal: events.signal })
  let ripple: Animation | undefined
  const ring = holder.querySelector<HTMLElement>('.dwe-water i')
  if (content && ring && !preview) {
    let lastRipple = -Infinity
    content.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || media.matches || root.matches('.df-off-ripple,.df-off-fishmotion,[data-fish-pace="still"]')) return
      const now = performance.now()
      if (now - lastRipple < 740 || (e.target as Element)?.closest('[data-composer-seat],button')) return
      const box = canvas.getBoundingClientRect()
      if (e.clientY < box.top + box.height * .6) return
      lastRipple = now
      ring.style.left = (e.clientX - box.left) + 'px'
      ring.style.top = (e.clientY - box.top) + 'px'
      ripple?.cancel()
      ripple = ring.animate([{ transform: 'scale(.14)', opacity: .24 }, { transform: 'scale(1.45)', opacity: 0 }],
        { duration: 820, easing: 'ease-out' })
    }, { passive: true, signal: events.signal })
    media.addEventListener('change', () => ripple?.cancel(), { signal: events.signal })
  }
  measure()
  return () => {
    ripple?.cancel()
    events.abort()
    cancelAnimationFrame(frame)
    clearTimeout(wake)
    size.disconnect()
    layout.disconnect()
    theme.disconnect()
    motion.disconnect()
  }
}
