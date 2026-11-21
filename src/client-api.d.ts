// The browser provides the module loader and services at activation time.
type FishThemeTokens = Record<string, { light: string; dark: string }>
interface FishThemeService {
  overrideTokens(id: string, tokens: FishThemeTokens): () => void
}
interface FishFormSnapshot {
  status: string
  user: unknown
  value?: Record<string, unknown>
  writable: boolean
  revision: number
}
interface FishClientContext {
  effect(setup: () => void | (() => void), label: string): void
  inject(names: string[], setup: (scope: FishClientContext) => void): void
  theme: FishThemeService
  uiWorkspace: { startSession(): void }
  configForms: {
    get(id: string): {
      getSnapshot(): FishFormSnapshot
      subscribe(listener: () => void): () => void
      mutate(ops: { op: string; path: string[]; value: unknown }[], revision: number): Promise<boolean>
    }
  }
  slots: {
    inject(name: string, register: () => void): void
    register(record: { name: string; id?: string; key?: string; order?: number; label?: () => string }, component: React.ComponentType): void
  }
}
interface FishClientRequire {
  (name: 'react'): typeof import('react')
  (name: 'react-dom'): typeof import('react-dom')
}
interface Window {
  __ModuleLoader__: {
    load(definition: { id: string; factory(require: FishClientRequire): { inject: string[]; apply(ctx: FishClientContext): void } }): void
  }
  __dfSplashPlayed?: boolean
  __dfNewSession?: () => void
  __dfCaretProbe?: () => { ok: boolean; active?: string | null; x?: number; y?: number; height?: number }
}
