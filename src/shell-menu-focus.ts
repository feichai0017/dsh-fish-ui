const triggerSelector = '[data-sidebar-right-guide-entry="terminal"] button[aria-haspopup="menu"]'

export function attachShellMenuFocus(): () => void {
  let pending: MutationObserver | undefined
  const stop = () => {
    pending?.disconnect()
    pending = undefined
  }

  function onOpen(event: MouseEvent) {
    const trigger = event.target instanceof Element && event.target.closest<HTMLButtonElement>(triggerSelector)
    if (!trigger) return
    stop()
    if (trigger.getAttribute('aria-expanded') === 'true') return

    // The guide portals its menu to the body. Its CSS anchor identifies this
    // specific trigger even when there are several terminal guides on screen.
    const anchor = trigger.closest<HTMLElement>('[style*="anchor-name"]')?.style.getPropertyValue('anchor-name')
    if (!anchor) return

    const observer = new MutationObserver(() => {
      if (!trigger.isConnected || trigger.getAttribute('aria-expanded') !== 'true') {
        stop()
        return
      }
      const menu = Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'))
        .find(element => element.style.getPropertyValue('position-anchor') === anchor)
      if (!menu) return

      // Shell discovery is asynchronous. In rc.5 the selected row's only
      // marker is its check icon. Leave loading, empty and retry rows alone.
      const marker = menu.querySelector('[aria-checked="true"], [data-icon="dsw-icon-check-outline-regular"]')
      const selected = marker?.closest<HTMLButtonElement>('button[role^="menuitem"]:enabled')
      if (selected) {
        stop()
        selected.focus({ preventScroll: true })
      } else {
        observer.observe(menu, { childList: true, subtree: true })
      }
    })
    pending = observer
    observer.observe(document.body, { childList: true })
    observer.observe(trigger, { attributes: true, attributeFilter: ['aria-expanded'] })
  }

  // The native button dispatches a click for both mouse and keyboard opens.
  document.addEventListener('click', onOpen, true)
  return () => {
    document.removeEventListener('click', onOpen, true)
    stop()
  }
}
