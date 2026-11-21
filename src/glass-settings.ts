const transparency = { min: 0, max: 70, step: 1, unit: '%' } as const
const blur = { min: 0, max: 40, step: 1, unit: 'px' } as const

export const GLASS_RANGES = {
  glassTransparency: { ...transparency, default: 22, css: '--df-glass-transparency' },
  glassBlur: { ...blur, default: 24, css: '--df-glass-blur' },
  menuTransparency: { ...transparency, default: 2, css: '--df-menu-transparency' },
  menuBlur: { ...blur, default: 20, css: '--df-menu-blur' },
} as const

export type GlassKey = keyof typeof GLASS_RANGES
export type GlassValues = Readonly<Record<GlassKey, number>>
export const GLASS_KEYS = Object.keys(GLASS_RANGES) as GlassKey[]

export function validGlassValue(key: GlassKey, value: unknown): value is number {
  const { min, max } = GLASS_RANGES[key]
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}
