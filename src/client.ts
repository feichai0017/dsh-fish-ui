import { playFishLaunch, staticArrivalMedia, DF_LAUNCH_CSS } from './launch'
import { mountWhale, whalePaintEvent } from './whale-welcome'
import { studioFinishCss } from './studio-finish'
import fishLogo from '../icon.svg'
import { dfCreateScenePlate, dfPlaySceneArrival, setWindowPainting, DF_SCENE_ART_CSS } from './scene-art'
import { installModelStudio } from './model-studio'
import { shellGlassCss } from './shell-glass'
import { installDesktopWorkspacePicker } from './workspace-picker'
import { installPendingApprovals } from './pending-approvals'
import { workbenchFinishCss } from './workbench-finish'
import { commandGlassCss } from './command-glass'
import { createGlassControls, glassControlsCss } from './glass-controls'
import { GLASS_KEYS, GLASS_RANGES, validGlassValue, type GlassKey, type GlassValues } from './glass-settings'
import { dfInstallReplyMotion } from './reply-motion'

/** The conversation frame supplies the welcome illustration beneath the native composer. */
window.__ModuleLoader__.load({
  id: 'dsh-fish-ui',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const GlassControls = createGlassControls(React)

    // Scene artwork and interface ink are independent profile preferences.
    type ColorPair = [string, string]
    type PlateColors = [string, string, string, string]
    interface FishScene {
      zh: string
      en: string
      caption: ColorPair
      colors: PlateColors
      icon: keyof typeof FISH_ICONS
    }

    const SCENES = {
      atlas: {
        en: 'Tidal Atlas', zh: '潮汐图谱', caption: ['Drifting depth contours', '等深线随海流缓缓漂移'],
        colors: ['#152665', '#2E4DA7', '#9CBFFF', '#D9E5FF'],
        icon: 'contour',
      },
      aurora: {
        en: 'Polar Silk', zh: '极光帷幕', caption: ['Ribbons of light over a polar ridge', '极光掠过远山的轮廓'],
        colors: ['#171b48', '#384676', '#91ead0', '#d4b1fb'],
        icon: 'aurora',
      },
      orbit: {
        en: 'Lunar Orbit', zh: '月相轨道', caption: ['Satellites trace an orbital chart', '卫星沿星图上的轨道运行'],
        colors: ['#191b38', '#484069', '#d0baff', '#f7d8a3'],
        icon: 'orbit',
      },
      dunes: {
        en: 'Amber Dunes', zh: '琥珀沙丘', caption: ['Wind moves across the sand ridges', '风吹动落日下的沙脊'],
        colors: ['#65383f', '#c87852', '#ffc985', '#fff1bd'],
        icon: 'dunes',
      },
      rain: {
        en: 'Neon Rain', zh: '霓虹夜雨', caption: ['Rain streaks past a lit skyline', '斜雨掠过楼顶的霓虹灯'],
        colors: ['#111936', '#374274', '#80d6ec', '#f2a1d8'],
        icon: 'rain',
      },
      lotus: {
        en: 'Celadon Pond', zh: '青瓷莲池', caption: ['Ripples open between lotus leaves', '水纹从荷叶间一圈圈散开'],
        colors: ['#123a3b', '#447766', '#b2dbc0', '#f7cfbf'],
        icon: 'lotus',
      },
    } satisfies Record<string, FishScene>
    const BRAND_BLUE = '#4D6BFE'
    const ACCENT_SWATCHES = [
      [BRAND_BLUE, 'DeepSeek 蓝', 'DeepSeek blue'],
      ['#7855CA', '鸢尾紫', 'Iris'],
      ['#157B77', '孔雀青', 'Teal'],
      ['#AB6132', '琥珀棕', 'Amber'],
      ['#BA4774', '玫瑰红', 'Rose'],
    ]
    type SceneId = keyof typeof SCENES
    const STUDIO_CHOICES = {
      scene: Object.keys(SCENES), sceneMotion: ['still', 'calm', 'flow'], iconStyle: ['line', 'duotone'],
    }

    const path = (d: string, props?: React.SVGProps<SVGPathElement>) => h('path', { d, ...props })
    const FISH_ICONS = {
      fish: ['M2 8.5 7 11c3-6 10-6.5 14 1-4.5 7.5-11 7-14 1L2 15.5Z M14 7.2c-2 3.1-2 6.5 0 9.6 M17.2 11.2h.1', 'M7 12c3-6 10-6 14 0-4 7-11 7-14 0Z'],
      contour: ['M2 14c0-5 3-6 6-6s3-5 7-5 7 4 7 8-5 4-7 7-6 4-9 2-4-3-4-6Z M6 14c0-3 4-3 6-6s6-1 6 2-3 3-5 6-7 2-7-2Z M10 14l4-3', 'M2 14c0-5 3-6 6-6s3-5 7-5 7 4 7 8-5 4-7 7-6 4-9 2-4-3-4-6Z'],
      aurora: ['M2 16c5-13 8 2 14-9l4-4 M2 20c6-14 9 0 15-10l5-6 M7 5l.6 1.8L9.5 7l-1.9.6L7 9.5l-.6-1.9L4.5 7l1.9-.2Z', 'M2 16c5-13 8 2 14-9l4-4-3 7c-6 10-9-4-15 10Z'],
      orbit: ['M8 8.5a5 5 0 1 1-.5 6.3 M19.5 7c4-1 2.5 3-4 7S1 20 2.5 16c.5-1.3 2.3-3.2 4.5-5 M18 3v2m-1-1h2', 'M12 7a5 5 0 1 1 0 10 5 5 0 1 1 0-10Z'],
      dunes: ['M1.5 18c5 2 8-8 14-5s6 5 7 4 M2 21h20 M3 13l4-3 4 2 M14 9a3 3 0 1 1 5 .2', 'M2 18c5 2 8-8 14-5s6 5 6 4v4H2Z'],
      rain: ['M4 15V9h5v6m0-6V6h6v9m0-4h5v4 M2 16h20 M6 19l-1 2m7-2-1 2m7-2-1 2 M17 4l-1 2m5-3-1 2', 'M4 9h5V6h6v5h5v5H4Z'],
      lotus: ['M12 18c-4-3-5-7 0-13 5 6 4 10 0 13Z M10 17c-4 0-7-3-8-8 4 .3 7 2 8 4m4 4c4 0 7-3 8-8-4 .3-7 2-8 4 M4 20c4 1 12 1 16 0', 'M12 18c-4-3-5-7 0-13 5 6 4 10 0 13Z'],
      gallery: ['M3 4h7v7H3Zm11 0h7v7h-7ZM3 15h7v6H3Zm11 0h7v6h-7Z', 'M3 4h7v7H3Zm11 11h7v6h-7Z'],
      launchIntro: ['M3 5h18v14H3ZM10 9l5 3-5 3Z', 'M10 9l5 3-5 3Z'],
      sliders: ['M3 6h4m5 0h9M3 12h10m5 0h3M3 18h3m5 0h10 M7 4v4h4V4Zm7 6v4h4v-4Zm-8 6v4h4v-4Z', 'M7 4h4v4H7Zm7 6h4v4h-4Zm-8 6h4v4H6Z'],
      reading: ['M3 5c4-1 6-.5 9 2 3-2.5 5-3 9-2v13c-4-1-6-.5-9 2-3-2.5-5-3-9-2ZM12 7v13', 'M3 5c4-1 6-.5 9 2v13c-3-2.5-5-3-9-2Z'],
      code: ['m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-3 16'],
      hero: ['M4 3h16v18H4ZM7 16l4-5 3 3 2-2 2 4M8 7h.1', 'M5 17l6-6 3 3 2-2 3 5Z'],
      field: ['M3 6h18M3 12h18M3 18h18M6 3v18M12 3v18M18 3v18'],
      wave: ['M2 8q3-4 7 0t7 0q3-3 6-1 M2 13q3-4 7 0t7 0q3-3 6-1 M2 18q3-4 7 0t7 0q3-3 6-1'],
      ripple: ['M6 10c-5 2-5 6 0 8s13 1 15-2-2-5-4-6 M8 12c-3 2 0 4 4 4s7-2 4-4 M12 3c-3 4-3.5 6 0 7 3.5-1 3-3 0-7Z', 'M12 3c-3 4-3.5 6 0 7 3.5-1 3-3 0-7Z'],
      thinkingSphere: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 0c-6 5-6 13 0 18 6-5 6-13 0-18ZM3 12h18'],
      thinkingLabel: ['M4 4h16v13h-8l-5 4v-4H4ZM7 9h10M7 12h7', 'M4 4h16v13h-8l-5 4v-4H4Z'],
      glass: ['m3 8 9-5 9 5-9 5Zm0 4 9 5 9-5M3 16l9 5 9-5', 'm3 8 9-5 9 5-9 5Z'],
      effortBadge: ['m13 2-8 12h6l-1 8 9-13h-7Z', 'm13 2-8 12h6l-1 8 9-13h-7Z'],
      sidebarDots: ['M3 4h18v16H3ZM10 4v16M6.3 8h.3m-.3 4h.3m-.3 4h.3', 'M3 4h7v16H3Z'],
      sidebarRail: ['M3 4h18v16H3ZM8 4v16M12 9h6m-6 5h4', 'M3 4h5v16H3Z'],
      bold: ['M6 4h7a4 4 0 0 1 0 8H7m0-8v16h7a4 4 0 0 0 0-8H7'],
      focusRing: ['M8 3H3v5m13-5h5v5m0 8v5h-5M3 16v5h5 M8 8h8v8H8Z', 'M8 8h8v8H8Z'],
      diff: ['M5 3v13c0 4 4 4 7 4h4m-2-3 3 3-3 3 M12 6h9m-4.5-4.5v9'],
      fishFont: ['m2 18 5-14 5 14M4 13h6m3 2c2-3 7-1 7-3s-2-4-6-2m6 2v6c-3 2-8 1-7-3'],
      fishGlow: ['M12 2l2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z', 'M12 2l2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z'],
      fishMotion: ['M2 8h7M2 12h4m-3 4h5m1-4 6-7 7 7-7 7Z', 'm9 12 6-7 7 7-7 7Z'],
      fishCode: ['M3 4h18v16H3Zm0 4h18m-14 4 3 2-3 2m5 0h4', 'M3 4h18v4H3Z'],
      catppuccin: ['M12 3a9 9 0 1 0 0 18h1c2 0 2-2 1-3s-1-3 1-3h3c5 0 3-12-6-12Z M7 10h.1m3-3h.1m4 0h.1m3 3h.1', 'M12 3a9 9 0 1 0 0 18h1c2 0 2-2 1-3s-1-3 1-3h3c5 0 3-12-6-12Z'],
      cursor: ['m4 3 15 9-7 1-3 7Z', 'm4 3 15 9-7 1-3 7Z'],
      textMotion: ['M3 6h12M3 11h8m-8 5h5m7-6 6 4-6 4Z', 'm15 10 6 4-6 4Z'],
      still: ['M7 5v14M17 5v14'],
      line: ['m3 18 4-1L20 5l-2-2L5 15ZM3 21h18'],
      duotone: ['M3 5h11v12H3Zm7 4h11v12H10Z', 'M10 9h11v12H10Z'],
      check: ['m5 12 4.5 4.5L19 7'],
      close: ['m6 6 12 12M18 6 6 18'],
      reset: ['M4 10a8 8 0 1 1 1 7M4 4v6h6'],
      newChat: ['M13 4H7a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h1v3l5-3h3a4 4 0 0 0 4-4v-3M18 2v7m-3.5-3.5h7', 'M4 8a3 3 0 0 1 3-3h5v6h7v4c0 2-1 3-3 3h-3l-5 3v-3H7c-2 0-3-1-3-3Z'],
      search: ['M10.5 3.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l5 5M7 10a3.5 3.5 0 0 1 3.5-3.5', 'M10.5 3.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z'],
      attach: ['m8 14 7.7-7.7a2.1 2.1 0 0 1 3 3l-9 9a4.2 4.2 0 0 1-6-6l9.6-9.6a2 2 0 0 1 .9-.6 M7.5 14.5l6.7-6.7', 'm7 17 10-10 1.8 1.5L9 18Z'],
      copy: ['M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2 M5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z', 'M5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z'],
      send: ['M12 20V4m-7 7 7-7 7 7', 'M5 11l7-7 7 7-7-2Z'],
      plane: ['M2 11 22 3l-6 18-5-6-4 4v-6Zm5 2 10-6-6 8', 'm7 13 10-6-6 8 5 6 6-18Z'],
      folder: ['M3 6a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v1M3 6v13h15l4-9H8l-3 6', 'M8 10h14l-4 9H4Z'],
      folderClosed: ['M3 7a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 10h18', 'M3 10h18v8c0 1-1 2-2 2H5c-1 0-2-1-2-2Z'],
      mic: ['M9 6a3 3 0 1 1 6 0v6a3 3 0 0 1-6 0Zm-4 6a7 7 0 0 0 14 0m-7 7v3m-4 0h8', 'M9 6a3 3 0 1 1 6 0v6a3 3 0 0 1-6 0Z'],
    }
    const PRODUCT_ICONS = {
      'new-chat-outline': 'newChat', 'search-outline': 'search', 'settings-outline': 'sliders',
      'panel-left-outline': 'sidebarRail', 'copy-outline': 'copy', 'code-outline': 'fishCode',
      'paperclip-outline': 'attach', 'paper-plane-outline': 'plane', 'send-outline': 'send',
      'folder-open-outline': 'folder', 'folder-open': 'folder', 'folder-close': 'folderClosed',
      'microphone-outline': 'mic', 'sliders-two-outline': 'sliders',
    }
    // Mask the existing sized SVG. The host keeps its button, title, events and disabled state.
    function productIconCss() {
      const ids = (name: string) => ':is([data-icon="dsw-icon-' + name + '-regular"],[data-icon="dsw-icon-' + name + '-medium"])'
      const mask = (outline: string, tone?: string) => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
          + (tone ? '<path d="' + tone + '" opacity=".43"/>' : '')
          + '<path d="' + outline + '" fill="none" stroke="black" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'
      }
      const rules = Object.entries(PRODUCT_ICONS).map(([name, icon]) => {
        const [outline, tone] = FISH_ICONS[icon]
        return 'svg' + ids(name) + '{--fish-outline:' + mask(outline) + ';--fish-duotone:' + mask(outline, tone) + '}'
      })
      const target = ' svg:is(' + Object.keys(PRODUCT_ICONS).map(ids).join(',') + ')'
      const root = 'html:not(.df-off-hosticons)'
      return '@supports (mask-image:linear-gradient(white,black)){' + rules.join('')
        + root + '[data-fish-icons="line"]' + target + '{background:currentColor;mask:var(--fish-outline) center/contain no-repeat}'
        + root + '[data-fish-icons="duotone"]' + target + '{background:linear-gradient(128deg,currentColor 42%,color-mix(in srgb,currentColor 55%,var(--df-accent)));mask:var(--fish-duotone) center/contain no-repeat}'
        + root + '[data-fish-icons]' + target + '>use{visibility:hidden}}'
    }
    function FishBrand() {
      return h('img', { className: 'fish-brand', src: fishLogo, alt: '', draggable: false })
    }
    function FishIcon({ name, size = 18 }: { name: keyof typeof FISH_ICONS; size?: number }) {
      const [outline, tone] = FISH_ICONS[name]
      return h('svg', { className: 'fish-icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, focusable: false },
        tone && path(tone, { className: 'fish-icon-tone' }),
        path(outline, { stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }
    const FishPlate = dfCreateScenePlate(React)

    function HeroFrame({ hero, children }: { hero: boolean; children?: React.ReactNode }) {
      const { values, status } = useDfSettings()
      const show = hero === true && values.hero
      const frameRef = React.useRef<HTMLDivElement>(null)
      React.useEffect(() => {
        if (frameRef.current) visitLaunchFrame?.(frameRef.current, hero === true, status === 'ready')
      }, [hero, status, values.launchIntro, values.sceneMotion, values.fishMotion, values.hero])
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!show || canvas === null) return undefined
        return mountWhale(canvas)
      }, [show, values.accentColor])
      const scene = SCENES[values.scene]
      const label = dfUsesChinese() ? scene.zh : scene.en
      return h('div', { ref: frameRef, className: 'dwe-frame', 'data-df-welcome': hero === true },
        values.aurora && h('div', { className: 'fish-backdrop', 'data-home': hero === true, 'aria-hidden': true },
          h(FishPlate, { scene: values.scene, live: true })),
        hero && values.aurora ? h('button', { type: 'button', className: 'df-welcome-scene', key: 'scene',
          onClick: () => dfSetSheetOpen(true), 'aria-haspopup': 'dialog',
          'aria-label': (dfUsesChinese() ? '更换场景，当前为' : 'Change scene, currently ') + label },
          h(FishIcon, { name: scene.icon, size: 15 }), h('span', null, label),
          h('span', { 'aria-hidden': true, className: 'df-welcome-chevron' }, '›')) : null,
        show && h('div', { className: 'dwe-water', 'aria-hidden': true }, h('span', { className: 'df-portrait-light' }), h('i')),
        show ? h('canvas', { key: 'mascot', ref: canvasRef, className: 'dwe-whale', 'aria-hidden': 'true' }) : null,
        children)
    }


    /* ---------------------------------------------------------------- styles */

const CSS = `
/* Hero frame layer: layout-neutral wrapper (display: contents keeps the wrapped
   scroll body a direct flex item) plus one canvas that sits above the
   Conversation background and below its content. */
.dwe-frame {
  display: contents;
}
.dwe-whale {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* Retain the host title for assistive technology while the portrait occupies its visual seat. */
.dwe-frame:has(> canvas.dwe-whale) [data-home-whale],
.dwe-frame:has(> canvas.dwe-whale) [data-slot="conversation.hero.brand.mark"] { display: none !important; }
.dwe-frame:has(> canvas.dwe-whale) [class*="headline"] [class*="titleGroup"] {
  position: absolute !important; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}

/* Anchor the gallery shortcut within its conversation pane, including split views. */
.df-welcome-scene {
  position: absolute; inset-block-start: 12px; inset-inline-end: 14px; z-index: 1;
  display: inline-flex; align-items: center; gap: 7px; max-width: calc(100% - 28px);
  min-height: 30px; padding: 3px 10px; border: 1px solid var(--df-shell-line);
  border-radius: 999px;
  background: var(--df-shell-film, none), var(--df-shell-card-fill, var(--dsw-alias-bg-layer-1));
  -webkit-backdrop-filter: var(--df-shell-filter, none);
  backdrop-filter: var(--df-shell-filter, none);
  box-shadow: inset 0 1px var(--df-glass-rim-light, transparent), 0 2px 6px -2px var(--df-shell-shadow, transparent);
  color: var(--df-shell-ink, var(--dsw-alias-label-primary)); font: inherit; font-size: 12px; cursor: pointer;
}
.df-welcome-scene svg, .df-welcome-chevron { color: var(--df-accent, #4d6bfe); }
.df-welcome-scene:focus-visible, .df-replay:focus-visible { outline: 2px solid var(--df-accent); outline-offset: 2px; }
.df-welcome-scene:hover, .df-replay:hover:enabled { border-color: var(--df-accent); }
.df-launch-options { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--fish-edge); }
.df-launch-options > .df-set-row { flex: 1; min-width: 0; }
.df-replay { flex: none; display: inline-flex; align-items: center; gap: 5px; font: inherit; font-size: 12px;
  min-height: 30px; padding: 3px 9px; border-radius: 7px; border: 1px solid var(--fish-edge);
  color: var(--fish-label); background: var(--fish-well); cursor: pointer; }
.df-replay:disabled { opacity: .6; cursor: default; }
@media (max-height: 380px) { .df-welcome-scene { display: none; } }

/* ------------------------------------------------------------------ accents */

/* --------------------------------------------------- frame-wide ambient layer */
.df-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  pointer-events: none;
}

/* ------------------------------------------- composer stats in the button row */
.df-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 2px;
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-content-font-size-secondary, 12px);
  font-variant-numeric: tabular-nums;
  line-height: 20px;
  white-space: nowrap;
  user-select: none;
}

.df-stats-item {
  opacity: 0.85;
}


/* ------------------------------------------------------------ settings page */
.df-set {
  max-width: 720px;
  padding: 4px 2px 24px;
  color: var(--dsw-alias-label-primary);
  font-synthesis: none;
}

.df-set-group {
  margin: 0 0 22px;
  padding: 0 0 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.df-set-group:last-of-type {
  border-bottom: 0;
}

.df-set-group-title {
  margin: 0 0 6px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.df-set-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.df-set-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.df-set-label {
  font-size: 14px;
  line-height: 1.4;
}

.df-set-desc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

/* The control is an SVG capsule with a drawn circle knob, so the track ends are
   exact semicircles and the knob is an exact circle at any zoom. */
.df-switch {
  flex: none;
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
}

.df-switch:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, #7aaaff);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .df-switch svg rect,
  .df-switch svg g,
  .df-switch svg circle {
    transition: none !important;
  }
}

.df-set-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}

.df-set-reset {
  padding: 7px 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.df-set-reset:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
}

.df-set-note {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* -------------------------------------------------------- sidebar entry + sheet */
.df-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.df-foot-button {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}

.df-foot-dots {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.df-foot-button > :not(.df-foot-dots) {
  position: relative;
  z-index: 1;
}

.df-foot-button:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
  color: var(--dsw-alias-label-primary);
}

.df-foot-button:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, #7aaaff);
  outline-offset: 1px;
}

.df-foot-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.df-sheet-root {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
}

.df-sheet-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

.df-sheet-panel {
  position: absolute;
  left: 14px;
  bottom: 78px;
  width: min(420px, calc(100vw - 28px));
  max-height: min(72vh, 640px);
  display: flex;
  flex-direction: column;
  border: 0;
  border-radius: 20px;
  /* Opaque on purpose: a raised surface layered over the base colour, so the panel is
     always solid and always uses the app's own palette instead of a hand-picked grey. */
  background-color: var(--dsw-alias-bg-base, #f6f6f8);
  background-image: linear-gradient(
    var(--dsw-alias-bg-layer-1, transparent),
    var(--dsw-alias-bg-layer-1, transparent)
  );
  box-shadow: var(--dsw-elevation-panel, 0 18px 48px rgba(0, 0, 0, 0.42));
  overflow: hidden;
  animation: df-sheet-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes df-sheet-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.df-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.df-sheet-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.df-sheet-close {
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 18px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
}

.df-sheet-close:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
  color: var(--dsw-alias-label-primary);
}

.df-sheet-body {
  padding: 4px 16px 8px;
  overflow-y: auto;
}

@media (prefers-reduced-motion: reduce) {
  .df-sheet-panel { animation: none; }
}
/* fish reading:start */
/* Deep Fish reading: semantic hooks only; never animate streamed text. */
body {
  --df-accent: var(--dsw-alias-brand-primary, #4D6BFE);
  --df-focus: color-mix(in srgb, var(--df-accent) 18%, transparent);
}

:root:not(.df-off-reading) [data-chat-flow-kind="assistant-step"]:not([data-chat-group-part="reasoning"]) :is(p, li) {
  line-height: 1.85;
  text-wrap: pretty;
}
:root:not(.df-off-reading) [data-chat-flow-kind="assistant-step"] :is(h1, h2, h3, h4) {
  color: var(--dsw-alias-label-primary);
  letter-spacing: -0.015em;
  line-height: 1.45;
  text-wrap: balance;
}
:root:not(.df-off-reading) [data-chat-flow-kind="assistant-step"] :is(h2, h3) {
  padding-block-start: 0.25em;
}
:root:not(.df-off-reading) [data-chat-flow-kind="assistant-step"] blockquote {
  border-inline-start: 2px solid color-mix(in srgb, var(--df-accent) 38%, transparent);
  padding-inline-start: 1em;
  color: var(--dsw-alias-label-secondary);
}
:root:not(.df-off-reading) [data-chat-flow-kind="assistant-step"] :is(p, li) > code {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
  border-radius: 4px;
  padding: 0.12em 0.35em;
}
:root:not(.df-off-code) [data-chat-flow-kind="assistant-step"] pre {
  font-variant-ligatures: none;
  tab-size: 2;
}
/* Sidebar brand: the whale mark and the product name carry a quiet halo so they read as
   part of the same light as the accent. */
[data-slot="sidebar.brand.mark"] {
  filter:
    drop-shadow(0 0 5px color-mix(in srgb, var(--df-accent) 50%, transparent))
    drop-shadow(0 0 16px color-mix(in srgb, var(--df-accent) 26%, transparent));
}

[data-slot="sidebar.brand.name"] {
  text-shadow:
    0 0 1px color-mix(in srgb, var(--df-accent) 42%, transparent),
    0 0 9px color-mix(in srgb, var(--df-accent) 34%, transparent),
    0 0 22px color-mix(in srgb, var(--df-accent) 18%, transparent);
}

/* User messages carry a whale-blue halo: a hairline ring plus two soft halos. */
[data-message-bubble] {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--df-accent) 52%, transparent),
    0 0 14px 1px color-mix(in srgb, var(--df-accent) 22%, transparent),
    0 0 38px 8px color-mix(in srgb, var(--df-accent) 10%, transparent);
}

:root:not(.df-off-bold) [data-chat-flow-kind="assistant-step"] :is(p, li, td, blockquote) :is(strong, b) {
  color: var(--df-accent);
  /* A soft halo so the accent reads as light rather than paint. */
  text-shadow:
    0 0 1px color-mix(in srgb, var(--df-accent) 55%, transparent),
    0 0 8px color-mix(in srgb, var(--df-accent) 42%, transparent),
    0 0 20px color-mix(in srgb, var(--df-accent) 22%, transparent);
}
:root:not(.df-off-thinkinglabel) [data-chat-running] [class*="_runningText"] {
  opacity: 0;
}
:root:not(.df-off-thinkingsphere) [data-chat-running] [class*="_runningIcon"] {
  display: none;
}

/* Compact figures leave submit reachable in a narrow composer. */
.df-stats {
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.015em;
  font-variant-numeric: tabular-nums;
}
.df-stats-label {
  margin-inline-end: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 9px;
  letter-spacing: 0.06em;
}
.df-stats-item { color: var(--dsw-alias-label-secondary); }
@media (max-width: 640px) {
  .df-stats-label { display: none; }
  .df-stats { gap: 6px; }
}
@media (max-width: 420px) {
  .df-stats-output { display: none; }
}
.df-switch:disabled { cursor: default; opacity: 0.48; }
.df-set-reset:disabled { cursor: default; opacity: 0.48; }
.df-settings-status {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
}
.df-settings-status[role="alert"] { color: var(--dsw-alias-state-error-primary); }
@media (prefers-reduced-motion: reduce) {
  .df-sheet-panel, .df-sheet-scrim { animation: none; }
  [data-composer-card] { transition: none !important; }
}

/* fish reading:end */
`

    /* fish indicator:start */
    /**
     * Dot sphere and English status label.
     *
     * The host text keeps the real clock, so we read the elapsed seconds out of it and
     * redraw both the words and a sweeping highlight on our own overlay canvas. The host
     * label is hidden by `reading.css` while this is on; turning it off restores the host
     * row untouched and only parks the sphere to the left of the visible text.
     */
    function DfOverlay() {
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      const settings = useDfSettings()
      const sphereOn = settings.values.thinkingSphere !== false
      const labelOn = settings.values.thinkingLabel !== false
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        // Wall clock anchor. The host may remount its row on every tick, so an element
        // keyed start time resets constantly; a single anchor survives those remounts
        // and is dropped as soon as the row leaves the document.
        const clock = { since: 0 }
        let frame = 0
        let stopped = false
        const clear = () => context.clearRect(0, 0, canvas.width, canvas.height)

        // The hidden host text cannot be trusted for the clock (its digits are not the
        // elapsed value), so the label counts wall time from when the running row first
        // appeared and restarts whenever the row leaves the document.
        const elapsedOf = (now: number) => {
          if (clock.since === 0) clock.since = now
          return Math.max(0, Math.round((now - clock.since) / 1000))
        }

        const drawSphere = (cx: number, cy: number, spin: number, ink: string) => {
          // Two batched passes: a soft halo under a crisp core, so the sphere reads as
          // light instead of loose dots. Only 42 dots, so buckets are cheap.
          const points = []
          for (let index = 0; index < 42; index += 1) {
            const v = 1 - (2 * (index + 0.5)) / 42
            const ring = Math.sqrt(1 - v * v)
            const angle = index * 2.39996323 + spin
            const depth = Math.sin(angle) * ring
            points.push({
              x: cx + Math.cos(angle) * ring * 8,
              y: cy + v * 8,
              alpha: 0.25 + (depth + 1) * 0.32,
              radius: 0.8 + (depth + 1) * 0.35,
            })
          }
          context.fillStyle = ink
          const passes = [
            { grow: 2.1, scale: 0.28 },
            { grow: 1, scale: 1 },
          ]
          for (const pass of passes) {
            const buckets = new Map()
            for (const point of points) {
              const alpha = point.alpha * pass.scale
              if (alpha < 0.02) continue
              const level = Math.min(10, Math.max(1, Math.round(alpha * 10)))
              let bucket = buckets.get(level)
              if (bucket === undefined) {
                bucket = new Path2D()
                buckets.set(level, bucket)
              }
              const radius = point.radius * pass.grow
              bucket.moveTo(point.x + radius, point.y)
              bucket.arc(point.x, point.y, radius, 0, Math.PI * 2)
            }
            for (const [level, path] of buckets) {
              context.globalAlpha = level / 10
              context.fill(path)
            }
          }
          context.globalAlpha = 1
        }

        const drawLabel = (row, label, x, cy, seconds, now, ink) => {
          const style = getComputedStyle(label)
          const font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily
          context.font = font
          context.textBaseline = 'middle'
          const text = 'Deep thinking for ' + seconds + 's. . .'
          const width = context.measureText(text).width
          const accent = (getComputedStyle(row).getPropertyValue('--df-accent') || '').trim() || '#7aaaff'
          const band = motion.matches ? -1e4 : ((now % 2600) / 2600) * (width + 140) - 70
          context.save()
          context.beginPath()
          context.rect(x - 2, cy - 20, width + 4, 40)
          context.clip()
          context.fillStyle = ink
          context.globalAlpha = 0.92
          context.fillText(text, x, cy)
          context.globalAlpha = 1
          const gradient = context.createLinearGradient(x + band - 70, 0, x + band + 70, 0)
          gradient.addColorStop(0, 'rgba(122, 170, 255, 0)')
          gradient.addColorStop(0.5, accent)
          gradient.addColorStop(1, 'rgba(122, 170, 255, 0)')
          context.fillStyle = gradient
          context.fillText(text, x, cy)
          context.restore()
        }

        const paint = (now: number) => {
          frame = 0
          if (stopped || document.hidden) return
          const dpr = Math.min(2, devicePixelRatio || 1)
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          clear()
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          const card = document.querySelector<HTMLElement>('[data-composer-card]')
          const cardTop = card === null ? height : card.getBoundingClientRect().top
          const spin = motion.matches ? 0.35 : now / 1800
          const running = document.querySelectorAll('[data-chat-running]')
          if (running.length === 0) clock.since = 0
          let visible = false
          for (const row of document.querySelectorAll('[data-chat-running]:not([data-holding])')) {
            const bounds = row.getBoundingClientRect()
            if (bounds.height === 0 || bounds.top < 0 || bounds.bottom > height) continue
            // The overlay paints above every column: never let the sphere or the label
            // sit over the composer card.
            if (bounds.bottom + 2 > cardTop) continue
            const label = row.querySelector('[class*="_runningText"]')
            if (label === null) continue
            const labelRect = label.getBoundingClientRect()
            const ink = getComputedStyle(label).color || 'rgb(200, 205, 215)'
            const size = 24
            let cx
            let cy
            if (labelOn) {
              cx = bounds.left + 2 + size / 2
              cy = bounds.top + Math.min(bounds.height, 30) / 2
            } else {
              if (labelRect.width === 0) continue
              // Keep clear of the host words: park the sphere in the gutter to their left.
              cx = Math.max(size / 2 + 6, labelRect.left - size / 2 - 8)
              cy = labelRect.top + labelRect.height / 2
            }
            visible = true
            if (sphereOn) drawSphere(cx, cy, spin, ink)
            if (labelOn) {
              const seconds = elapsedOf(now)
              const x = bounds.left + 2 + (sphereOn ? size + 8 : 0)
              drawLabel(row, label, x, cy, seconds, now, ink)
            }
          }
          if (visible && !motion.matches) frame = requestAnimationFrame(paint)
        }

        const refresh = () => {
          if (frame) cancelAnimationFrame(frame)
          frame = 0
          if (document.hidden) clear()
          else frame = requestAnimationFrame(paint)
        }
        const observer = new MutationObserver(refresh)
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['data-holding', 'data-ds-dark-theme'],
        })
        window.addEventListener('resize', refresh)
        document.addEventListener('scroll', refresh, true)
        document.addEventListener('visibilitychange', refresh)
        motion.addEventListener('change', refresh)
        refresh()
        return () => {
          stopped = true
          cancelAnimationFrame(frame)
          observer.disconnect()
          window.removeEventListener('resize', refresh)
          document.removeEventListener('scroll', refresh, true)
          document.removeEventListener('visibilitychange', refresh)
          motion.removeEventListener('change', refresh)
        }
      }, [sphereOn, labelOn])
      return sphereOn || labelOn
        ? h('canvas', { ref: canvasRef, className: 'df-overlay', 'aria-hidden': 'true' })
        : null
    }

/* fish indicator:end */

    /** Compact session stats for the composer button row. */
    /**
     * Hover dot field for every rows in the sidebar.
     *
     * No nodes are injected into host buttons: a single fixed canvas tracks the pointer,
     * finds the sidebar button under it, and prints a dot field clipped to that button.
     */
    function DfSidebarDots() {
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      const { values } = useDfSettings()
      const showDots = values.sidebarDots !== false
      const showRail = values.sidebarRail !== false
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        const state = {
          row: null,
          x: 0,
          y: 0,
          inside: false,
          rail: false,
          alpha: 0,
          frame: 0,
          live: false,
          dirty: false,
        }
        let stopped = false
        let dpr = Math.min(2, devicePixelRatio || 1)
        let rootCache = null

        // The sidebar column itself is the scope: walk up from our footer button to the
        // column landmark, once, and only light controls inside it. A lowest-common-ancestor
        // guess leaked into the chat column and put rails on every button in the app.
        const sidebarScope = () => {
          if (rootCache !== null && rootCache.isConnected) return rootCache
          const foot = document.querySelector('.df-foot-button')
          if (foot === null) return null
          let node = foot
          for (let depth = 0; depth < 10; depth += 1) {
            node = node.parentElement
            if (node === null) break
            if (node.matches('aside, [data-slot="sidebar"], [data-sidebar], [role="navigation"]')) {
              rootCache = node
              return node
            }
          }
          // No landmark: take the column wrapper a few levels up as a best effort.
          let fallback = foot
          for (let depth = 0; depth < 5 && fallback.parentElement !== null; depth += 1) {
            fallback = fallback.parentElement
          }
          rootCache = fallback
          return fallback
        }

        const paint = () => {
          state.frame = 0
          if (stopped) return
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          const target = state.inside ? 1 : 0
          state.alpha = motion.matches ? target : state.alpha + (target - state.alpha) * 0.22
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          if (!state.inside && state.alpha < 0.02) {
            state.alpha = 0
            state.live = false
            return
          }
          if (state.row === null || !state.row.isConnected) {
            state.inside = false
            state.live = false
            return
          }
          const rect = state.row.getBoundingClientRect()
          if (rect.width < 8 || rect.height < 8 || rect.bottom < 0 || rect.top > height) {
            state.live = false
            return
          }
          const style = getComputedStyle(state.row)
          const radius = parseFloat(style.borderTopLeftRadius) || 8
          const accent = (style.getPropertyValue('--df-accent') || '').trim() || '#7aa4ff'
          const reach = 74
          context.save()
          context.beginPath()
          if (typeof context.roundRect === 'function') {
            context.roundRect(rect.left, rect.top, rect.width, rect.height, radius)
          } else {
            context.rect(rect.left, rect.top, rect.width, rect.height)
          }
          context.clip()
          context.fillStyle = accent
          if (showDots) {
          const startX = Math.floor(rect.left / 4) * 4 + 2
          const startY = Math.floor(rect.top / 4) * 4 + 2
          for (let y = startY; y < rect.bottom; y += 4) {
            for (let x = startX; x < rect.right; x += 4) {
              const dx = x - state.x
              const dy = y - state.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > reach) continue
              const alpha = Math.pow(1 - distance / reach, 1.35) * state.alpha * 0.72
              if (alpha < 0.02) continue
              context.globalAlpha = Math.min(1, alpha)
              context.beginPath()
              context.arc(x, y, 0.85, 0, Math.PI * 2)
              context.fill()
            }
          }
          }
          // A short whale-blue rail marks the hovered control — buttons only.
          if (state.rail && showRail) {
            const railWidth = 3
            const railInset = 5
            const railHeight = Math.max(6, rect.height - railInset * 2)
            const railTop = rect.top + (rect.height - railHeight) / 2
            context.globalAlpha = Math.min(1, state.alpha * 0.9)
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(rect.left + 2, railTop, railWidth, railHeight, 1.5)
            } else {
              context.rect(rect.left + 2, railTop, railWidth, railHeight)
            }
            context.fill()
          }
          context.restore()
          context.globalAlpha = 1
          const moving = state.dirty
          state.dirty = false
          if (motion.matches) {
            if (!state.inside) {
              context.clearRect(0, 0, width, height)
              state.alpha = 0
            }
            state.live = false
            return
          }
          if (state.inside && state.alpha >= 0.98 && !moving) {
            state.live = false
            return
          }
          if (state.inside || state.alpha >= 0.02) {
            state.frame = requestAnimationFrame(paint)
          } else {
            state.live = false
          }
        }

        const wake = () => {
          if (stopped || state.live) return
          state.live = true
          if (state.frame === 0) state.frame = requestAnimationFrame(paint)
        }

        const onMove = event => {
          const target = event.target instanceof Element
            ? event.target.closest('button, a, [role="button"]')
            : null
          const scope = sidebarScope()
          const insideSidebar = target !== null
            && scope !== null
            && scope.contains(target)
            && !target.closest('.df-foot')
          if (!insideSidebar) {
            if (state.inside) {
              state.inside = false
              state.row = null
              wake()
            }
            return
          }
          state.row = target
          state.rail = target.matches('button')
          state.x = event.clientX
          state.y = event.clientY
          state.inside = true
          state.dirty = true
          wake()
        }

        const onLeave = () => {
          if (!state.inside) return
          state.inside = false
          state.row = null
          wake()
        }

        document.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerleave', onLeave)
        window.addEventListener('blur', onLeave)
        window.addEventListener('resize', wake)
        return () => {
          stopped = true
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerleave', onLeave)
          window.removeEventListener('blur', onLeave)
          window.removeEventListener('resize', wake)
          if (state.frame !== 0) cancelAnimationFrame(state.frame)
          state.frame = 0
          state.live = false
        }
      }, [showDots, showRail])
      return showDots || showRail
        ? h('canvas', { ref: canvasRef, className: 'df-overlay', 'aria-hidden': 'true' })
        : null
    }

    /**
     * Dot trail behind the composer caret.
     *
     * The caret itself is host-owned, so we only read its position (collapsed selection
     * range inside the active composer) and print a fading line of dots behind it on our
     * overlay canvas, clipped to the composer card. Dots never move once printed; they only
     * fade.
     */
    function DfCaretTrail() {
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        if (motion.matches) return undefined
        const trail = []
        const LIFE = 650
        const STEP = 3
        let stopped = false
        let frame = 0
        let last = null
        let trailCard = null
        let dpr = Math.min(2, devicePixelRatio || 1)

        // A caret (or an IME composition) has no reliable box of its own, so every
        // measurement falls back to the text or element next to the insertion point.
        const rectAt = (container, offset) => {
          if (container === null) return null
          const range = document.createRange()
          try {
            range.setStart(container, offset)
            range.collapse(true)
          } catch (error) {
            return null
          }
          const collapsed = range.getBoundingClientRect()
          if (collapsed.height > 0 && (collapsed.left > 0 || collapsed.top > 0)) {
            return { left: collapsed.left, top: collapsed.top, height: collapsed.height }
          }
          const measure = (node, side) => {
            if (node === null) return null
            const inner = document.createRange()
            inner.selectNodeContents(node)
            const box = inner.getBoundingClientRect()
            if (box.height === 0) return null
            return { left: side === 'end' ? box.right : box.left, top: box.top, height: box.height }
          }
          if (container.nodeType === 3) {
            const text = container.textContent || ''
            if (offset > 0) {
              const inner = document.createRange()
              inner.setStart(container, offset - 1)
              inner.setEnd(container, offset)
              const box = inner.getBoundingClientRect()
              if (box.height > 0) return { left: box.right, top: box.top, height: box.height }
            }
            if (text.length > 0) {
              const inner = document.createRange()
              inner.setStart(container, 0)
              inner.setEnd(container, 1)
              const box = inner.getBoundingClientRect()
              if (box.height > 0) return { left: box.left, top: box.top, height: box.height }
            }
            return null
          }
          if (container.nodeType === 1) {
            const children = container.childNodes
            return measure(offset > 0 ? children[offset - 1] : null, 'end')
              || measure(offset < children.length ? children[offset] : null, 'start')
          }
          return null
        }

        const caretOf = () => {
          const active = document.activeElement
          if (active === null || typeof active.closest !== 'function') return null
          const card = active.closest('[data-composer-card]')
          if (card === null) return null
          const editable = active instanceof HTMLElement && active.isContentEditable
            ? active
            : active.closest('[contenteditable], [role="textbox"], textarea')
          if (editable === null || !card.contains(editable)) return null
          const selection = window.getSelection()
          if (selection === null || selection.rangeCount === 0) return null
          // While an IME composes, the selection covers the composition text; the caret
          // sits at its focus end, so measure there instead of bailing out.
          const container = selection.isCollapsed ? selection.anchorNode : selection.focusNode
          const offset = selection.isCollapsed ? selection.anchorOffset : selection.focusOffset
          if (container === null) return null
          if (container !== active && !active.contains(container)) return null
          const rect = rectAt(container, offset)
          if (rect === null || rect.height === 0) return null
          return { x: rect.left, y: rect.top, height: rect.height, card }
        }

        const push = (from, to, now) => {
          const deviceX = to.x - from.x
          const deviceY = to.y - from.y
          const distance = Math.sqrt(deviceX * deviceX + deviceY * deviceY)
          if (distance < 1.5) return
          // A line wrap or a jump to another spot is not a trail; only same-line motion is.
          if (distance > 90 || Math.abs(deviceY) > 6) return
          const topFrom = from.y
          const topTo = to.y
          const steps = Math.max(1, Math.min(40, Math.round(distance / STEP)))
          for (let index = 1; index <= steps; index += 1) {
            const t = index / steps
            trail.push({
              x: from.x + deviceX * t,
              y: topFrom + (topTo - topFrom) * t,
              height: to.height || 18,
              born: now - (steps - index) * 6,
            })
          }
          while (trail.length > 220) trail.shift()
        }

        const sample = () => {
          const caret = caretOf()
          if (caret === null) {
            last = null
            trailCard = null
            return
          }
          trailCard = caret.card
          const now = performance.now()
          if (last !== null) {
            const sameCard = last.card === caret.card
            if (sameCard) push({ x: last.x, y: last.y, height: last.height }, caret, now)
          }
          last = { x: caret.x, y: caret.y, height: caret.height, card: caret.card }
          wake()
        }

        const paint = () => {
          frame = 0
          if (stopped) return
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          const now = performance.now()
          while (trail.length > 0 && now - trail[0].born > LIFE) trail.shift()
          if (trail.length === 0) {
            trailCard = null
            return
          }
          const card = trailCard
          let clip = null
          let radius = 12
          if (card !== null && card.isConnected) {
            clip = card.getBoundingClientRect()
            const style = getComputedStyle(card)
            radius = parseFloat(style.borderTopLeftRadius) || 12
          }
          const accent = (getComputedStyle(document.body).getPropertyValue('--df-accent') || '').trim() || '#7aa4ff'
          context.save()
          if (clip !== null) {
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(clip.left, clip.top, clip.width, clip.height, radius)
            } else {
              context.rect(clip.left, clip.top, clip.width, clip.height)
            }
            context.clip()
          }
          // Collect every dot once, then paint a soft halo pass and a crisp pass in
          // batches: per-dot fills with shadows would crawl.
          const dots = []
          for (const point of trail) {
            const age = (now - point.born) / LIFE
            if (age >= 1) continue
            const alpha = Math.pow(1 - age, 1.4) * 0.85
            if (alpha < 0.02) continue
            for (let offset = 1; offset < point.height - 0.5; offset += 3) {
              dots.push(point.x, point.y + offset, alpha)
            }
          }
          context.fillStyle = accent
          const passes = [
            { radius: 2.4, scale: 0.3 },
            { radius: 1.05, scale: 1 },
          ]
          for (const pass of passes) {
            const buckets = new Map()
            for (let index = 0; index < dots.length; index += 3) {
              const alpha = dots[index + 2] * pass.scale
              if (alpha < 0.02) continue
              const level = Math.min(10, Math.max(1, Math.round(alpha * 10)))
              let bucket = buckets.get(level)
              if (bucket === undefined) {
                bucket = new Path2D()
                buckets.set(level, bucket)
              }
              bucket.moveTo(dots[index] + pass.radius, dots[index + 1])
              bucket.arc(dots[index], dots[index + 1], pass.radius, 0, Math.PI * 2)
            }
            for (const [level, path] of buckets) {
              context.globalAlpha = level / 10
              context.fill(path)
            }
          }
          context.restore()
          context.globalAlpha = 1
          frame = requestAnimationFrame(paint)
        }

        const wake = () => {
          if (stopped || frame !== 0) return
          frame = requestAnimationFrame(paint)
        }

        window.__dfCaretProbe = () => {
          const caret = caretOf()
          return caret === null
            ? { ok: false, active: document.activeElement ? document.activeElement.tagName : null }
            : { ok: true, x: Math.round(caret.x), y: Math.round(caret.y), height: Math.round(caret.height) }
        }
        const onActivity = () => sample()
        document.addEventListener('selectionchange', onActivity)
        document.addEventListener('input', onActivity, true)
        document.addEventListener('beforeinput', onActivity, true)
        document.addEventListener('compositionupdate', onActivity, true)
        document.addEventListener('keyup', onActivity, true)
        document.addEventListener('click', onActivity, true)
        document.addEventListener('pointerup', onActivity, true)
        window.addEventListener('resize', wake)
        return () => {
          stopped = true
          document.removeEventListener('selectionchange', onActivity)
          document.removeEventListener('input', onActivity, true)
          document.removeEventListener('beforeinput', onActivity, true)
          document.removeEventListener('compositionupdate', onActivity, true)
          document.removeEventListener('keyup', onActivity, true)
          document.removeEventListener('click', onActivity, true)
          document.removeEventListener('pointerup', onActivity, true)
          window.removeEventListener('resize', wake)
          if (frame !== 0) cancelAnimationFrame(frame)
          frame = 0
          trail.length = 0
        }
      }, [])
      return h('canvas', {
        ref: canvasRef,
        className: 'df-overlay df-caret-layer',
        'aria-hidden': 'true',
        style: { zIndex: 2147483000 },
      })
    }

    /* fish runtime:start */
    // Profile settings and host theme token layers.
    const DF_SETTINGS_KEY = 'dsh-fish-ui:settings'
    const DF_FLAGS = [
      'hero', 'field', 'wave', 'ripple', 'thinkingSphere', 'thinkingLabel',
      'glass', 'effortBadge', 'sidebarDots', 'sidebarRail', 'bold', 'focusRing', 'diff',
      'reading', 'code', 'fishFont', 'fishGlow', 'fishMotion', 'fishCode',
      'catppuccin', 'aurora', 'cursor', 'textMotion', 'hostIcons', 'launchIntro',
    ] as const
    type FishSettings = Readonly<Record<typeof DF_FLAGS[number], boolean> & GlassValues & { scene: SceneId; sceneMotion: string; iconStyle: string; accentColor: string }>
    const DF_DEFAULT_SETTINGS = Object.freeze({
      ...Object.fromEntries(DF_FLAGS.map(key => [key, true])),
      ...Object.fromEntries(GLASS_KEYS.map(key => [key, GLASS_RANGES[key].default])),
      scene: 'atlas', sceneMotion: 'calm', iconStyle: 'duotone', accentColor: BRAND_BLUE,
    }) as FishSettings
    function validSetting(key: string, value: unknown) {
      if (Object.hasOwn(GLASS_RANGES, key)) return validGlassValue(key as GlassKey, value)
      if (key === 'accentColor') return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
      if (Object.hasOwn(STUDIO_CHOICES, key)) return typeof value === 'string' && STUDIO_CHOICES[key as keyof typeof STUDIO_CHOICES].includes(value)
      return (DF_FLAGS as readonly string[]).includes(key) && typeof value === 'boolean'
    }
    const DF_OFF_CLASS = Object.freeze(Object.fromEntries(DF_FLAGS
      .map(key => [key, 'df-off-' + key.toLowerCase()])))
    const dfSettingsListeners = new Set<() => void>()
    let dfSettings = DF_DEFAULT_SETTINGS
    let dfSnapshot = { values: dfSettings, status: 'loading', writable: false, pending: false, error: '' }
    type WriteSettings = (values: Partial<FishSettings>) => Promise<void>
    let dfWrite: WriteSettings | null = null
    let dfSettingsOwner: WriteSettings | null = null
    let dfTheme: FishThemeService | null = null
    const dfThemeLayers = new Map<string, () => void>()
    let dfMounted = false
    let windowPainting: HTMLImageElement
    const glassDrafts = new Map<GlassKey, { owner: symbol; value: number }>()

    function paintGlassValue(key: GlassKey) {
      if (!dfMounted) return
      const { css, unit } = GLASS_RANGES[key]
      const value = glassDrafts.get(key)?.value ?? dfSettings[key]
      document.documentElement.style.setProperty(css, value + unit)
    }

    // Both settings entry points can mount at once. Only the editor that owns a
    // draft may cancel it, and a delayed save may only release its own preview.
    function createGlassEditor() {
      const owner = Symbol()
      const cancel = (key: GlassKey) => {
        if (glassDrafts.get(key)?.owner !== owner) return
        glassDrafts.delete(key)
        paintGlassValue(key)
      }
      return {
        cancel,
        preview(key: GlassKey, value: number) {
          if (!dfSettings.glass || !dfSnapshot.writable || !validGlassValue(key, value)) return
          glassDrafts.set(key, { owner, value })
          paintGlassValue(key)
        },
        async commit(key: GlassKey, value: number) {
          const draft = glassDrafts.get(key)
          if (draft?.owner !== owner || !dfWrite || !dfSettings.glass || !dfSnapshot.writable
            || !validGlassValue(key, value) || dfSettings[key] === value) {
            cancel(key)
            return
          }
          const saving = { owner: Symbol(), value }
          glassDrafts.set(key, saving)
          try {
            await dfWrite({ [key]: value })
          } finally {
            if (glassDrafts.get(key) === saving) {
              glassDrafts.delete(key)
              paintGlassValue(key)
            }
          }
        },
      }
    }

    const dfReadLegacy = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(DF_SETTINGS_KEY))
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
        const values = Object.fromEntries(DF_FLAGS
          .filter(key => typeof parsed[key] === 'boolean').map(key => [key, parsed[key]]))
        return Object.keys(values).length ? values : null
      } catch { return null }
    }
    const dfLegacy = dfReadLegacy()
    dfSettings = Object.freeze({ ...DF_DEFAULT_SETTINGS, ...dfLegacy })
    dfSnapshot = { ...dfSnapshot, values: dfSettings }
    const dfSubscribeSettings = (listener: () => void) => {
      dfSettingsListeners.add(listener)
      return () => dfSettingsListeners.delete(listener)
    }
    const dfGetSnapshot = () => dfSnapshot
    const useDfSettings = () => React.useSyncExternalStore(dfSubscribeSettings, dfGetSnapshot, dfGetSnapshot)
    const dfModes = (light: string, dark: string) => ({ light, dark })
    const DF_CODE = {
      '--shiki-token-constant': dfModes('#2562A5', '#92BEF4'),
      '--shiki-token-string': dfModes('#326B55', '#A5CCB8'),
      '--shiki-token-comment': dfModes('#657287', '#8E9BAF'),
      '--shiki-token-keyword': dfModes('#765795', '#C0ACD8'),
      '--shiki-token-parameter': dfModes('#956032', '#D8B18A'),
      '--shiki-token-function': dfModes('#406A9D', '#A7C8F2'),
      '--shiki-token-string-expression': dfModes('#326B55', '#A5CCB8'),
      '--shiki-token-punctuation': dfModes('#546377', '#A6B2C4'),
      '--shiki-token-link': dfModes('#3269B7', '#8AB6FA'),
    }
    const DF_DIFF = {
      '--dsw-alias-file-diff-added-bg': dfModes('rgb(58 117 196 / 9%)', 'rgb(122 170 255 / 12%)'),
      '--dsw-alias-file-diff-added-gutter': dfModes('rgb(58 117 196 / 6%)', 'rgb(122 170 255 / 7%)'),
      '--dsw-alias-file-diff-added-marker': dfModes('#3269B7', '#8AB6FA'),
      '--dsw-alias-file-diff-deleted-bg': dfModes('rgb(164 97 83 / 9%)', 'rgb(213 156 139 / 10%)'),
      '--dsw-alias-file-diff-deleted-gutter': dfModes('rgb(164 97 83 / 6%)', 'rgb(213 156 139 / 6%)'),
      '--dsw-alias-file-diff-deleted-marker': dfModes('#995C50', '#D4A18F'),
      '--dsw-alias-code-diff-added': dfModes('rgb(58 117 196 / 10%)', 'rgb(122 170 255 / 13%)'),
      '--dsw-alias-code-diff-deleted': dfModes('rgb(164 97 83 / 10%)', 'rgb(213 156 139 / 11%)'),
    }
    const DF_CAT = {
      '--dsw-alias-bg-base': dfModes('#eff1f5', '#1e1e2e'),
      '--dsw-alias-bg-layer-1': dfModes('#e6e9ef', '#181825'),
      '--dsw-alias-bg-layer-2': dfModes('#dce0e8', '#11111b'),
      '--dsw-alias-bg-overlay': dfModes('#eff1f5', '#181825'),
      '--dsw-alias-border-l1': dfModes('#bcc0cc', '#313244'),
      '--dsw-alias-border-l2': dfModes('#acb0be', '#45475a'),
      '--dsw-alias-label-primary': dfModes('#4c4f69', '#cdd6f4'),
      '--dsw-alias-label-secondary': dfModes('#6c6f85', '#a6adc8'),
      '--dsw-specific-sidebar-fill': dfModes('#e6e9ef', '#181825'),
      '--dsw-alias-state-success-primary': dfModes('#40a02b', '#a6e3a1'),
      '--dsw-alias-state-warn-primary': dfModes('#df8e1d', '#f9e2af'),
      '--dsw-alias-state-error-primary': dfModes('#d20f39', '#f38ba8'),
      '--dsw-alias-state-idle-primary': dfModes('#8c8fa1', '#7f849c'),
    }
    function dfSyncTheme() {
      if (dfTheme === null) return
      const ink = dfSettings.accentColor.toUpperCase()
      const layers = new Map<string, FishThemeTokens>()
      if (dfSettings.aurora) {
        const [deep, , glow] = SCENES[dfSettings.scene].colors
        layers.set('scene-' + dfSettings.scene, {
          '--df-scene-deep': dfModes(deep, deep),
          '--df-scene-glow': dfModes(glow, glow),
        })
      }
      if (dfSettings.catppuccin) layers.set('palette', DF_CAT)
      const channels = [1, 3, 5].map(start => parseInt(ink.slice(start, start + 2), 16))
      const mixInk = (end: number, weight: number) => '#' + channels.map(channel =>
        Math.round(channel * (1 - weight) + end * weight).toString(16).padStart(2, '0')).join('')
      const brightness = .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]
      // Retain the selected hue and keep pale or very dark custom swatches visible on both surfaces.
      const lightInk = brightness > 165 ? mixInk(0, 1 - 138 / brightness) : ink
      const darkInk = brightness < 165 ? mixInk(255, (165 - brightness) / (255 - brightness)) : ink
      const focus = 'color-mix(in srgb, ' + ink + ' 22%, transparent)'
      layers.set('accent-' + ink.slice(1), {
        '--dsw-alias-brand-primary': dfModes(ink, ink),
        '--df-accent': dfModes(lightInk, darkInk),
        '--df-focus': dfModes(focus, focus),
        '--fish-second-ink': dfModes(darkInk, ink),
      })
      if (dfSettings.code) layers.set('code', DF_CODE)
      if (dfSettings.diff) layers.set('diff', DF_DIFF)
      for (const [name, dispose] of dfThemeLayers) {
        if (!layers.has(name)) {
          dispose()
          dfThemeLayers.delete(name)
        }
      }
      for (const [name, tokens] of layers) {
        if (!dfThemeLayers.has(name)) dfThemeLayers.set(name, dfTheme.overrideTokens('dsh-fish-ui:' + name, tokens))
      }
    }
    function dfApplySettings() {
      if (!dfMounted) return
      if (!dfSettings.glass || !dfSnapshot.writable) glassDrafts.clear()
      GLASS_KEYS.forEach(paintGlassValue)
      for (const [key, className] of Object.entries(DF_OFF_CLASS)) {
        document.documentElement.classList.toggle(className, dfSettings[key] === false)
      }
      document.documentElement.dataset.fishPace = dfSettings.sceneMotion
      document.documentElement.dataset.fishIcons = dfSettings.iconStyle
      setWindowPainting(windowPainting, dfSettings.aurora ? dfSettings.scene : undefined)
      dfSyncTheme()
    }
    function dfPublish(patch: Partial<typeof dfSnapshot>) {
      dfSnapshot = Object.freeze({ ...dfSnapshot, ...patch })
      dfSettings = dfSnapshot.values
      dfApplySettings()
      dfSettingsListeners.forEach(listener => listener())
    }
    function dfConnectSettings(scope: FishClientContext) {
      // This is the Host patch entry id; the bundle-config key below is the package name.
      const form = scope.configForms.get('dsh-fish-ui')
      let active = true
      let migrating = false
      let migrationTried = false
      const adopt = () => {
        if (!active) return
        const snapshot = form.getSnapshot()
        if (snapshot.status !== 'ready' || snapshot.value === undefined) {
          dfPublish({ status: snapshot.status, writable: false })
          return
        }
        const ownsValues = Object.keys(DF_DEFAULT_SETTINGS).some(key =>
          snapshot.user !== null && typeof snapshot.user === 'object' && Object.hasOwn(snapshot.user, key))
        const legacyKeys = dfLegacy === null ? []
          : Object.keys(dfLegacy).filter(key => Object.hasOwn(DF_DEFAULT_SETTINGS, key))
        if (!migrationTried && legacyKeys.length > 0 && !ownsValues && !snapshot.value.settingsMigrated && snapshot.writable) {
          migrationTried = true
          migrating = true
          dfPublish({ status: 'ready', writable: true, pending: true, error: '' })
          // Only carry keys the current schema still owns: a legacy blob may mention
          // preferences that were removed, and one unknown path rejects the whole write.
          const ops = Object.entries(dfLegacy)
            .filter(([key]) => Object.hasOwn(DF_DEFAULT_SETTINGS, key))
            .map(([key, value]) => ({ op: 'set', path: [key], value }))
          ops.push({ op: 'set', path: ['settingsMigrated'], value: true })
          // Fence the exact snapshot that established the namespace was empty.
          const migrate = async () => form.mutate(ops, snapshot.revision)
          migrate().then(ok => {
            if (!active) return
            migrating = false
            dfPublish({ pending: false, error: ok ? '' : 'conflict' })
            adopt()
          }, () => {
            if (!active) return
            migrating = false
            dfPublish({ pending: false, error: 'save' })
            adopt()
          })
          // Keep the legacy key read-only: other profiles may share this origin.
          return
        }
        if (migrating) return
        const values = Object.freeze(Object.fromEntries(Object.entries(DF_DEFAULT_SETTINGS)
          .map(([key, fallback]) => [key, validSetting(key, snapshot.value[key]) ? snapshot.value[key] : fallback]))) as FishSettings
        dfPublish({ values, status: 'ready', writable: snapshot.writable })
      }
      const write: WriteSettings = async values => {
        if (!active || dfSnapshot.pending || dfSnapshot.status !== 'ready' || !dfSnapshot.writable) return
        dfPublish({ pending: true, error: '' })
        try {
          const ops = Object.entries(values).filter(([key, value]) => validSetting(key, value))
            .map(([key, value]) => ({ op: 'set', path: [key], value }))
          ops.push({ op: 'set', path: ['settingsMigrated'], value: true })
          const ok = await form.mutate(ops, form.getSnapshot().revision)
          if (active) dfPublish({ error: ok ? '' : 'conflict' })
        } catch {
          if (active) dfPublish({ error: 'save' })
        } finally {
          if (active) { dfPublish({ pending: false }); adopt() }
        }
      }
      scope.effect(() => {
        dfWrite = write
        dfSettingsOwner = write
        const unsubscribe = form.subscribe(adopt)
        adopt()
        return () => {
          active = false
          unsubscribe()
          if (dfWrite === write) dfWrite = null
          if (dfSettingsOwner === write) {
            dfSettingsOwner = null
            dfPublish({ status: 'unavailable', writable: false, pending: false })
          }
        }
      }, 'dsh-fish-ui: Host preferences')
    }
    const dfSetSetting = <K extends keyof FishSettings>(key: K, value: FishSettings[K]) => dfWrite?.({ [key]: value })

    const staticLaunchMedia = window.matchMedia(staticArrivalMedia)
    const onMotionPreference = (listener: () => void) => {
      staticLaunchMedia.addEventListener('change', listener)
      return () => staticLaunchMedia.removeEventListener('change', listener)
    }
    const readStaticLaunch = () => staticLaunchMedia.matches
    let visitLaunchFrame: ((frame: HTMLElement, welcome: boolean, ready: boolean) => void) | undefined
    let noSessionSelected: (() => boolean) | undefined
    let stopPreview: (() => void) | undefined

    function attachLaunch() {
      const events = new AbortController()
      const root = document.documentElement
      let frameToPlay: HTMLElement | undefined
      let settle: number | undefined
      let expiry: number | undefined
      let stopAutomatic: (() => void) | undefined
      function finishWaiting() {
        events.abort()
        clearTimeout(expiry)
        clearTimeout(settle)
        visitLaunchFrame = undefined
        root.removeAttribute('data-df-await-arrival')
        document.dispatchEvent(new Event(whalePaintEvent))
      }
      if (!window.__dfSplashPlayed && !document.hidden && !staticLaunchMedia.matches && !navigator.userActivation?.hasBeenActive) {
        root.setAttribute('data-df-await-arrival', '')
        visitLaunchFrame = (frame, welcome, ready) => {
          const content = frame.closest<HTMLElement>('[data-conversation-content]')
          if (!content || content.closest('[inert], [aria-hidden="true"], [data-sidebar-right-panel]') ||
              content.className.includes('embeddedBody') || !content.getClientRects().length) return
          if (!welcome || (ready && (!dfSettings.hero || !dfSettings.launchIntro || !dfSettings.fishMotion || dfSettings.sceneMotion === 'still'))) {
            finishWaiting()
            return
          }
          if (!ready || frameToPlay === frame) return
          clearTimeout(settle)
          frameToPlay = frame
          let quietSince: number | undefined
          const whenRestored = () => {
            if (!frame.isConnected || frame.dataset.dfWelcome !== 'true') return finishWaiting()
            if (!content.dataset.conversationSession) {
              // Opening to the workspace chooser is a real welcome, even with a
              // populated catalog. Give Harness time to restore a retained main view.
              if (noSessionSelected?.()) quietSince ??= performance.now()
              else quietSince = undefined
              if (quietSince === undefined || performance.now() - quietSince < 320) {
                settle = window.setTimeout(whenRestored, 80)
                return
              }
            }
            finishWaiting()
            stopAutomatic = playFishLaunch(frame)
          }
          settle = window.setTimeout(whenRestored, 80)
        }
        const options = { capture: true, passive: true, signal: events.signal }
        for (const event of ['pointerdown', 'keydown', 'wheel', 'beforeinput', 'visibilitychange']) {
          document.addEventListener(event, finishWaiting, options)
        }
        expiry = window.setTimeout(finishWaiting, 4000)
      }
      window.__dfSplashPlayed = true
      return () => { finishWaiting(); stopAutomatic?.(); stopPreview?.(); stopPreview = undefined }
    }

    class DfBoundary extends React.Component<{ children?: React.ReactNode; fallback?: React.ReactNode }> {
      state = { failed: false }
      static getDerivedStateFromError() { return { failed: true } }
      componentDidCatch(error) { console.error('[dsh-fish-ui] enhancement failed', error) }
      render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children }
    }
    const dfSafe = Component => function DeepFishSafeSlot(props) {
      return h(DfBoundary, { fallback: props.children }, h(Component, props))
    }

/* fish runtime:end */

    /** Settings copy follows the app language (Chinese unless the UI is English). */
    const dfUsesChinese = () => {
      const lang = (document.documentElement.lang || navigator.language || '').toLowerCase()
      return lang.startsWith('zh')
    }
    type LanguageCopy = { lead: string; groups: Record<string, string>; items: Record<string, [string, string]>; reset: string; close: string; dialog: string; button: string }
    const DF_COPY: Record<'en' | 'zh', LanguageCopy> = {
      zh: {
        lead: '\u8fd9\u91cc\u7684\u5f00\u5173\u7acb\u5373\u751f\u6548\uff0c\u5e76\u6309\u914d\u7f6e\u6587\u4ef6\u8bb0\u4f4f\u3002',
        groups: {
          hero: '\u6b22\u8fce\u9875',
          thinking: '\u601d\u8003\u4e2d',
          composer: '\u8f93\u5165\u6846',
          accents: '\u5f3a\u8c03\u8272',
          sidebar: '侧边栏',
        },
        items: {
          hero: ['点阵鲸鱼娘', '在欢迎页显示原版鲸鱼娘立绘'],
          field: ['\u80cc\u666f\u70b9\u9635', '\u94fa\u6ee1\u6574\u9875\u7684\u6de1\u70b9\u9635'],
          wave: ['\u5e95\u90e8\u6ce2\u6d6a', '\u9875\u9762\u5e95\u90e8\u7f13\u6162\u6d41\u52a8\u7684\u660e\u6697\u6ce2'],
          ripple: ['\u6307\u9488\u6d9f\u6f2a', '\u9f20\u6807\u5212\u8fc7\u70b9\u9635\u65f6\u8361\u5f00\u7684\u5149\u73af'],
          thinkingSphere: ['\u70b9\u9635\u7403', '\u601d\u8003\u65f6\u65cb\u8f6c\u7684\u5c0f\u7403'],
          thinkingLabel: ['英文思考文案', '把状态行换成 “Deep thinking for 12s. . .”'],
          glass: ['磨砂玻璃', '为两侧栏、顶栏、输入框和命令菜单加入磨砂质感'],
          stats: ['\u7528\u91cf\u8bfb\u6570', '\u5728\u53d1\u9001\u6309\u94ae\u6392\u663e\u793a\u4e0a\u4e0b\u6587\u4e0e Token \u7528\u91cf'],
          bold: ['\u9cb8\u9c7c\u84dd\u52a0\u7c97', '\u804a\u5929\u91cc\u7684\u52a0\u7c97\u6587\u5b57\u53d8\u6210\u9cb8\u9c7c\u84dd'],
          focusRing: ['\u805a\u7126\u63cf\u8fb9', '\u8f93\u5165\u6846\u805a\u7126\u65f6\u7684\u67d4\u5149\u63cf\u8fb9'],
          diff: ['diff \u6362\u84dd', '\u65b0\u589e / \u5220\u9664\u884c\u6539\u6210\u84dd\u8272\u65cf'],
        },
        reset: '\u6062\u590d\u9ed8\u8ba4',
        close: '\u5173\u95ed',
        dialog: 'Deep Fish UI \u8bbe\u7f6e',
        button: 'Deep Fish UI \u8bbe\u7f6e',
      },
      en: {
        lead: 'Everything here applies immediately and is remembered per profile.',
        groups: { hero: 'Welcome page', thinking: 'Thinking', composer: 'Composer', accents: 'Accents', sidebar: 'Sidebar' },
        items: {
          hero: ['Dot portrait', 'Show the original whale-girl artwork on the welcome page'],
          field: ['Dot field', 'The faint lattice behind everything'],
          wave: ['Bottom wave', 'The slow brightness wave along the bottom edge'],
          ripple: ['Pointer ripples', 'Light rings where the pointer crosses the field'],
          thinkingSphere: ['Dot sphere', 'The rotating point-sphere beside the live status'],
          thinkingLabel: ['English status label', 'Replace the status row with “Deep thinking for 12s. . .”'],
          glass: ['Frosted glass', 'Frost the side panels, top bar, composer and command menu'],
          bold: ['Whale-blue bold', 'Bold runs in chat prose take the accent colour'],
          focusRing: ['Focus ring', 'The soft ring while the composer has focus'],
          diff: ['Re-inked diffs', 'Added and removed lines in the blue family'],
        },
        reset: 'Reset to defaults',
        close: 'Close',
        dialog: 'Deep Fish UI settings',
        button: 'Deep Fish UI settings',
      },
    }

    Object.assign(DF_COPY.zh.items, {
      reading: ['阅读排版', '舒展段落、标题与引用，保留你的字号'],
      code: ['代码配色', '低饱和语法颜色，保持代码层次'],
      effortBadge: ['推理强度波形', '在模型选择器中显示当前推理档位的波形反馈'],
      sidebarDots: ['悬停点阵', '鼠标悬停在侧边栏按钮上时亮起点阵'],
      sidebarRail: ['蓝色竖线', '在悬停按钮左侧显示鲸鱼蓝竖线'],
      thinkingLabel: ['英文思考文案', '把状态行换成 “Deep thinking for 12s. . .”'],
      diff: ['差异配色', '新增用蓝色，删除用暖色，保留语法高亮'],
    })
    Object.assign(DF_COPY.en.items, {
      reading: ['Reading layout', 'Clear paragraphs, headings and quotes at your chosen font size'],
      code: ['Code palette', 'Muted, distinct syntax colours'],
      effortBadge: ['Reasoning waveform', 'Show the selected reasoning intensity in the model control'],
      sidebarDots: ['Hover dot field', 'Light the dot field around the pointer on sidebar buttons'],
      sidebarRail: ['Blue rail', 'Show a whale-blue rail on the left of the hovered button'],
      thinkingLabel: ['English status label', 'Replace the status row with “Deep thinking for 12s. . .”'],
      diff: ['Diff palette', 'Blue additions and warm deletions, with syntax highlighting intact'],
    })

    Object.assign(DF_COPY.zh.items, {
      fishFont: ['Maple Mono 字体', '全站换成 Maple Mono NF CN，正文与代码统一字体'],
      fishGlow: ['输入框柔光', '16px 圆角，聚焦时带主题色光晕'],
      fishMotion: ['轻动效', '按钮悬停上浮，界面过渡更柔和'],
      fishCode: ['代码块质感', '圆角描边与行内代码小药丸'],
    })
    Object.assign(DF_COPY.en.items, {
      fishFont: ['Maple Mono type', 'Use Maple Mono NF CN everywhere, including code'],
      fishGlow: ['Composer glow', '16px radius plus an accent glow on focus'],
      fishMotion: ['Soft motion', 'Buttons lift on hover and surfaces ease between states'],
      fishCode: ['Code surface', 'Rounded code blocks and tinted inline-code pills'],
    })
    Object.assign(DF_COPY.zh.items, {
      catppuccin: ['Catppuccin 配色', 'Latte / Mocha 全套背景、文字、边框与强调色'],
      aurora: ['窗口背景', '将所选场景铺满窗口，延伸到侧栏、顶栏和底栏下方'],
      cursor: ['指针物理', '移动指针时，输入框微微倾斜，玻璃边缘随光线明暗变化'],
      textMotion: ['思考与文字动效', '回复浮入、思考块微光、流式文字呼吸感'],
      hostIcons: ['导航与操作图标', '新会话、搜索、文件夹、复制和发送等按钮使用所选图标风格'],
      launchIntro: ['开场动画', '启动到欢迎页时播放，可点按或键入跳过'],
    })
    Object.assign(DF_COPY.en.items, {
      catppuccin: ['Catppuccin palette', 'Latte / Mocha backgrounds, text, borders and accents'],
      aurora: ['Window backdrop', 'Extend the selected painting across the window and under the side, top and bottom bars'],
      cursor: ['Pointer physics', 'Tilt the composer gently and move the light along its glass edge'],
      textMotion: ['Thinking & text motion', 'Replies rise in, reasoning shimmers, streaming text breathes'],
      hostIcons: ['Navigation & action icons', 'Use the chosen icon style for new chats, search, folders, copy, send and related controls'],
      launchIntro: ['Launch animation', 'Play on the welcome page at startup. Click or type to skip.'],
    })
    /** Switch drawn as SVG so the capsule ends and the knob are exact shapes. */
    function DfSwitchSvg({ value }: { value: boolean }) {
      const on = value === true
      return h('svg', {
        width: 42,
        height: 24,
        viewBox: '0 0 42 24',
        'aria-hidden': 'true',
        style: { display: 'block', overflow: 'visible' },
      }, [
        h('rect', {
          key: 'track',
          x: 0.5,
          y: 0.5,
          width: 41,
          height: 23,
          rx: 11.5,
          ry: 11.5,
          style: {
            fill: on
              ? 'color-mix(in srgb, var(--dsw-alias-label-primary) 94%, transparent)'
              : 'color-mix(in srgb, var(--dsw-alias-label-tertiary) 44%, transparent)',
            // Only the enabled state carries an outline; keep the SVG geometry fixed.
            stroke: on
              ? 'color-mix(in srgb, var(--dsw-alias-label-primary) 94%, transparent)'
              : 'none',
            strokeWidth: 1,
            transition: 'fill 200ms cubic-bezier(0.22, 1, 0.36, 1), stroke 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }),
        h('g', {
          key: 'knob',
          style: {
            transform: on ? 'translateX(18px)' : 'translateX(0px)',
            transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }, h('circle', {
          cx: 12,
          cy: 12,
          r: 9,
          style: {
            fill: on ? 'var(--dsw-alias-bg-base, #17171a)' : 'color-mix(in srgb, var(--dsw-alias-label-primary) 82%, transparent)',
            transition: 'fill 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        })),
      ])
    }

    /** One settings row: a label on the left and a switch on the right. */
    function DfSwitch({ icon, label, description, value, disabled, onChange }: { icon: keyof typeof FISH_ICONS; label: string; description?: string; value: boolean; disabled: boolean; onChange(value: boolean): void }) {
      return h('div', { className: 'df-set-row' }, [
        h('span', { key: 'icon', className: 'fish-row-icon' }, h(FishIcon, { name: icon })),
        h('div', { key: 'text', className: 'df-set-text' }, [
          h('span', { key: 'label', className: 'df-set-label' }, label),
          description === undefined
            ? null
            : h('span', { key: 'desc', className: 'df-set-desc' }, description),
        ]),
        h('button', {
          key: 'switch',
          type: 'button',
          role: 'switch',
          disabled,
          'aria-checked': value ? 'true' : 'false',
          'aria-label': label,
          className: 'df-switch',
          'data-on': value ? 'true' : undefined,
          onClick: () => onChange(!value),
        }, h(DfSwitchSvg, { key: 'glyph', value: value === true })),
      ])
    }

    const FISH_CSS = `
      :root {
        --fish-font: "Maple Mono NF CN", "Maple Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        --fish-ink: var(--df-accent, #4D6BFE);
      }
      :root:not(.df-off-fishfont) body {
        font-family: var(--fish-font) !important;
        font-feature-settings: "ss01" 1, "cv01" 1, "liga" 1;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      :root:not(.df-off-fishfont) button,
      :root:not(.df-off-fishfont) input,
      :root:not(.df-off-fishfont) textarea,
      :root:not(.df-off-fishfont) select,
      :root:not(.df-off-fishfont) [contenteditable="true"] {
        font-family: inherit !important;
      }
      :root:not(.df-off-fishfont) code,
      :root:not(.df-off-fishfont) pre,
      :root:not(.df-off-fishfont) kbd,
      :root:not(.df-off-fishfont) samp {
        font-family: var(--fish-font) !important;
      }
      :root:not(.df-off-fishfont) p,
      :root:not(.df-off-fishfont) li,
      :root:not(.df-off-fishfont) blockquote {
        line-height: 1.75;
      }
      :root:not(.df-off-fishglow) [data-composer-card] {
        border-radius: 16px !important;
        transition: box-shadow .25s ease, border-color .25s ease;
      }
      :root:not(.df-off-fishcode) pre {
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, #333) 70%, transparent);
      }
      :root:not(.df-off-fishcode) :not(pre) > code {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, #222) 78%, transparent);
        padding: .12em .38em;
        border-radius: 5px;
      }
      /* Keep native controls and their hit areas stationary. Only independent
         buttons inside the Fish settings sheet get a physical lift. */
      @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
        :root:not(.df-off-fishmotion,[data-fish-pace="still"]) .fish-studio button.fish-segment {
          transition: transform .16s ease, box-shadow .16s ease;
        }
        :root:not(.df-off-fishmotion,[data-fish-pace="still"]) .fish-studio button.fish-segment:enabled:hover {
          transform: translateY(-1px);
        }
      }
      ::selection {
        background: color-mix(in srgb, var(--fish-ink) 32%, transparent);
      }
      ::-webkit-scrollbar {
        width: 9px;
        height: 9px;
      }
      ::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--dsw-alias-border-l2, #555) 60%, transparent);
        border-radius: 999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--fish-ink);
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `

    const FISH_FX_CSS = `
      body { --fish-ink: var(--df-accent, #4D6BFE); }
      .fish-cursor-glow {
        position: fixed;
        left: 0;
        top: 0;
        width: 360px;
        height: 360px;
        margin: -180px 0 0 -180px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transition: opacity .35s ease;
        background: radial-gradient(circle, color-mix(in srgb, var(--df-accent, #4D6BFE) 18%, transparent), transparent 66%);
        will-change: transform;
      }
      .fish-cursor-glow[data-active] { opacity: .55; }
      :root:not(.df-off-cursor) [data-composer-card] {
        transition: transform .2s ease, box-shadow .25s ease;
      }
      [data-composer-card].fish-tilting {
        transform: perspective(900px) rotateX(var(--fish-tilt-x)) rotateY(var(--fish-tilt-y));
      }
      /* Harness anchors the slash and mention menus inside the card, above its bounds. */
      [data-composer-card].fish-tilting:has([data-composer-overlay] :is([data-trigger-menu], [role="listbox"], input[type="text"])) {
        transform: none;
        transition-property: box-shadow, border-color;
      }
      :root:not(.df-off-textmotion) [data-chat-flow-kind="assistant-step"] {
        animation: fish-rise .4s cubic-bezier(.16,1,.3,1) both;
      }
      @keyframes fish-rise {
        from { opacity: 0; transform: translateY(7px); }
        to { opacity: 1; transform: none; }
      }
      :root:not(.df-off-textmotion) [data-chat-group-part="reasoning"] {
        border-left: 2px solid color-mix(in srgb, var(--df-accent, #4D6BFE) 45%, transparent);
        padding-left: 10px;
        animation: fish-breathe 4.5s ease-in-out infinite;
      }
      @keyframes fish-breathe {
        0%, 100% { opacity: .72; }
        50% { opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .fish-cursor-glow { display: none; }
        :root body { animation: none !important; }
      }
    `

    const FISH_STUDIO_CSS = `
.fish-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}
.fish-backdrop[data-home="true"] {
  z-index: -2;
}
[data-conversation-content]:has(.fish-backdrop[data-home="false"]) [data-conversation-scroll] {
  position: relative;
}
.fish-backdrop > svg, .fish-cover > svg, .fish-card-art > svg {
  display: block;
  width: 100%;
  height: 100%;
}
.fish-studio, .df-sheet-panel {
  --fish-panel: var(--dsw-alias-bg-base, #f5f7f5);
  --fish-label: var(--dsw-alias-label-primary, #293936);
  --fish-muted: var(--dsw-alias-label-secondary, #53645f);
  --fish-edge: color-mix(in srgb, var(--fish-label) 17%, transparent);
  --fish-well: color-mix(in srgb, var(--fish-label) 5%, var(--fish-panel));
  --fish-selected: color-mix(in srgb, var(--df-accent, #4D6BFE) 12%, var(--fish-panel));
}
.df-sheet-panel {
  width: min(526px, calc(100vw - 28px));
  max-height: min(88dvh, 808px);
  bottom: max(14px, min(7vh, 64px));
  background: var(--fish-panel);
  border: 1px solid var(--fish-edge);
  box-shadow: 0 22px 64px rgb(15 30 40 / .27), 0 3px 14px rgb(15 30 40 / .13);
  box-sizing: border-box;
}
.df-sheet-head { flex: none; padding: 12px 17px; }
.df-sheet-title { display: inline-flex; align-items: center; gap: 9px; font-size: 14px; letter-spacing: -.02em; }
.fish-brand { display: block; flex: none; width: 27px; height: 27px; object-fit: contain; }
.df-foot-button { gap: 8px; }
.df-foot-button .fish-brand { width: 22px; height: 22px; }
.fish-foot-scene { display: inline-flex; margin-inline-start: auto; color: var(--df-accent); }
.df-sheet-close {
  display: inline-grid; place-items: center; width: 28px; height: 28px;
  border: 1px solid var(--fish-edge); border-radius: 50%; color: var(--fish-muted);
}
.df-sheet-body { padding: 0; overscroll-behavior: contain; min-height: 0; }
.fish-studio {
  box-sizing: border-box; max-width: 740px; width: 100%; min-width: 0; margin: 0;
  padding: 14px 16px 12px; color: var(--fish-label); container-type: inline-size;
}
.fish-studio *, .fish-studio *::before, .fish-studio *::after { box-sizing: border-box; }
.fish-studio fieldset { min-inline-size: 0; border: 0; padding: 0; margin: 0; }
.fish-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }
.fish-icon { display: inline-block; flex: none; vertical-align: middle; }
.fish-icon-tone { fill: color-mix(in srgb, var(--fish-second-ink, #78bea9) 66%, currentColor); opacity: .52; }
html[data-fish-icons="line"] .fish-icon-tone { display: none; }
.fish-cover {
  position: relative; isolation: isolate; overflow: hidden; height: clamp(104px, 24cqi, 154px);
  border-radius: 13px; color: #fff; background: #133b43;
}
.fish-cover > svg { position: absolute; inset: 0; }
.fish-cover::after {
  position: absolute; content: ""; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, rgb(7 19 28 / .79), rgb(7 19 28 / .43) 43%, transparent 77%);
}
.fish-cover-copy { position: absolute; z-index: 1; inset-inline: 17px; bottom: 13px; }
.fish-cover-kicker {
  display: block; margin: 0 0 4px; font: 600 9px/1.2 var(--fish-font, monospace);
  letter-spacing: .16em; text-transform: uppercase; color: #e3eceb;
}
.fish-cover h2 {
  margin: 0; color: #fffaf1; font: 500 clamp(23px, 5.8cqi, 36px)/1.13 "Baskervville", "Songti SC", Georgia, serif;
  letter-spacing: -.02em;
}
.fish-cover p { margin: 5px 0 0; font-size: 11px; color: #edf1ef; }
.fish-swatches { position: absolute; z-index: 1; right: 12px; bottom: 12px; display: flex; border: 1px solid rgb(255 255 255 / .5); border-radius: 3px; overflow: hidden; }
.fish-swatches i { width: 10px; height: 7px; }
.fish-tabs { display: flex; gap: 16px; margin: 10px 0 13px; border-bottom: 1px solid var(--fish-edge); }
.fish-tabs button {
  position: relative; display: inline-flex; align-items: center; gap: 6px;
  min-height: 34px; padding: 3px 3px 7px; background: none; border: 0; color: var(--fish-muted);
  font: inherit; font-size: 12px; cursor: pointer;
}
.fish-tabs button[aria-pressed="true"] { font-weight: 650; color: var(--df-accent); }
.fish-tabs button[aria-pressed="true"]::after { position: absolute; content: ""; inset: auto 1px -1px; height: 2px; border-radius: 2px; background: currentColor; }
.fish-scene-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.fish-scene-card {
  position: relative; min-width: 0; display: flex; flex-direction: column; padding: 3px; overflow: hidden;
  border-radius: 10px; border: 1px solid var(--fish-edge); background: var(--fish-panel); cursor: pointer;
}
.fish-card-art { position: relative; display: block; overflow: hidden; aspect-ratio: 2.46; border-radius: 6px; }
.fish-card-label {
  display: flex; align-items: center; gap: 6px; min-height: 29px; padding: 4px 4px 1px;
  color: var(--fish-label); font-size: 11px; font-weight: 600; line-height: 1.25;
}
.fish-card-label svg { color: var(--fish-muted); }
.fish-picked {
  position: absolute; display: grid; place-items: center; right: 5px; top: 5px; width: 18px; height: 18px;
  border: 1px solid rgb(0 0 0 / .2); border-radius: 50%; background: #f8fff9; color: #17453e;
}
.fish-scene-card:has(input:checked) { background: var(--fish-selected); border-color: var(--df-accent); box-shadow: inset 0 0 0 .5px var(--df-accent); }
.fish-scene-card:has(input:checked) .fish-card-label svg { color: var(--df-accent); }
.fish-studio :is(button, .fish-segment, .fish-scene-card):focus-visible,
.fish-studio label:has(input:focus-visible), .df-sheet-close:focus-visible {
  outline: 2px solid var(--df-accent, #4D6BFE); outline-offset: 2px;
}
@media (hover: hover) {
  .fish-scene-card:not(:has(:disabled)):hover { border-color: var(--df-accent); }
  .fish-segment:hover, .fish-tabs button:hover { color: var(--fish-label); }
}
.fish-controls {
  margin-top: 12px; padding: 0 11px; border: 1px solid var(--fish-edge); border-radius: 11px;
  background: color-mix(in srgb, var(--fish-well) 35%, var(--fish-panel));
}
.fish-controls > :is(fieldset,.df-set-row) + :is(fieldset,.df-set-row) { border-top: 1px solid var(--fish-edge); }
.fish-inks { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.fish-ink-option {
  position: relative; display: grid; place-items: center; width: 24px; height: 26px; cursor: pointer;
}
.fish-ink-option::before {
  content: ''; width: 16px; height: 16px; border-radius: 50%; background: var(--fish-swatch);
}
.fish-ink-option:has(input:checked)::before { outline: 1.5px solid var(--fish-swatch); outline-offset: 2px; }
.fish-custom-color { position: relative; cursor: pointer; font-size: 11px; color: var(--fish-label);
  padding: 3px 6px; border: 1px solid var(--fish-edge); border-radius: 5px; }
.fish-custom-color input { position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; opacity: 0; }
.fish-controls .df-set-row, .fish-controls-row { min-height: 40px; padding: 5px 0; }
.fish-controls .df-set-row { gap: 8px; }
.fish-controls .df-set-desc { display: none; }
.fish-controls-row, .fish-control-label, .fish-segment, .df-set-reset, .fish-row-icon { display: inline-flex; align-items: center; }
.fish-controls-row { display: flex; justify-content: space-between; gap: 6px; }
.fish-control-label, .fish-controls .df-set-label { font-size: 12px; font-weight: 550; }
.fish-control-label { gap: 8px; }
.fish-control-label > svg, .fish-row-icon { color: var(--df-accent); }
.fish-segment-track { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 2px; background: var(--fish-well); border-radius: 7px; }
.fish-segment {
  position: relative; justify-content: center; gap: 4px; padding: 4px 7px; min-height: 24px; border: 1px solid transparent;
  border-radius: 5px; color: var(--fish-muted); cursor: pointer; font-size: 11px; line-height: 1.15;
}
.fish-segment:has(input:checked) { border-color: var(--fish-edge); background: var(--fish-panel); color: var(--df-accent); font-weight: 650; }
.fish-studio fieldset:disabled .fish-segment, .fish-studio fieldset:disabled .fish-scene-card { cursor: default; opacity: .65; }
.fish-details .df-set-group { margin: 0 0 14px; padding: 0 0 7px; }
.fish-details .df-set-group-title { margin: 12px 0 3px; color: var(--df-accent); font-weight: 650; }
.fish-details .df-set-row { gap: 10px; padding: 7px 0; }
.fish-details .fish-row-icon { justify-content: center; width: 29px; height: 29px; border-radius: 8px; background: var(--fish-selected); }
.fish-studio .df-set-label { color: var(--fish-label); }
.fish-studio .df-set-desc, .fish-studio .df-set-note { color: var(--fish-muted); }
.fish-studio .df-switch svg { width: 34px; height: 20px; }
.fish-studio .df-switch[data-on="true"] rect { fill: var(--df-accent) !important; stroke: var(--df-accent) !important; }
.fish-studio .df-set-footer { padding-top: 11px; gap: 8px; }
.fish-studio .df-set-reset { gap: 5px; padding: 4px 0; font-size: 11px; border: 0; background: transparent; color: var(--fish-muted); }
.fish-studio .df-set-note { font-size: 10px; }
.fish-studio .df-settings-status { margin: 0 0 9px; }
@container (max-width: 390px) {
  .fish-scene-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
  .fish-card-art { aspect-ratio: 2.7; }
  .fish-control-label { gap: 5px; }
  .fish-segment { padding-inline: 5px; }
}
@container (max-width: 300px) {
  .fish-controls-row { flex-wrap: wrap; padding-block: 7px; }
  .fish-swatches, .fish-segment svg { display: none; }
}
@media (max-height: 540px) {
  .df-sheet-panel { bottom: 8px; max-height: calc(100dvh - 16px); }
}
`

    function attachPointerPhysics() {
      const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
      let glow: HTMLDivElement | null = null
      let card: HTMLElement | null = null
      let cardDirty = false
      let frame = 0
      let x = 0, y = 0, targetX = 0, targetY = 0
      const clearCard = () => {
        if (!card) return
        card.classList.remove('fish-tilting')
        card.style.removeProperty('--fish-tilt-x')
        card.style.removeProperty('--fish-tilt-y')
        card.style.removeProperty('--df-glass-light-x')
        cardDirty = false
        card = null
      }
      const paint = () => {
        if (card && cardDirty) {
          cardDirty = false
          const rect = card.getBoundingClientRect()
          if (rect.width && rect.height) {
            const u = Math.max(0, Math.min(1, (targetX - rect.left) / rect.width))
            const v = Math.max(0, Math.min(1, (targetY - rect.top) / rect.height))
            card.style.setProperty('--fish-tilt-x', ((.5 - v) * 1.6).toFixed(2) + 'deg')
            card.style.setProperty('--fish-tilt-y', ((u - .5) * 1.6).toFixed(2) + 'deg')
            card.style.setProperty('--df-glass-light-x', Math.round(u * 100) + '%')
            card.classList.add('fish-tilting')
          }
        }
        x += (targetX - x) * .22
        y += (targetY - y) * .22
        glow.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'
        frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .6 ? requestAnimationFrame(paint) : 0
      }
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        targetX = event.clientX
        targetY = event.clientY
        if (!glow.hasAttribute('data-active')) {
          x = targetX
          y = targetY
          glow.setAttribute('data-active', '')
        }
        if (!frame) frame = requestAnimationFrame(paint)
        const target = event.target instanceof Element ? event.target : null
        const next = target?.closest('[data-composer-overlay], [role="menu"]')
          ? null : target?.closest<HTMLElement>('[data-composer-card]') ?? null
        if (next !== card) { clearCard(); card = next }
        cardDirty = card !== null
      }
      const leave = () => {
        cancelAnimationFrame(frame)
        frame = 0
        glow?.removeAttribute('data-active')
        clearCard()
      }
      const stop = () => {
        leave()
        window.removeEventListener('pointermove', move)
        document.documentElement.removeEventListener('pointerleave', leave)
        window.removeEventListener('blur', leave)
        glow?.remove()
        glow = null
      }
      const sync = () => {
        const enabled = dfSettings.cursor && dfSettings.sceneMotion !== 'still' && media.matches && !document.hidden
        if (enabled === Boolean(glow)) return
        if (!enabled) { stop(); return }
        glow = document.createElement('div')
        glow.className = 'fish-cursor-glow'
        glow.setAttribute('aria-hidden', 'true')
        document.body.append(glow)
        window.addEventListener('pointermove', move, { passive: true })
        document.documentElement.addEventListener('pointerleave', leave)
        window.addEventListener('blur', leave)
      }
      const unsubscribe = dfSubscribeSettings(sync)
      media.addEventListener('change', sync)
      document.addEventListener('visibilitychange', sync)
      sync()
      return () => {
        unsubscribe()
        media.removeEventListener('change', sync)
        document.removeEventListener('visibilitychange', sync)
        stop()
      }
    }

    function FishScenePicker({ state, disabled, zh }: { state: FishSettings; disabled: boolean; zh: boolean }) {
      const group = React.useId()
      return h('fieldset', { className: 'fish-scene-picker', disabled },
        h('legend', { className: 'fish-sr' }, zh ? '选择场景' : 'Choose a scene'),
        h('div', { className: 'fish-scene-grid' }, (Object.entries(SCENES) as [SceneId, FishScene][]).map(([id, scene]) =>
          h('label', { className: 'fish-scene-card', key: id },
            h('input', { type: 'radio', className: 'fish-sr', name: group, value: id, checked: state.scene === id,
              onChange: () => dfSetSetting('scene', id) }),
            h('span', { className: 'fish-card-art' }, h(FishPlate, { scene: id }),
              state.scene === id && h('span', { className: 'fish-picked' }, h(FishIcon, { name: 'check', size: 13 }))),
            h('span', { className: 'fish-card-label' }, h(FishIcon, { name: scene.icon, size: 16 }), zh ? scene.zh : scene.en)))))
    }

    function FishAccentPicker({ value, disabled, zh }: { value: string; disabled: boolean; zh: boolean }) {
      const input = React.useRef<HTMLInputElement>(null)
      const group = React.useId()
      const title = zh ? '强调色' : 'Accent color'
      // A native color dialog can emit many input events while scrubbing. Persist its committed change.
      React.useEffect(() => {
        const node = input.current
        if (!node) return
        const commit = () => dfSetSetting('accentColor', node.value.toUpperCase())
        node.addEventListener('change', commit)
        return () => node.removeEventListener('change', commit)
      }, [])
      React.useEffect(() => { if (input.current) input.current.value = value }, [value])
      return h('fieldset', { className: 'fish-accent-picker', disabled },
        h('legend', { className: 'fish-sr' }, title),
        h('div', { className: 'fish-controls-row' },
          h('span', { className: 'fish-control-label', 'aria-hidden': true }, h(FishIcon, { name: 'catppuccin' }), title),
          h('div', { className: 'fish-inks' },
            ACCENT_SWATCHES.map(([hex, cn, en]) => h('label', { key: hex, className: 'fish-ink-option',
              style: { '--fish-swatch': hex }, title: zh ? cn : en },
              h('input', { type: 'radio', className: 'fish-sr', name: group, value: hex, 'aria-label': zh ? cn : en,
                checked: value.toUpperCase() === hex, onChange: () => dfSetSetting('accentColor', hex) }))),
            h('label', { className: 'fish-custom-color' }, zh ? '自选' : 'Custom',
              h('input', { type: 'color', ref: input, defaultValue: value, 'aria-label': zh ? '自选强调色' : 'Custom accent color' })))))
    }

    function FishSegments({ name, label, icon, value, options, disabled }) {
      const group = React.useId()
      return h('fieldset', { className: 'fish-segments', disabled },
        h('legend', { className: 'fish-sr' }, label),
        h('div', { className: 'fish-controls-row' },
          h('span', { className: 'fish-control-label', 'aria-hidden': true }, h(FishIcon, { name: icon }), label),
          h('div', { className: 'fish-segment-track' }, options.map(([id, title, glyph]) =>
            h('label', { key: id, className: 'fish-segment' },
              h('input', { type: 'radio', className: 'fish-sr', name: group, value: id, checked: value === id,
                onChange: () => dfSetSetting(name, id) }),
              h(FishIcon, { name: glyph, size: 14 }), title)))))
    }

    function DfSettingsPage() {
      const copy = dfUsesChinese() ? DF_COPY.zh : DF_COPY.en
      const settings = useDfSettings()
      const state = settings.values
      const staticDisplay = React.useSyncExternalStore(onMotionPreference, readStaticLaunch, readStaticLaunch)
      const staticIntro = staticDisplay || state.sceneMotion === 'still' || !state.fishMotion || !state.hero
      const [tab, setTab] = React.useState('scenes')
      const glassEditor = React.useMemo(createGlassEditor, [])
      const scene = SCENES[state.scene]
      const disabled = settings.status !== 'ready' || !settings.writable || settings.pending
      const update = (key: keyof FishSettings) => (value: boolean) => dfSetSetting(key, value)
      const reset = () => dfWrite?.(DF_DEFAULT_SETTINGS)
      const group = (title, children) => h('section', { key: title, className: 'df-set-group' }, [
        h('h3', { key: 'title', className: 'df-set-group-title' }, title),
        ...children,
      ])
      const item = (key: typeof DF_FLAGS[number]) => {
        const row = copy.items[key]
        return h(DfSwitch, {
          key: key,
          icon: key === 'aurora' ? 'gallery' : key === 'hostIcons' ? 'duotone' : key,
          label: row[0],
          description: row[1],
          value: state[key],
          disabled,
          onChange: update(key),
        })
      }
      const zh = dfUsesChinese()
      const status = settings.error
        ? (zh ? '保存未完成。如果刚更新过插件，请完整退出 DSH 重启后再试。' : 'Could not save. If you just updated the plugin, quit and reopen DSH, then try again.')
        : settings.status === 'loading' ? (zh ? '正在读取主题设置…' : 'Loading theme preferences…')
        : settings.status !== 'ready' ? (zh ? '此宿主暂未提供主题设置。' : 'Theme preferences are unavailable on this host.')
        : !settings.writable ? (zh ? '此配置只读。' : 'These preferences are read-only.')
        : settings.pending ? (zh ? '正在保存…' : 'Saving…') : ''
      const details = [
        group(zh ? 'Fish 字体与质感' : 'Fish finish', [
          item('glass'),
          h(GlassControls, {
            key: 'glass-controls', values: state, zh, disabled: disabled || !state.glass, ...glassEditor,
            children: h(FishPlate, { scene: state.scene }),
          }),
          item('fishFont'), item('fishGlow'), item('fishMotion'), item('fishCode'),
        ]),
        group(zh ? '阅读' : 'Reading', [item('reading'), item('code')]),
        group(copy.groups.hero, [
          item('hero'), item('field'), item('wave'), item('ripple'),
        ]),
        group(copy.groups.thinking, [
          item('thinkingSphere'), item('thinkingLabel'),
        ]),
        group(copy.groups.composer, [
          item('effortBadge'),
        ]),
        group(copy.groups.sidebar, [
          item('sidebarDots'), item('sidebarRail'),
        ]),
        group(copy.groups.accents, [
          item('bold'), item('focusRing'), item('diff'),
        ]),
        group(zh ? '配色与交互' : 'Color & interaction', [
          item('catppuccin'), item('hostIcons'), item('cursor'), item('textMotion'),
        ]),
      ]
      const tabButton = (id, label, icon) => h('button', { type: 'button', 'aria-pressed': tab === id,
        onClick: () => setTab(id) }, h(FishIcon, { name: icon, size: 16 }), label)
      return h('div', { className: 'df-set fish-studio' },
        h('div', { className: 'fish-cover', style: { backgroundColor: scene.colors[0] } },
          h(FishPlate, { scene: state.scene }),
          h('div', { className: 'fish-cover-copy' },
            h('span', { className: 'fish-cover-kicker' }, zh ? scene.en : 'Selected scene'),
            h('h2', null, zh ? scene.zh : scene.en),
            h('p', null, scene.caption[zh ? 1 : 0])),
          h('div', { className: 'fish-swatches', 'aria-hidden': true }, scene.colors.map(color =>
            h('i', { key: color, style: { background: color } })))),
        h('div', { className: 'fish-tabs', role: 'group', 'aria-label': zh ? '外观设置' : 'Appearance settings' },
          tabButton('scenes', zh ? '场景' : 'Scenes', 'gallery'),
          tabButton('details', zh ? '界面细节' : 'Interface details', 'sliders')),
        status && h('p', { className: 'df-settings-status', role: settings.error ? 'alert' : 'status' }, status),
        tab === 'scenes' ? h('div', { className: 'fish-scenes' },
          h(FishScenePicker, { state, disabled, zh }),
          h('div', { className: 'fish-controls' },
            h(FishAccentPicker, { value: state.accentColor, disabled, zh }),
            item('aurora'),
            h(FishSegments, { name: 'sceneMotion', label: zh ? '背景动效' : 'Scene motion', icon: 'wave',
              value: state.sceneMotion, disabled: disabled || !state.aurora,
              options: [['still', zh ? '静止' : 'Still', 'still'], ['calm', zh ? '舒缓' : 'Calm', 'wave'], ['flow', zh ? '流动' : 'Flow', 'fishMotion']] }),
            h('div', { className: 'df-launch-options' }, item('launchIntro'),
              h('button', { type: 'button', className: 'df-replay', 'data-df-preview-launch': '', disabled: staticIntro,
                title: staticIntro ? (zh ? '当前动效或辅助显示设置使用静态界面' : 'Your motion or accessibility settings use a static view') : undefined,
                onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                  const cover = event.currentTarget.closest('.fish-studio')?.querySelector<HTMLElement>('.fish-cover')
                  if (cover) {
                    stopPreview?.()
                    cover.scrollIntoView({ block: 'nearest', behavior: 'instant' })
                    stopPreview = playFishLaunch(cover, true)
                  }
                } },
                h(FishIcon, { name: 'launchIntro', size: 14 }), zh ? '预览开场' : 'Preview intro')),
            h(FishSegments, { name: 'iconStyle', label: zh ? '图标风格' : 'Icon style', icon: 'duotone',
              value: state.iconStyle, disabled, options: [['line', zh ? '线描' : 'Outline', 'line'], ['duotone', zh ? '双色' : 'Duotone', 'duotone']] })))
          : h('div', { className: 'fish-details' }, details),
        h('div', { className: 'df-set-footer' },
          h('button', { type: 'button', className: 'df-set-reset', disabled, onClick: reset }, h(FishIcon, { name: 'reset', size: 13 }), copy.reset),
          h('span', { className: 'df-set-note' }, zh ? '随当前配置自动保存' : 'Autosaved to this profile')))
    }

    // ----------------------------------------------------------- sidebar entry
    /** Sheet state shared by the sidebar button and the panel itself. */
    let dfSheetOpen = false
    const dfSheetListeners = new Set<() => void>()
    function dfSetSheetOpen(next: boolean) {
      dfSheetOpen = next
      dfSheetListeners.forEach((listener) => listener())
    }
    function useDfSheet() {
      const [open, setOpen] = React.useState(dfSheetOpen)
      React.useEffect(() => {
        const listener = () => setOpen(dfSheetOpen)
        dfSheetListeners.add(listener)
        return () => { dfSheetListeners.delete(listener) }
      }, [])
      return open
    }
    let dfReactDOM: typeof import('react-dom') | null = null
    try {
      dfReactDOM = require('react-dom')
    } catch (error) {
      dfReactDOM = null
    }

    /** The floating settings sheet, portalled to the body when react-dom is around. */
    function DfSheet() {
      const open = useDfSheet()
      const panelRef = React.useRef<HTMLDivElement>(null)
      React.useEffect(() => {
        if (!open) return undefined
        const previousFocus = document.activeElement
        const panel = panelRef.current
        const focusable = () => panel === null ? [] : [...panel.querySelectorAll<HTMLElement>('button:enabled, input:enabled:is(:checked, [type="color"], [type="range"]), [href], [tabindex="0"]')]
        ;(focusable()[0] || panel)?.focus()
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dfSetSheetOpen(false) }
          if (event.key !== 'Tab') return
          const items = focusable()
          const first = items[0] || panel
          const last = items[items.length - 1] || panel
          if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
            event.preventDefault(); last?.focus()
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
            event.preventDefault(); first?.focus()
          }
        }
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('keydown', onKeyDown, true)
          if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
        }
      }, [open])
      if (!open) return null
      const panel = h('div', { key: 'panel', className: 'df-sheet-panel', ref: panelRef, role: 'dialog', 'aria-modal': 'true', tabIndex: -1, 'aria-label': dfUsesChinese() ? DF_COPY.zh.dialog : DF_COPY.en.dialog }, [
        h('div', { key: 'head', className: 'df-sheet-head' }, [
          h('span', { key: 'title', className: 'df-sheet-title' }, h(FishBrand), 'Deep Fish UI'),
          h('button', {
            key: 'close',
            type: 'button',
            className: 'df-sheet-close',
            'aria-label': dfUsesChinese() ? DF_COPY.zh.close : DF_COPY.en.close,
            onClick: () => dfSetSheetOpen(false),
          }, h(FishIcon, { name: 'close', size: 16 })),
        ]),
        h('div', { key: 'body', className: 'df-sheet-body' }, h(DfSettingsPage)),
      ])
      const scrim = h('div', {
        key: 'scrim',
        className: 'df-sheet-scrim',
        onClick: () => dfSetSheetOpen(false),
      })
      const both = h('div', { className: 'df-sheet-root' }, [scrim, panel])
      if (dfReactDOM !== null && typeof dfReactDOM.createPortal === 'function') {
        return dfReactDOM.createPortal(both, document.body)
      }
      return both
    }

    /**
     * Sidebar footer button that opens the sheet.
     *
     * The button carries its own dot field: completely unlit at rest, it surfaces only in a
     * soft pool around the pointer, clipped to the button, and fades away when the pointer
     * leaves. Dots never move; only their brightness changes.
     */
    function DfSidebarAction({ wide }: { wide: boolean }) {
      const open = useDfSheet()
      const { values } = useDfSettings()
      const showDots = values.sidebarDots !== false
      const showRail = values.sidebarRail !== false
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        if (!showDots && !showRail) return
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const button = canvas.parentElement
        if (button === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        const state = { x: -999, y: -999, inside: false, alpha: 0, frame: 0, live: false, dirty: false }
        let stopped = false
        let dpr = Math.min(2, devicePixelRatio || 1)

        const measure = () => {
          const rect = canvas.getBoundingClientRect()
          dpr = Math.min(2, devicePixelRatio || 1)
          const width = Math.max(1, Math.round(rect.width * dpr))
          const height = Math.max(1, Math.round(rect.height * dpr))
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
          }
        }

        const paint = () => {
          state.frame = 0
          if (stopped) return
          const rect = canvas.getBoundingClientRect()
          const width = rect.width
          const height = rect.height
          const target = state.inside ? 1 : 0
          state.alpha = motion.matches ? target : state.alpha + (target - state.alpha) * 0.22
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          if (!state.inside && state.alpha < 0.02) {
            state.alpha = 0
            state.live = false
            return
          }
          const radius = 64
          const accent = (getComputedStyle(button).getPropertyValue('--df-accent') || '').trim() || '#7aa4ff'
          context.fillStyle = accent
          if (showDots) for (let y = 3; y < height; y += 4) {
            for (let x = 3; x < width; x += 4) {
              const dx = x - state.x
              const dy = y - state.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > radius) continue
              const alpha = Math.pow(1 - distance / radius, 1.35) * state.alpha
              if (alpha < 0.02) continue
              context.globalAlpha = Math.min(1, alpha)
              context.beginPath()
              context.arc(x, y, 0.85, 0, Math.PI * 2)
              context.fill()
            }
          }
          if (showRail) {
            const railHeight = Math.max(6, height - 10)
            const railTop = (height - railHeight) / 2
            context.globalAlpha = Math.min(1, state.alpha * 0.9)
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(2, railTop, 3, railHeight, 1.5)
            } else {
              context.rect(2, railTop, 3, railHeight)
            }
            context.fill()
            context.globalAlpha = 1
          }
          const moving = state.dirty
          state.dirty = false
          if (motion.matches) {
            if (!state.inside) {
              context.clearRect(0, 0, width, height)
              state.alpha = 0
            }
            state.live = false
            return
          }
          // Idle inside the button: stop the loop until the pointer moves again.
          if (state.inside && state.alpha >= 0.98 && !moving) {
            state.live = false
            return
          }
          if (state.inside || state.alpha >= 0.02) {
            state.frame = requestAnimationFrame(paint)
          } else {
            state.live = false
          }
        }

        const wake = () => {
          if (stopped || state.live) return
          state.live = true
          if (state.frame === 0) state.frame = requestAnimationFrame(paint)
        }

        const track = event => {
          const rect = canvas.getBoundingClientRect()
          state.x = event.clientX - rect.left
          state.y = event.clientY - rect.top
          state.inside = true
          state.dirty = true
          wake()
        }
        const leave = () => {
          state.inside = false
          wake()
        }

        const resizeObserver = new ResizeObserver(() => {
          measure()
          if (state.inside || state.alpha > 0.02) wake()
        })
        resizeObserver.observe(canvas)
        button.addEventListener('pointerenter', track)
        button.addEventListener('pointermove', track)
        button.addEventListener('pointerleave', leave)
        measure()
        return () => {
          stopped = true
          resizeObserver.disconnect()
          button.removeEventListener('pointerenter', track)
          button.removeEventListener('pointermove', track)
          button.removeEventListener('pointerleave', leave)
          if (state.frame !== 0) cancelAnimationFrame(state.frame)
          state.frame = 0
          state.live = false
        }
      }, [showDots, showRail])
      return h('div', { className: 'df-foot' }, [
        h('button', {
          key: 'button',
          type: 'button',
          className: 'df-foot-button',
          title: 'Deep Fish UI',
          'aria-label': dfUsesChinese() ? DF_COPY.zh.button : DF_COPY.en.button,
          onClick: () => dfSetSheetOpen(!dfSheetOpen),
        }, [
          showDots || showRail
            ? h('canvas', { key: 'dots', ref: canvasRef, className: 'df-foot-dots', 'aria-hidden': 'true' })
            : null,
          h(FishBrand, { key: 'icon' }),
          wide ? h('span', { key: 'label', className: 'df-foot-label' }, 'Deep Fish UI') : null,
          wide ? h('span', { key: 'scene', className: 'fish-foot-scene', title: dfUsesChinese() ? SCENES[values.scene].zh : SCENES[values.scene].en },
            h(FishIcon, { name: SCENES[values.scene].icon, size: 16 })) : null,
        ]),
        h(DfSheet, { key: 'sheet' }),
      ])
    }


    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          dfMounted = true
          windowPainting = document.createElement('img')
          windowPainting.className = 'df-window-painting'
          windowPainting.alt = ''
          windowPainting.draggable = false
          windowPainting.setAttribute('aria-hidden', 'true')
          const visible = () => document.documentElement.toggleAttribute('data-fish-paused', document.hidden)
          document.addEventListener('visibilitychange', visible)
          visible()
          dfApplySettings()
          return () => {
            dfMounted = false
            setWindowPainting(windowPainting, undefined)
            glassDrafts.clear()
            GLASS_KEYS.forEach(key => document.documentElement.style.removeProperty(GLASS_RANGES[key].css))
            dfWrite = null
            dfSetSheetOpen(false)
            for (const className of Object.values(DF_OFF_CLASS)) document.documentElement.classList.remove(className)
            delete document.documentElement.dataset.fishPace
            delete document.documentElement.dataset.fishIcons
            document.removeEventListener('visibilitychange', visible)
            document.documentElement.removeAttribute('data-fish-paused')
            for (const dispose of dfThemeLayers.values()) dispose()
            dfThemeLayers.clear()
            dfTheme = null
          }
        }, 'dsh-fish-ui: lifecycle')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui'
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: styles')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui:finish'
          style.textContent = FISH_CSS
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: finish styles')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui: fx'
          style.textContent = [
            FISH_FX_CSS, FISH_STUDIO_CSS, DF_SCENE_ART_CSS, productIconCss(),
            shellGlassCss, commandGlassCss, glassControlsCss, studioFinishCss, workbenchFinishCss, DF_LAUNCH_CSS,
          ].join('\n')
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: fx styles')
        ctx.effect(attachLaunch, 'dsh-fish-ui: welcome animation')
        ctx.effect(attachPointerPhysics, 'dsh-fish-ui: pointer physics')
        ctx.inject(['theme'], scope => {
          scope.effect(() => {
            dfTheme = scope.theme
            dfSyncTheme()
            return () => {
              for (const dispose of dfThemeLayers.values()) dispose()
              dfThemeLayers.clear()
              dfTheme = null
            }
          }, 'dsh-fish-ui: token layers')
        })
        installDesktopWorkspacePicker(ctx, React)
        installPendingApprovals(ctx, React)
        installModelStudio(ctx, React)
        dfInstallReplyMotion(React, ctx, dfPlaySceneArrival)
        ctx.inject(['workspaces', 'sessions'], scope => {
          scope.effect(() => {
            noSessionSelected = () => {
              const ws = scope.workspaces.list.getSnapshot()
              const sessions = scope.sessions.list.getSnapshot()
              return ws.phase === 'ready' && sessions.phase === 'ready'
                && !Object.values(sessions.byId).some((s: { retainedBy?: { mainView?: number } }) => s.retainedBy?.mainView > 0)
            }
            return () => { noSessionSelected = undefined }
          }, 'dsh-fish-ui: initial workspace')
        })
        ctx.inject(['configForms'], dfConnectSettings)
        const add = (name, options, Component) => ctx.slots.inject(name,
          () => ctx.slots.register({ name, ...options }, dfSafe(Component)))
        add('conversation.hero.frame', { id: 'dot-whale', order: 20 }, HeroFrame)
        add('sidebar.footer.action', { id: 'dsh-fish-ui', order: 5, label: () => 'Deep Fish UI' }, DfSidebarAction)
        add('shell.overlay', { id: 'df-ambient', order: 5 }, DfOverlay)
        add('shell.overlay', { id: 'df-sidebar-dots', order: 6 }, DfSidebarDots)
        add('shell.overlay', { id: 'df-caret-trail', order: 4 }, DfCaretTrail)
        // Package name, distinct from the Host entry id even though both currently match.
        add('plugins.bundle.config', { key: 'dsh-fish-ui' }, DfSettingsPage)
      },
    }
  },
})
