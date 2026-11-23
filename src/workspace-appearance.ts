export const sceneIds = ['atlas', 'aurora', 'orbit', 'dunes', 'rain', 'lotus'] as const
export interface WorkspaceLook {
  scene: typeof sceneIds[number]
  accentColor: string
}
export type WorkspaceLooks = Record<string, WorkspaceLook>
export type AppearanceWorkspace = { workspaceId: string; title: string; path: string }

// Animate the inks used by the window material. The host's content and layout
// keep their own transitions, including when only the accent changes.
export const workspaceAppearanceCss = `
@property --df-shell-accent { syntax: "<color>"; inherits: true; initial-value: #4d6bfe; }
@property --df-shell-scene { syntax: "<color>"; inherits: true; initial-value: #9cbfff; }
@property --df-shell-depth { syntax: "<color>"; inherits: true; initial-value: #152665; }
@media (prefers-reduced-motion: no-preference) and (forced-colors: none) {
  :root[data-fish-pace]:not(.df-off-fishmotion, [data-fish-pace="still"], [data-fish-paused]) body {
    transition: --df-shell-accent 360ms ease-in-out, --df-shell-scene 360ms ease-in-out, --df-shell-depth 360ms ease-in-out;
  }
}
`

type Source<T> = { getSnapshot(): T; subscribe(listener: () => void): () => void }
interface AppearanceCatalogs {
  sessions: { list: Source<{ phase: string; byId: Record<string, { retainedBy?: { mainView?: number } }> }> }
  workspaces: { list: Source<{ phase: string; items: readonly (AppearanceWorkspace & { sessionIds: readonly string[] })[] }> }
}

/** Workspace membership and mainView ownership are the same sources used by
 * Harness navigation. A docked conversation cannot recolor the main window. */
export function watchAppearanceWorkspace(ctx: FishClientContext, change: (workspace: AppearanceWorkspace | undefined) => void) {
  const { workspaces, sessions } = ctx as unknown as AppearanceCatalogs
  let current: AppearanceWorkspace | undefined
  const refresh = () => {
    const catalog = workspaces.list.getSnapshot()
    const list = sessions.list.getSnapshot()
    if (catalog.phase !== 'ready' || list.phase !== 'ready') return
    const main = Object.keys(list.byId).find(id => list.byId[id].retainedBy?.mainView > 0)
    const next = main ? catalog.items.find(item => item.sessionIds.includes(main)) : undefined
    if (next?.workspaceId === current?.workspaceId && next?.title === current?.title && next?.path === current?.path) return
    current = next
    change(next)
  }
  const detachSessions = sessions.list.subscribe(refresh)
  const detachWorkspaces = workspaces.list.subscribe(refresh)
  refresh()
  return () => { detachWorkspaces(); detachSessions(); change(undefined) }
}

/** An older profile has no map. Ignore a malformed entry without discarding
 * the valid appearances of its other workspaces. */
export function readWorkspaceLooks(raw: unknown): WorkspaceLooks {
  const looks: WorkspaceLooks = Object.create(null)
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [id, look] of Object.entries(raw)) {
      if (look && sceneIds.includes(look.scene) && typeof look.accentColor === 'string' && /^#[0-9a-f]{6}$/i.test(look.accentColor)) {
        looks[id] = { scene: look.scene, accentColor: look.accentColor }
      }
    }
  }
  return looks
}
