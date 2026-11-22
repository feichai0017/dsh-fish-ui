import { portraitColumns, portraitGrid } from './whale-girl-dots'
import { paintDaylightWake } from './daylight-wake'

const portraitRows = portraitGrid.length
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
      if (tone === 0) continue
      const dot = { x: x + .5, y: y + .5, tone }
      dark.dots.push(dot)
      if (edge) dark.highlights.push(dot)
    }
  }
  return { light, dark }
}
let portraits: ReturnType<typeof readPortraits> | undefined

function printDots(ctx: CanvasRenderingContext2D, dots: Dot[], pitch: number,
    radius: number, ink: string | CanvasGradient, mono: boolean) {
  const paths = Array.from({ length: levels }, () => new Path2D())
  for (const dot of dots) {
    const r = dotRadius(radius, dot.tone)
    const x = dot.x * pitch
    const y = dot.y * pitch
    const path = paths[Math.round(dot.tone * (levels - 1))]
    path.moveTo(x + r, y)
    path.arc(x, y, r, 0, tau)
  }
  ctx.fillStyle = ink
  paths.forEach((path, level) => {
    const weight = level / (levels - 1)
    ctx.globalAlpha = mono ? 1 : .12 + .84 * weight
    ctx.fill(path)
  })
  ctx.globalAlpha = 1
}

// The line weight carries the hair and eye contours on bright and dark paper.
function dotRadius(radius: number, weight: number) {
  return radius * (.44 + .76 * Math.sqrt(weight))
}

function nightInk(ctx: CanvasRenderingContext2D, pitch: number) {
  const x = pitch * 54, y = pitch * 33
  const ink = ctx.createRadialGradient(x, y, pitch * 7, x, y, pitch * 57)
  ink.addColorStop(0, '#f2f5f3')
  ink.addColorStop(.43, '#c7dbeb')
  ink.addColorStop(.75, '#98b8d3')
  ink.addColorStop(1, '#7694b8')
  return ink
}

type RGB = readonly [number, number, number]
const clamp = (value: number) => Math.max(0, Math.min(1, value))

function mixInk(a: RGB, b: RGB, t: number): RGB {
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)]
}

// A translucent impression of the original grid gives the hair its broad
// shape. A second pass in the same inks resolves the eyes, collar and fringe.
function makeDaylightPrint(dots: Dot[]) {
  const underprint = document.createElement('canvas')
  underprint.width = portraitColumns
  underprint.height = portraitRows
  const brush = underprint.getContext('2d')
  const pixels = brush?.createImageData(portraitColumns, portraitRows)
  const marks = dots.map(dot => {
    const x = dot.x - .5, y = dot.y - .5, tone = dot.tone
    const face = Math.max(0, 1 - (((x - 55) / 19) ** 2 + ((y - 35) / 12) ** 2))
    const shoulder = clamp((y - 48) / 15) * clamp((Math.abs(x - 55) - 8) / 20)
    const ribbon = Math.max(0, 1 - ((x - 55) / 13) ** 2) * clamp((y - 50) / 4) * clamp((65 - y) / 6)
    const teal = clamp(clamp((x - 52) / 33) * .65 + clamp((21 - y) / 16) * .22)
    let color = mixInk([24, 66, 110], [20, 91, 120], teal)
    color = mixInk(color, [66, 105, 128], shoulder * .44)
    color = mixInk(color, [14, 34, 72], Math.max(face * .98, ribbon * .64))
    if (pixels) {
      const i = (y * portraitColumns + x) * 4
      pixels.data.set(color, i)
      pixels.data[i + 3] = Math.round(255 * .52 * tone ** .81)
    }
    return { x: dot.x, y: dot.y, radius: .125 + .376 * tone ** .78,
      fill: 'rgba(' + color.join(',') + ',' + (.36 + .64 * Math.sqrt(tone)) + ')' }
  })
  if (pixels) brush?.putImageData(pixels, 0, 0)
  return { underprint, marks }
}
let dayPrint: ReturnType<typeof makeDaylightPrint> | undefined

function printDaylight(ctx: CanvasRenderingContext2D, dots: Dot[], pitch: number) {
  dayPrint ??= makeDaylightPrint(dots)
  ctx.drawImage(dayPrint.underprint, 0, 0, pitch * portraitColumns, pitch * portraitRows)
  for (const mark of dayPrint.marks) {
    ctx.fillStyle = mark.fill
    ctx.beginPath()
    ctx.arc(mark.x * pitch, mark.y * pitch, mark.radius * pitch, 0, tau)
    ctx.fill()
  }
}

function smooth(v: number) {
  const t = clamp(v)
  return t * t * (3 - 2 * t)
}

const waveBend = (x: number) => .065 * Math.sin(tau * x - .8) - .07 * (x - .5)
let waveMask: HTMLCanvasElement | undefined

// Only the soft reveal mask is resampled. The finished portrait stays on its
// physical pixel grid. The sparse crest particles use the same wave equation.
function makeWaveMask() {
  const mask = document.createElement('canvas')
  mask.width = 150
  mask.height = 300
  const brush = mask.getContext('2d')
  if (!brush) return mask
  const pixels = brush.createImageData(mask.width, mask.height)
  for (let x = 0; x < mask.width; x++) {
    const bend = waveBend((x + .5) / mask.width)
    for (let y = 0; y < mask.height; y++) {
      const depth = (y + .5) / mask.height * 2.5 - .16 - bend
      pixels.data[(y * mask.width + x) * 4 + 3] = Math.round(255 * smooth(depth / .19))
    }
  }
  brush.putImageData(pixels, 0, 0)
  return mask
}

function revealDaylight(ctx: CanvasRenderingContext2D, highlights: Dot[], x: number, y: number,
    pitch: number, progress: number) {
  const width = pitch * portraitColumns, height = pitch * portraitRows
  const front = 1.14 - 1.53 * progress
  waveMask ??= makeWaveMask()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(waveMask, x, y + (front - .16) * height, width, height * 2.5)
  ctx.globalCompositeOperation = 'source-over'

  const sea = new Path2D(), pearl = new Path2D()
  for (const dot of highlights) {
    const bend = waveBend(dot.x / portraitColumns)
    const across = (dot.y / portraitRows - front - bend) / .24
    if (across <= -.34 || across >= 1) continue
    const settle = smooth(across + .22)
    const hem = 1 - smooth((dot.y / portraitRows - .81) / .19)
    const radius = (.20 + .23 * dot.tone) * pitch * Math.sin(Math.PI * (across + .34) / 1.34) * hem
    const drift = (1 - settle) * pitch
    const cx = x + dot.x * pitch + drift * 2.8 * Math.sin(dot.y * .18 + dot.x * .07)
    const cy = y + dot.y * pitch + drift * (3.6 + Math.cos(dot.x * .16))
    const path = across < .18 ? sea : pearl
    path.moveTo(cx + radius, cy)
    path.arc(cx, cy, radius, 0, tau)
  }
  ctx.fillStyle = '#369cae'
  ctx.fill(sea)
  ctx.fillStyle = '#d2f7f4'
  ctx.fill(pearl)
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
  const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)')
  const forcedColors = matchMedia('(forced-colors: active)')
  const contrast = matchMedia('(prefers-contrast: more)')
  const events = new AbortController()
  const plate = document.createElement('canvas')
  const printer = plate.getContext('2d')
  if (!printer) return () => {}
  let frame = 0
  let wake: number | undefined
  let composer: Element | null = null
  let w = 0, h = 0, dpr = 1, pitch = 0, portraitRadius = 0
  let plateX = 0, plateY = 0
  let portrait = portraits.light
  let daylight = true
  let lightInk: string | CanvasGradient = '#9cbfff'
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
    const limit = hasCard ? Math.min(w, bounds.width) : w
    const center = hasCard ? bounds.left + bounds.width / 2 - box.left : w / 2
    const controls = content?.querySelector('[class*="heroWorkspaceRow"]')?.getBoundingClientRect()
    const cardTop = hasCard ? bounds.top - box.top : 0
    const floor = preview ? h : hasCard
      ? Math.min(cardTop, controls?.height ? controls.top - box.top : cardTop) : h * .63
    // The controls and the figure each occupy their own space. The fractional
    // inset also works when resizing a split pane or showing the settings preview.
    const room = Math.max(0, Math.min(h, floor))
    const dark = document.body.hasAttribute('data-ds-dark-theme')
    const mono = forcedColors.matches || contrast.matches
    daylight = !dark && !mono
    pitch = daylight && !preview
      ? Math.min(limit * .85 / portraitColumns, room * .87 / portraitRows)
      : Math.min(preview ? 9 : 5.65, limit * (preview ? .94 : .76) / portraitColumns,
        room * (preview ? .95 : .79) / portraitRows)
    portraitRadius = pitch * .336
    const plateW = portraitColumns * pitch
    const plateH = portraitRows * pitch
    const spare = room - plateH
    const top = preview ? spare / 2 : daylight ? spare * .54 : spare - Math.min(58, spare * .43)
    plateX = Math.round(Math.max(0, Math.min(w - plateW, center - plateW / 2)) * dpr) / dpr
    plateY = Math.round(top * dpr) / dpr
    if (water) {
      water.style.setProperty('--df-portrait-x', (plateX + plateW / 2) + 'px')
      water.style.setProperty('--df-portrait-y', (plateY + plateH / 2) + 'px')
      water.style.setProperty('--df-portrait-w', plateW + 'px')
      water.style.setProperty('--df-portrait-h', plateH + 'px')
    }
    plate.width = Math.ceil(plateW * dpr)
    plate.height = Math.ceil(plateH * dpr)
    if (!plate.width || !plate.height) return schedule()
    printer.setTransform(dpr, 0, 0, dpr, 0, 0)
    portrait = dark ? portraits.dark : portraits.light
    const style = getComputedStyle(canvas)
    const scene = style.getPropertyValue('--df-scene-glow').trim() || '#9cbfff'
    lightInk = 'color-mix(in srgb, ' + scene + ' 45%, ' + (dark ? '#e4f4fb' : '#365b83') + ')'
    if (daylight) {
      printDaylight(printer, portrait.dots, pitch)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const gel = ctx.createLinearGradient(plateX, plateY, plateX + plateW, plateY + plateH)
      gel.addColorStop(0, '#8bd7e4')
      gel.addColorStop(.46, '#b9f4ec')
      gel.addColorStop(.72, '#58afce')
      gel.addColorStop(1, lightInk)
      lightInk = gel
    } else {
      const ink = forcedColors.matches ? 'CanvasText' : contrast.matches
        ? (dark ? '#eff6ff' : '#182c42') : nightInk(printer, pitch)
      printDots(printer, portrait.dots, pitch, portraitRadius, ink, mono)
    }
    if (!mono) {
      // The original plate ends in a straight horizontal crop across the apron.
      // Feather the last few rows into the painting, below the collar and bow.
      const hem = printer.createLinearGradient(0, plateH * (daylight ? .81 : .79), 0, plateH)
      hem.addColorStop(0, '#000')
      if (daylight) hem.addColorStop(.5, 'rgba(0,0,0,.82)')
      else hem.addColorStop(.4, 'rgba(0,0,0,.84)')
      hem.addColorStop(1, 'transparent')
      printer.globalCompositeOperation = 'destination-in'
      printer.fillStyle = hem
      printer.fillRect(0, 0, plateW, plateH)
      printer.globalCompositeOperation = 'source-over'
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
    const moving = !media.matches && !(daylight && reducedTransparency.matches)
      && !root.matches('.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused]')
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
    if (progress < 1 && daylight) {
      revealDaylight(ctx, portrait.highlights, plateX, plateY + lift, pitch, progress)
    } else if (progress < 1) {
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
    const wakeAge = now - Number(start)
    const wakeActive = daylight && start !== undefined && wakeAge < 2850 && !root.classList.contains('df-off-wave')
    if (wakeActive) paintDaylightWake(ctx, plateX, plateY, plate.width / dpr, height, wakeAge)
    const cycle = quiet + sweepMs
    const age = now - sweepAt
    const phase = age < 0 ? age : age % cycle
    if (phase >= 0 && phase < sweepMs) {
      const front = phase / sweepMs * 1.32 - .16
      const path = new Path2D()
      for (const dot of portrait.highlights) {
        const distance = Math.abs(.75 * dot.x / portraitColumns + .25 * dot.y / portraitRows - front)
        if (distance >= .14) continue
        const hem = 1 - smooth((dot.y / portraitRows - .79) / .21)
        const radius = dotRadius(portraitRadius, dot.tone) * smooth(1 - distance / .14) * hem
        const x = plateX + dot.x * pitch
        const y = plateY + lift + dot.y * pitch
        path.moveTo(x + radius, y)
        path.arc(x, y, radius, 0, tau)
      }
      ctx.globalAlpha = (daylight ? .78 : flow ? .34 : .24) * progress
      ctx.fillStyle = lightInk
      ctx.fill(path)
      ctx.globalAlpha = 1
    }
    if (progress < 1 || wakeActive || (phase >= 0 && phase < sweepMs)) schedule()
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
  media.addEventListener('change', schedule, { signal: events.signal })
  reducedTransparency.addEventListener('change', schedule, { signal: events.signal })
  contrast.addEventListener('change', measure, { signal: events.signal })
  forcedColors.addEventListener('change', measure, { signal: events.signal })
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
