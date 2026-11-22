import { portraitColumns, portraitGrid } from './whale-girl-dots'

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

function portraitInk(ctx: CanvasRenderingContext2D, pitch: number, dark: boolean) {
  const x = pitch * 54, y = pitch * 33
  const ink = ctx.createRadialGradient(x, y, pitch * 7, x, y, pitch * 57)
  ink.addColorStop(0, dark ? '#f2f5f3' : '#263851')
  ink.addColorStop(.43, dark ? '#c7dbeb' : '#314c70')
  ink.addColorStop(.75, dark ? '#98b8d3' : '#476c90')
  ink.addColorStop(1, dark ? '#7694b8' : '#65839e')
  return ink
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
    const limit = hasCard ? Math.min(w, bounds.width) : w
    const center = hasCard ? bounds.left + bounds.width / 2 - box.left : w / 2
    const controls = content?.querySelector('[class*="heroWorkspaceRow"]')?.getBoundingClientRect()
    const cardTop = hasCard ? bounds.top - box.top : 0
    const floor = preview ? h : hasCard
      ? Math.min(cardTop, controls?.height ? controls.top - box.top : cardTop) : h * .63
    // The controls and the figure each occupy their own space. The fractional
    // inset also works when resizing a split pane or showing the settings preview.
    const room = Math.max(0, Math.min(h, floor))
    pitch = Math.min(preview ? 9 : 5.65,
      limit * (preview ? .94 : .76) / portraitColumns, room * (preview ? .95 : .79) / portraitRows)
    portraitRadius = pitch * .336
    const plateW = portraitColumns * pitch
    const plateH = portraitRows * pitch
    const spare = room - plateH
    const top = preview ? spare / 2 : spare - Math.min(58, spare * .43)
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
    const dark = document.body.hasAttribute('data-ds-dark-theme')
    portrait = dark ? portraits.dark : portraits.light
    const mono = forcedColors.matches || contrast.matches
    const ink = forcedColors.matches ? 'CanvasText' : contrast.matches
      ? (dark ? '#eff6ff' : '#182c42') : portraitInk(printer, pitch, dark)
    const style = getComputedStyle(canvas)
    const scene = style.getPropertyValue('--df-scene-glow').trim() || '#9cbfff'
    lightInk = 'color-mix(in srgb, ' + scene + ' 45%, ' + (dark ? '#e4f4fb' : '#365b83') + ')'
    printDots(printer, portrait.dots, pitch, portraitRadius, ink, mono)
    if (!mono) {
      // The original plate ends in a straight horizontal crop across the apron.
      // Feather the last few rows into the painting, below the collar and bow.
      const hem = printer.createLinearGradient(0, plateH * .79, 0, plateH)
      hem.addColorStop(0, '#000')
      hem.addColorStop(.4, 'rgba(0,0,0,.84)')
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
        const hem = 1 - smooth((dot.y / portraitRows - .79) / .21)
        const radius = dotRadius(portraitRadius, dot.tone) * smooth(1 - distance / .14) * hem
        const x = plateX + dot.x * pitch
        const y = plateY + lift + dot.y * pitch
        path.moveTo(x + radius, y)
        path.arc(x, y, radius, 0, tau)
      }
      ctx.globalAlpha = (flow ? .34 : .24) * progress
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
  media.addEventListener('change', schedule, { signal: events.signal })
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
