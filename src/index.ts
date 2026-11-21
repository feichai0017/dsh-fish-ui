import Schema from '@deepseek-ai/schemastery'
import { GLASS_RANGES } from './glass-settings'

const flags = [
  'hero', 'field', 'wave', 'ripple', 'thinkingSphere', 'thinkingLabel',
  'glass', 'effortBadge', 'sidebarDots', 'sidebarRail', 'bold', 'focusRing', 'diff',
  'reading', 'code', 'fishFont', 'fishGlow', 'fishMotion', 'fishCode',
  'catppuccin', 'aurora', 'cursor', 'textMotion', 'hostIcons',
] as const

export const Config = Schema.object({
  ...Object.fromEntries(flags.map(key => [key, Schema.boolean().default(true).volatile()])),
  ...Object.fromEntries(Object.entries(GLASS_RANGES).map(([key, range]) => [
    key, Schema.number().min(range.min).max(range.max).step(range.step).default(range.default).volatile(),
  ])),
  scene: Schema.union(['atlas', 'aurora', 'orbit', 'dunes', 'rain', 'lotus']).default('atlas').volatile(),
  sceneMotion: Schema.union(['still', 'calm', 'flow']).default('calm').volatile(),
  iconStyle: Schema.union(['line', 'duotone']).default('duotone').volatile(),
  accentColor: Schema.string().pattern(/^#[0-9a-f]{6}$/i).default('#4D6BFE').volatile(),
  settingsMigrated: Schema.boolean().default(false).volatile().hidden(),
})

interface SettingsHost<Fiber> {
  fiber: Fiber
  inject(services: ['settings'], setup: (scope: {
    settings: { configure(options: { auto: false }, fiber: Fiber): () => void }
    effect(mount: () => () => void, label: string): void
  }) => void): void
}

export function apply<Fiber>(ctx: SettingsHost<Fiber>): void {
  ctx.inject(['settings'], scope => {
    scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), 'dsh-fish-ui: preferences')
  })
}
