// A humpback in profile. Sample its outline, ventral grooves and far flipper
// on the same grid, so the resting illustration is the last frame of the dive.
const width = 320
const height = 142
const pitch = 2.35
const tau = Math.PI * 2
const body = 'M59 76C78 74 94 64 111 58C120 52 120 41 117 36C126 37 131 44 133 48C175 31 207 23 239 22C265 21 290 25 303 32Q310 36 306 41C293 65 263 82 230 89C191 97 157 91 129 87C102 83 78 85 62 87C50 98 35 105 14 103C25 99 32 89 40 84C26 81 15 65 9 48C28 61 47 59 59 76Z'
const flipper = 'M221 67C213 83 192 109 163 123Q152 128 145 127C153 120 160 110 165 100C175 84 188 73 200 68Z'
type Dot = { x: number; y: number; tone: number; offset: number }
let cells: Dot[] | undefined
function whaleCells() {
  if (cells) return cells
  const sample = document.createElement('canvas')
  sample.width = width
  sample.height = height
  const brush = sample.getContext('2d', { willReadFrequently: true })
  if (!brush) return []
  const outline = new Path2D(body)
  const shade = brush.createLinearGradient(0, 22, 14, 102)
  shade.addColorStop(0, '#ffffff')
  shade.addColorStop(.35, '#d8d8d8')
  shade.addColorStop(.62, '#767676')
  shade.addColorStop(1, '#a4a4a4')
  brush.fillStyle = '#777'
  brush.fill(new Path2D('M223 66Q235 85 231 104Q219 104 198 79Z'))
  brush.fillStyle = shade
  brush.fill(outline)
  brush.save()
  brush.clip(outline)
  brush.lineWidth = 1.65
  brush.strokeStyle = '#f9f9f9'
  brush.stroke(outline)
  brush.strokeStyle = '#676767'
  brush.lineWidth = 2.8
  brush.stroke(new Path2D('M308 36C292 48 266 55 242 55'))
  for (let i = 0; i < 5; i++) {
    const groove = new Path2D()
    groove.moveTo(303 - i * 2, 42 + i * 2)
    groove.quadraticCurveTo(263 - i, 69 + i * 4, 216 - i * 6, 65 + i * 5)
    brush.strokeStyle = '#dcdcdc'
    brush.lineWidth = 1.45
    brush.stroke(groove)
  }
  brush.fillStyle = '#2b2b2b'
  brush.beginPath()
  brush.ellipse(241, 52, 3.9, 2.6, -.18, 0, tau)
  brush.fill()
  brush.restore()
  const fin = new Path2D(flipper)
  const finLight = brush.createLinearGradient(190, 70, 205, 95)
  finLight.addColorStop(0, '#666')
  finLight.addColorStop(.52, '#bbb')
  finLight.addColorStop(1, '#fff')
  brush.fillStyle = finLight
  brush.fill(fin)
  const pixels = brush.getImageData(0, 0, width, height).data
  cells = []
  for (let y = pitch / 2; y < height; y += pitch) {
    for (let x = pitch / 2; x < width; x += pitch) {
      const i = (Math.floor(y) * width + Math.floor(x)) * 4
      if (pixels[i + 3] < 110) continue
      const tone = pixels[i] / 255
      const offset = .24 * (1 - x / width) + .13 * y / height + .035 * Math.sin(x * .12 + y * .08)
      cells.push({ x, y, tone, offset })
    }
  }
  return cells
}

function smooth(value: number) {
  const v = Math.min(1, Math.max(0, value))
  return v * v * (3 - 2 * v)
}

export const whalePaintEvent = 'df-whale-paint'
export function mountWhale(canvas: HTMLCanvasElement, preview = false) {
  const ctx = canvas.getContext('2d')
  const holder = canvas.parentElement
  if (!ctx || !holder) return () => {}
  const dots = whaleCells()
  const content = canvas.closest<HTMLElement>('[data-conversation-content]')
  const root = document.documentElement
  const media = matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)')
  const events = new AbortController()
  let frame = 0
  let composer: Element | null = null
  let left = 0, top = 0, scale = 1, w = 0, h = 0, dpr = 1
  let colors: string[] = []
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw)
  }
  function measure() {
    const box = canvas.getBoundingClientRect()
    w = box.width
    h = box.height
    dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    // The composer can mount after the frame and can live beside the scroll body.
    const owner = content?.closest('[data-phase]') || content
    const card = content?.querySelector('[data-composer-card]') || owner?.querySelector('[data-composer-card]') || null
    if (composer !== card) {
      if (composer) size.unobserve(composer)
      if (card) size.observe(card)
      composer = card
    }
    const bounds = composer?.getBoundingClientRect()
    const ceiling = preview ? 4 : Math.min(44, h * .085)
    const floor = bounds?.width && bounds.top > box.top + 16 ? Math.min(h, bounds.top - box.top - Math.min(46, h * .09)) : h * (preview ? .98 : .62)
    const room = Math.max(0, floor - ceiling)
    scale = Math.max(0, Math.min((w * (preview ? .78 : .82)) / width, (room * .92) / height, preview ? 1.55 : 2.28))
    const center = bounds?.width ? bounds.left + bounds.width / 2 - box.left : w / 2
    left = Math.max(0, Math.min(w - width * scale, center - width * scale / 2))
    top = ceiling + (room - height * scale) * .59
    const ink = getComputedStyle(canvas)
    colors = Array.from({length: 6}, (_, i) => ink.getPropertyValue('--df-whale-' + i).trim() || '#98c8ef')
    schedule()
  }
  function draw(now: number) {
    frame = 0
    if (!ctx || document.hidden || !w || !h) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    if (scale < .12) return
    const start = holder.dataset.dfWhaleStart
    if (start === undefined && root.hasAttribute('data-df-await-arrival') && !preview) return
    const progress = start === undefined || media.matches ? 1 : Math.min(1, Math.max(0, (now - Number(start)) / 2230))
    const batches = Array.from({length: 6}, () => new Path2D())
    ctx.translate(left, top)
    ctx.scale(scale, scale)
    for (const dot of dots) {
      const rise = progress === 1 ? 1 : smooth((progress - dot.offset) / .63)
      if (rise < .014) continue
      const depth = 1 - rise
      const x = dot.x - depth * (5 + 3 * Math.sin(dot.y * .09))
      const y = dot.y + depth * (11 + dot.y * .095)
      const r = (.39 + dot.tone * .67) * (.22 + .78 * rise)
      const light = Math.min(5, Math.floor((.13 + dot.tone * .86) * rise * 6))
      const path = batches[light]
      path.moveTo(x + r, y)
      path.arc(x, y, r, 0, tau)
    }
    for (let i = 0; i < batches.length; i++) {
      ctx.fillStyle = colors[i]
      ctx.fill(batches[i])
    }
    if (progress < 1) schedule()
  }
  const size = new ResizeObserver(measure)
  size.observe(canvas)
  const layout = new MutationObserver(() => {
    if (!composer?.isConnected) measure()
  })
  if (content?.parentElement) layout.observe(content.parentElement, { childList: true, subtree: true })
  const theme = new MutationObserver(measure)
  theme.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
  theme.observe(root, { attributes: true, attributeFilter: ['data-df-window-scene'] })
  for (const event of ['visibilitychange', whalePaintEvent]) document.addEventListener(event, schedule, { signal: events.signal })
  media.addEventListener('change', schedule, { signal: events.signal })
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
  return () => { ripple?.cancel(); events.abort(); cancelAnimationFrame(frame); size.disconnect(); layout.disconnect(); theme.disconnect() }
}
