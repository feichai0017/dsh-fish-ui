type DirectoryFlowProps = {
  open: boolean
  onPicked(path: string): void
  onCancel(): void
  onError(message: string): void
}

const directoryFlows = [
  'conversation.hero.workspace.directoryFlow',
  'sidebar.workspaces.directoryFlow',
  'workspace.picker.directoryFlow',
] as const

/** Supply a missing workspace flow on Desktop. Harness owns the menu,
 * folder adoption, validation, error dialog and selection of the new workspace. */
export function installDesktopWorkspacePicker(ctx: FishClientContext, React: typeof import('react')) {
  const chooser = window.__DSH_DIRECTORY_PICKER__
  if (!chooser || typeof chooser.pick !== 'function') return

  function DesktopDirectoryFlow(props: DirectoryFlowProps) {
    const owner = React.useRef(props)
    owner.current = props
    const pending = React.useRef<Promise<string | null>>(null)
    React.useEffect(() => {
      if (!props.open) {
        pending.current = null
        return
      }
      // Re-renders and Strict Mode may observe the same open gesture more than once.
      const selection = pending.current ??= Promise.resolve().then(() => chooser.pick())
      let active = true
      selection.then(path => {
        if (!active) return
        if (path === null) owner.current.onCancel()
        else owner.current.onPicked(path)
      }, error => {
        if (active) owner.current.onError(error instanceof Error ? error.message : String(error))
      })
      return () => { active = false }
    }, [props.open])
    return null
  }

  ctx.inject(['remoteAccess', 'slots'], scope => {
    scope.remoteAccess.whenAccess('directoryPicker/pick', function* () {
      for (const name of directoryFlows) {
        yield scope.slots.inject(name, () =>
          // Single slots elect the lowest priority. A stock picker, even one
          // loaded later, stays in control while its entry is present.
          scope.slots.register({ name, priority: Number.MAX_SAFE_INTEGER }, DesktopDirectoryFlow))
      }
    })
  })
}
