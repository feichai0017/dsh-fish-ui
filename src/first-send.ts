// The receipt flips promptAttempted only after the host accepts a local prompt.
// An empty Enter, a rejected prompt and replayed history cannot start a wake.
export interface FirstSendSession {
  getSnapshot(): { blank: boolean; promptAttempted: boolean; promptError?: unknown }
  subscribe(notify: () => void): () => void
}

interface Shoulder { x: number; y: number; pitch: number }
const svgNS = 'http://www.w3.org/2000/svg'
const quietMedia = '(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (forced-colors: active), (prefers-contrast: more)'
const off = '.df-off-hero, .df-off-fishmotion, .df-off-wave, [data-fish-pace="still"], [data-fish-paused]'
const origins = new WeakMap<FirstSendSession, HTMLElement>()

function shoulderIn(pane: HTMLElement): Shoulder | undefined {
  const welcome = pane.querySelector('.dwe-frame[data-df-welcome="true"]')
  const water = welcome?.querySelector<HTMLElement>('.dwe-water')
  const canvas = welcome?.querySelector('canvas.dwe-whale')
  if (!water || !canvas || !canvas.getClientRects().length) return
  const size = (prop: string) => parseFloat(water.style.getPropertyValue('--df-portrait-' + prop))
  const pitch = size('w') / 104
  if (!(pitch > 0)) return
  const rect = canvas.getBoundingClientRect()
  // Grid (96, 62), on the outside of the original whale-girl's right shoulder.
  return { x: rect.left + size('x') - size('w') / 2 + 96.5 * pitch,
    y: rect.top + size('y') - size('h') / 2 + 62.5 * pitch, pitch }
}

function playWake(pane: HTMLElement, shoulder: Shoulder) {
  const card = pane.querySelector<HTMLElement>('[data-composer-card]')?.getBoundingClientRect()
  if (!card?.width || !pane.getClientRects().length) return
  const box = pane.getBoundingClientRect()
  const x = shoulder.x - box.left, y = shoulder.y - box.top
  const lip = card.top - box.top + 1.5, right = card.right - box.left - 2
  const join = card.left - box.left + card.width * .7
  const svg = document.createElementNS(svgNS, 'svg')
  svg.classList.add('df-first-send')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2'
  const track = document.createElementNS(svgNS, 'path')
  track.setAttribute('d', `M ${x} ${y} C ${x + 25} ${y + (lip - y) * .62}, ${join - 49} ${lip}, ${join} ${lip} H ${right - 15} Q ${right} ${lip}, ${right} ${lip + 15}`)
  track.setAttribute('fill', 'none')
  track.setAttribute('pathLength', '100')
  track.setAttribute('stroke-linecap', 'round')
  svg.append(track)
  pane.append(svg)
  const duration = 770
  const animations: Animation[] = []
  function streak(path: SVGPathElement, color: string, width: number, span: number) {
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', String(width))
    path.setAttribute('stroke-dasharray', span + ' 120')
    animations.push(path.animate([
      { strokeDashoffset: String(span), opacity: 0 },
      { opacity: .8, offset: .23 },
      { opacity: .92, offset: .82 },
      { strokeDashoffset: '-100', opacity: 0 },
    ], { duration, easing: 'cubic-bezier(.24,.02,.28,1)', fill: 'both' }))
  }
  const lipLight = track.cloneNode(false) as SVGPathElement
  svg.append(lipLight)
  const night = document.body.hasAttribute('data-ds-dark-theme')
  streak(track, night ? '#4fafff' : '#3978c6', 2.1, 11)
  streak(lipLight, night ? '#d5fcff' : '#53b5cf', 1.05, 3.5)

  // A few printed dots from four shoulder rows converge on the same fine edge.
  const dots = [[0,-2],[1,-2],[-2,-1],[0,-1],[1,0],[2,0],[-1,1],[1,1],[3,1]]
  const length = track.getTotalLength()
  const samples = Array.from({ length: 25 }, (_, i) => track.getPointAtLength(length * i / 24))
  dots.forEach(([dx, dy], i) => {
    const dot = document.createElementNS(svgNS, 'circle')
    dot.setAttribute('r', String(Math.max(1, Math.min(2.1, shoulder.pitch * .31))))
    dot.setAttribute('fill', i % 3 === 0 ? (night ? '#ddfbff' : '#c3f2fa') : (night ? '#7ed1ff' : '#297cad'))
    svg.append(dot)
    animations.push(dot.animate(samples.map((point, n) => {
      const t = n / 24, spread = (1 - t) ** 2
      const px = point.x + dx * shoulder.pitch * spread
      const py = point.y + dy * shoulder.pitch * spread + Math.sin(t * Math.PI * 2) * dx * spread
      return { transform: `translate(${px}px,${py}px)`, opacity: Math.min(t * 10, 1, (1 - t) * 5) }
    }), { duration: duration - 80, delay: i * 8, easing: 'cubic-bezier(.24,.02,.28,1)', fill: 'both' }))
  })
  const settings = new MutationObserver(() => {
    if (document.documentElement.matches(off)) stop()
  })
  settings.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-fish-pace', 'data-fish-paused'] })
  function stop() {
    settings.disconnect()
    animations.forEach(a => a.cancel())
    svg.remove()
  }
  animations[0].finished.then(stop, () => {})
  // A very fast response can start the existing scene arrival immediately.
  return { stop, arrive: () => animations.forEach(a => a.updatePlaybackRate(1.8)) }
}

export function watchFirstSend(pane: HTMLElement, session: FirstSendSession) {
  if (!session.getSnapshot().blank) return
  const events = new AbortController()
  const motion = matchMedia(quietMedia)
  let shoulder: Shoulder | undefined
  let wake: ReturnType<typeof playWake>
  let raf = 0
  let textArrived = false
  const enabled = () => !document.hidden && !motion.matches && !document.documentElement.matches(off)
  const options = { capture: true, passive: true, signal: events.signal }
  function noteIntent(event: Event) {
    if (!enabled() || !session.getSnapshot().blank || !(event.target instanceof Element)) return
    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter' || event.isComposing ||
          !event.target.closest('[contenteditable="true"], textarea')) return
    } else if (!event.target.closest('button[aria-busy]:not(:disabled)')) return
    if (!event.target.closest('[data-composer-card]')) return
    shoulder = shoulderIn(pane)
    if (shoulder) origins.set(session, pane)
  }
  pane.addEventListener('keydown', noteIntent, options)
  pane.addEventListener('click', noteIntent, options)
  function cancel() {
    shoulder = undefined
    textArrived = false
    if (origins.get(session) === pane) origins.delete(session)
    cancelAnimationFrame(raf)
    raf = 0
    wake?.stop()
    wake = undefined
  }
  const unsubscribe = session.subscribe(() => {
    if (!shoulder) return
    const state = session.getSnapshot()
    if (state.promptError) { cancel(); return }
    if (!state.promptAttempted || state.blank) return
    const start = shoulder
    shoulder = undefined
    if (origins.get(session) !== pane) return
    origins.delete(session)
    raf = requestAnimationFrame(() => {
      raf = 0
      if (!enabled() || !pane.isConnected) return
      wake = playWake(pane, start)
      if (textArrived) wake?.arrive()
    })
  })
  motion.addEventListener('change', cancel, options)
  document.addEventListener('visibilitychange', cancel, options)
  return {
    arrive() { if (shoulder || raf) textArrived = true; wake?.arrive() },
    dispose() { unsubscribe(); events.abort(); cancel() },
  }
}
