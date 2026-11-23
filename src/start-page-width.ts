type DockPage = 'guide' | 'work' | 'split'

interface FrameSize {
  rightbar: number | null
  rightbarShown: boolean
  rightbarTrack: boolean
  rightbarFullscreen: boolean
}

interface WidthProps {
  useStore<T>(selector: (state: { layoutInfo: FrameSize }) => T): T
  actions: { setRightbar(width: number): void }
}

const dockHost = '[data-dockkit-host="dock"]:not([hidden])'
const dockMarkers = '[data-sidebar-right-panel], [data-dockkit-host], [data-dockkit-split], [data-sidebar-right-guide]'

function dockPage(column: Element): DockPage | undefined {
  const panel = [...column.querySelectorAll('[data-sidebar-right-panel="push"][data-sidebar-right-open]')]
    .find(node => !node.closest('[hidden]'))
  if (!panel) return
  if (panel.querySelector('[data-dockkit-split]')) return 'split'
  const host = panel.querySelector(dockHost)
  if (host) return host.querySelector('[data-sidebar-right-guide]') ? 'guide' : 'work'
}

function changesDock(node: Node) {
  return node instanceof Element && (node.matches(dockMarkers) || !!node.querySelector(dockMarkers))
}

/** Share the frame's native width action with an invisible overlay slot. The
 * host still measures the grid, clamps it and owns the separator's drag base. */
export function installStartPageWidth(ctx: FishClientContext, React: typeof import('react')) {
  function WidthPolicy({ useStore, actions }: WidthProps) {
    const geometry = useStore(state => state.layoutInfo)
    const [page, setPage] = React.useState<DockPage>()
    const widths = React.useRef({ guide: 390, previousWork: undefined as number | undefined })

    React.useLayoutEffect(() => {
      const column = document.querySelector('[data-rightbar-col]')
      if (!column) return
      const read = () => setPage(dockPage(column))
      read()
      const observer = new MutationObserver(records => {
        if (records.some(record => record.type === 'attributes'
          || [...record.addedNodes, ...record.removedNodes].some(changesDock))) read()
      })
      observer.observe(column, { subtree: true, childList: true, attributes: true,
        attributeFilter: ['hidden', 'data-sidebar-right-open', 'data-sidebar-right-panel', 'data-dockkit-split'] })
      return () => observer.disconnect()
    }, [])

    React.useLayoutEffect(() => {
      if (!page || !geometry?.rightbarShown || !geometry.rightbarTrack
        || geometry.rightbarFullscreen || geometry.rightbar === null || !actions.setRightbar) return
      const saved = widths.current
      if (page === 'guide' && saved.previousWork === undefined) {
        saved.previousWork = geometry.rightbar
        actions.setRightbar(saved.guide)
      } else if (page !== 'guide' && saved.previousWork !== undefined) {
        saved.guide = geometry.rightbar
        // Keep the room the user just dragged open for a split, even if the
        // previous terminal preference alone would be too small for two panes.
        const work = page === 'split' ? Math.max(saved.previousWork, saved.guide) : saved.previousWork
        saved.previousWork = undefined
        actions.setRightbar(work)
      }
    }, [geometry, page, actions])

    React.useLayoutEffect(() => () => {
      if (widths.current.previousWork !== undefined) {
        actions.setRightbar(widths.current.previousWork)
        widths.current.previousWork = undefined
      }
    }, [actions])
    return null
  }

  // Root and shell.overlay share a scope. Registering the layout handle in
  // both seats asks Harness for the same store instance and bound actions.
  const slots = ctx.slots as FishClientContext['slots'] & {
    entries(name: string): readonly { children?: { rightbar?: unknown }; store?: unknown }[]
  }
  slots.inject('shell.overlay', () => {
    const owner = slots.entries?.('root').find(entry => entry.children?.rightbar && entry.store)
    if (!owner) return
    const registration = { name: 'shell.overlay', id: 'dsh-fish-ui.start-width', store: owner.store }
    return slots.register(registration, WidthPolicy)
  })
}
