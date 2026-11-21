import Schema from '@deepseek-ai/schemastery'

/** Profile-owned preferences. Volatile fields update without restarting the UI. */
export const Config = Schema.object(Object.fromEntries([
  'hero', 'field', 'wave', 'ripple', 'thinkingSphere', 'thinkingLabel',
  'glass', 'effortBadge', 'sidebarDots', 'sidebarRail', 'bold', 'focusRing', 'diff',
  'reading', 'code', 'fishFont', 'fishGlow', 'fishMotion', 'fishCode', 'catppuccin', 'aurora', 'cursor', 'textMotion',
].map(key => [key, Schema.boolean().default(true).volatile()]).concat([
  ['settingsMigrated', Schema.boolean().default(false).volatile().hidden()],
])))

export function apply(ctx) {
  ctx.inject(['settings'], scope => {
    scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), 'dsh-fish-ui: preferences')
  })
}
