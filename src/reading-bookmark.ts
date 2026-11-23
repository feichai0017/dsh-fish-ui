// Harness uses these stable flow keys for its own scroll memory. Anchor inside
// a Markdown block as well, so a wrapped line or expanded code fence above it
// doesn't turn a remembered paragraph into a different one.
const rowSelector = '[data-chat-anchor-key]'
const blockSelector = 'p, pre, li, tr, h1, h2, h3, h4, blockquote'
type Place = { scrollTop: number; key?: string; rowTop?: number; block?: number; blockTop?: number }

function remember(scroller: HTMLElement): Place {
  const place: Place = { scrollTop: scroller.scrollTop }
  const bounds = scroller.getBoundingClientRect()
  const line = bounds.top + Math.min(28, bounds.height / 5)
  let row: HTMLElement | null = null
  let block: Element | null = null
  for (const el of document.elementsFromPoint(bounds.left + bounds.width / 2, line)) {
    row = el.closest<HTMLElement>(rowSelector)
    if (row && scroller.contains(row)) { block = el.closest(blockSelector); break }
    row = null
  }
  if (!row) {
    row = Array.from(scroller.querySelectorAll<HTMLElement>('[data-chat-paging-anchor]')).find(node => {
      const rect = node.getBoundingClientRect()
      return rect.height > 0 && rect.bottom > line && rect.top < bounds.bottom
    }) ?? null
  }
  if (row) {
    place.key = row.dataset.chatAnchorKey
    place.rowTop = row.getBoundingClientRect().top - bounds.top
    if (block && row.contains(block)) {
      place.block = Array.from(row.querySelectorAll(blockSelector)).indexOf(block)
      place.blockTop = block.getBoundingClientRect().top - bounds.top
    }
  }
  return place
}

function alignRemembered(scroller: HTMLElement, place: Place) {
  if (place.key === undefined) return
  const row = scroller.querySelector<HTMLElement>(`[data-chat-anchor-key="${CSS.escape(place.key)}"]`)
  if (!row) return
  const target = place.block === undefined ? row : row.querySelectorAll<HTMLElement>(blockSelector)[place.block]
  const rect = target?.getBoundingClientRect()
  const top = place.block === undefined ? place.rowTop : place.blockTop
  if (!rect?.height || top === undefined) return
  scroller.scrollTop += rect.top - scroller.getBoundingClientRect().top - top
  return target
}

export function mountReadingBookmark(slot: HTMLElement) {
  const scroller = slot.closest<HTMLElement>('[data-conversation-scroll]')
  if (!scroller) return
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'df-reading-bookmark'
  button.hidden = true
  const region = document.createElement('span')
  region.setAttribute('aria-live', 'polite')
  region.setAttribute('aria-atomic', 'true')
  region.appendChild(button)
  slot.appendChild(region)
  const pending = new Set<number>()
  let place: Place | undefined
  let readThrough = -1
  let flow: HTMLElement | null = null
  let correction = 0
  const listeners = new AbortController()
  const atFloor = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 20

  function cancelCorrection() {
    cancelAnimationFrame(correction)
    correction = 0
  }

  function restore(saved: Place) {
    cancelCorrection()
    const target = alignRemembered(scroller, saved)
    if (target) return target
    // Seed the render window, then correct by block identity once the host
    // remounts it. The old pixel offset alone drifts when content grows above.
    scroller.scrollTop = saved.scrollTop
    if (saved.key !== undefined) {
      const deadline = performance.now() + 350
      const realign = () => {
        if (!alignRemembered(scroller, saved) && performance.now() < deadline) {
          correction = requestAnimationFrame(realign)
        } else correction = 0
      }
      correction = requestAnimationFrame(realign)
    }
    return scroller
  }

  function render() {
    const zh = (document.documentElement.lang || navigator.language).toLowerCase().startsWith('zh')
    button.hidden = !place && !pending.size
    button.dataset.return = String(!!place)
    button.textContent = place ? (zh ? '回到刚才的位置' : 'Back to reading')
      : zh ? `${pending.size} 条新回复` : `${pending.size} new ${pending.size === 1 ? 'reply' : 'replies'}`
  }

  function onScroll() {
    if (!pending.size || !atFloor()) return
    for (const turn of pending) readThrough = Math.max(readThrough, turn)
    pending.clear()
    render()
  }

  button.addEventListener('click', () => {
    if (place) {
      const target = restore(place)
      place = undefined
      if (!pending.size && document.activeElement === button) {
        const temporary = !target.hasAttribute('tabindex')
        if (temporary) target.tabIndex = -1
        target.focus({ preventScroll: true })
        if (temporary) target.removeAttribute('tabindex')
      }
    } else {
      const turn: number | undefined = pending.values().next().value
      if (turn === undefined) return
      place = remember(scroller)
      pending.delete(turn)
      readThrough = Math.max(readThrough, turn)
      const candidates = scroller.querySelectorAll<HTMLElement>(
        `[data-chat-turn="${turn}"][data-chat-flow-kind="assistant-step"]:not([data-chat-group-part="reasoning"])`)
      const row = Array.from(candidates).find(node => node.getBoundingClientRect().height > 0)
      const delta = row && row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 24
      // Already inside this long reply? Its latest text is at the tail.
      if (delta !== undefined && delta !== null && delta > 0) scroller.scrollTop += delta
      else scroller.scrollTop = scroller.scrollHeight
    }
    render()
  })

  scroller.addEventListener('scroll', onScroll, { passive: true, signal: listeners.signal })
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    scroller.addEventListener(event, cancelCorrection, { capture: true, passive: true, signal: listeners.signal })
  }
  return {
    textAdded(turn: number) {
      if (turn <= readThrough || pending.has(turn)) return
      if (!flow?.isConnected) flow = scroller.querySelector('[data-chat-flow]')
      if (!flow || flow.closest('[data-chat-following-tail]') || !scroller.clientHeight || atFloor()) return
      pending.add(turn)
      if (!place) render()
    },
    dispose() {
      cancelCorrection()
      listeners.abort()
      region.remove()
    },
  }
}

export const readingBookmarkCss = `
.df-reading-bookmark {
  position: absolute; z-index: 2; bottom: 12px; left: 50%; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; max-width: calc(100% - 12px);
  padding: 5px 12px; border-radius: 99px; border: 1px solid var(--df-shell-line);
  background: var(--df-shell-raised); color: var(--df-shell-ink); font: inherit; font-size: 12px;
  line-height: 1.5; cursor: pointer; box-shadow: 0 2px 7px rgb(8 20 40 / .12); pointer-events: auto;
}
.df-reading-bookmark::before {
  content: ''; width: 8px; height: 11px; background: var(--df-accent, #4d6bfe);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 74%, 0 100%);
}
.df-reading-bookmark[data-return="true"]::before { background: currentColor }
.df-reading-bookmark[hidden], [data-conversation-content]:has([data-trigger-menu]) .df-reading-bookmark { display: none }
.df-reading-bookmark:focus-visible { outline: 2px solid var(--df-accent, #4d6bfe); outline-offset: 2px }
`
