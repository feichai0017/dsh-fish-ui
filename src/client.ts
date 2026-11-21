import { dfCreateScenePlate, dfPlaySceneArrival, DF_SCENE_ART_CSS } from './scene-art'
import { installModelStudio } from './model-studio'
import { dfInstallReplyMotion } from './reply-motion'

/**
 * Deep Fish UI — the blank New Session surface.
 *
 * The blank home becomes a dotted composition: a dot-matrix portrait on the
 * right and the deepseek / harness wordmark on the left, both driven by one
 * canvas layer registered into `conversation.hero.frame` (the HOC slot that
 * wraps the Conversation scroll body and reports whether the blank home shows).
 * The layer renders the wrapped `children` unchanged and paints below the
 * content (`z-index: -1`, `pointer-events: none`).
 *
 * It also hides the stock home chrome it replaces: the headline, the brand mark,
 * and the official pixel-whale canvas. A faint `dsh-fish-ui` signature sits in
 * the page corner while the home is showing.
 *
 * The stylesheet below also carries the accent half in the same bundle:
 * whale-blue bold runs in chat prose, the whale-blue composer focus ring, and the
 * re-inked diff plates. One install, one stylesheet, one place to tune.
 */
window.__ModuleLoader__.load({
  id: 'dsh-fish-ui',
  factory(require) {
    const React = require('react')
    const h = React.createElement

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
    const circle = (cx: number, cy: number, r: number, props?: React.SVGProps<SVGCircleElement>) => h('circle', { cx, cy, r, ...props })
    const FISH_ICONS = {
      fish: ['M2 8.5 7 11c3-6 10-6.5 14 1-4.5 7.5-11 7-14 1L2 15.5Z M14 7.2c-2 3.1-2 6.5 0 9.6 M17.2 11.2h.1', 'M7 12c3-6 10-6 14 0-4 7-11 7-14 0Z'],
      contour: ['M2 14c0-5 3-6 6-6s3-5 7-5 7 4 7 8-5 4-7 7-6 4-9 2-4-3-4-6Z M6 14c0-3 4-3 6-6s6-1 6 2-3 3-5 6-7 2-7-2Z M10 14l4-3', 'M2 14c0-5 3-6 6-6s3-5 7-5 7 4 7 8-5 4-7 7-6 4-9 2-4-3-4-6Z'],
      aurora: ['M2 16c5-13 8 2 14-9l4-4 M2 20c6-14 9 0 15-10l5-6 M7 5l.6 1.8L9.5 7l-1.9.6L7 9.5l-.6-1.9L4.5 7l1.9-.2Z', 'M2 16c5-13 8 2 14-9l4-4-3 7c-6 10-9-4-15 10Z'],
      orbit: ['M8 8.5a5 5 0 1 1-.5 6.3 M19.5 7c4-1 2.5 3-4 7S1 20 2.5 16c.5-1.3 2.3-3.2 4.5-5 M18 3v2m-1-1h2', 'M12 7a5 5 0 1 1 0 10 5 5 0 1 1 0-10Z'],
      dunes: ['M1.5 18c5 2 8-8 14-5s6 5 7 4 M2 21h20 M3 13l4-3 4 2 M14 9a3 3 0 1 1 5 .2', 'M2 18c5 2 8-8 14-5s6 5 6 4v4H2Z'],
      rain: ['M4 15V9h5v6m0-6V6h6v9m0-4h5v4 M2 16h20 M6 19l-1 2m7-2-1 2m7-2-1 2 M17 4l-1 2m5-3-1 2', 'M4 9h5V6h6v5h5v5H4Z'],
      lotus: ['M12 18c-4-3-5-7 0-13 5 6 4 10 0 13Z M10 17c-4 0-7-3-8-8 4 .3 7 2 8 4m4 4c4 0 7-3 8-8-4 .3-7 2-8 4 M4 20c4 1 12 1 16 0', 'M12 18c-4-3-5-7 0-13 5 6 4 10 0 13Z'],
      gallery: ['M3 4h7v7H3Zm11 0h7v7h-7ZM3 15h7v6H3Zm11 0h7v6h-7Z', 'M3 4h7v7H3Zm11 11h7v6h-7Z'],
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
      return h('svg', { viewBox: '0 0 64 64', className: 'fish-logo', 'aria-hidden': true, focusable: false },
        path('M27 28Q28 18 40 12L38 23ZM31 39Q29 45 32 50Q40 43 40 33Z', { fill: '#9DD7FF' }),
        path('M18 36C25 25 39 16 54 17C52 32 39 43 21 43C16 47 11 49 6 49C9 44 12 40 15 38C11 34 9 29 10 24C15 26 18 31 18 36Z', { fill: '#F5FBFF' }),
        path('M23 39C31 37 36 33 40 29M11 53Q18 52 24 48', { fill: 'none', stroke: '#8DC0FF', strokeWidth: 2, strokeLinecap: 'round' }),
        circle(46.3, 23.4, 2.1, { fill: '#243EAA' }))
    }
    function FishIcon({ name, size = 18 }: { name: keyof typeof FISH_ICONS; size?: number }) {
      const [outline, tone] = FISH_ICONS[name]
      return h('svg', { className: 'fish-icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, focusable: false },
        tone && path(tone, { className: 'fish-icon-tone' }),
        path(outline, { stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round' }))
    }
    const FishPlate = dfCreateScenePlate(React)

    /* ------------------------------------------------------------ hero mascot */

    /** Dot grid sampled from the mascot artwork: one hex digit per cell. */
    const GIRL_COLUMNS = 104
    const GIRL_ROWS = 73
    const GIRL_GRID = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000121100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013133112320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000163116400000264223200000000000000000000000000000000000000000000000000000000000000000000000000000000000326000001000000a800134000000000000000000000000000000000000000000000000000000000000000000000000000000002500000001200020000000014000000000000000000000000000000000000000000000000000000000000000000000000000000353000310023201320020000050000000000000000000000000000000000000000000000000000000000000000000000000000003000003310000000001300001b33300000000000000000000000000000000000000000000000000000000000000000000000000100010110035457764200000022002400000000000000000000000000000000000000000000000000000000000000000000000030000300006aba999accb820022000003000000000000000000000000000000000000000000000000000000000000000000000031000000224abbaa976778bca300200008900000000000000000000000000000000000000000000000000000000000000000000a1031005789787777898777679c8000000055000000000000000000000000000000000000000000000000000000000000000000b800220a98b96777777788777777ab30001008100000000000000000000000000000000000000000000000000000000000000007f00002b97b97777777777777777768c402100460000000000000000000000000000000000000000000000000000000000000000ef4000a9699777777777777778777677b600000a2000000000000000000000000000000000000000000000000000000000000000820107a68978777777777777778766788b30000c220000000000000000000000000000000000000000000000000000000000000300003b77887877777777877777787677889220af30300000000000000000000000000000000000000000000000000000000000130000897787787777777797754778877779960025d002000000000000000000000000000000000000000000000000000000000040000297777778777875878a777677977777981000870300000000000000000000000000000000000000000000000000000000003101069878778777865578779777778977778a70105a0300000000000000000000000000000000000000000000000000000000000c60288778778877744778855977777987777994004b0401000000000000000000000000000000000000000000000000000000008d00596788777777757878880497777897777888009a059800000000000000000000000000000000000000000000000000000002e00077578878668777777899203987779777778931ea57780000000000000000000000000000000000000000000000000000000aa004956788784587777777894246988789787788648688681000000000000000000000000000000000000000000000000000000ec00784679878439877777868710049888a74778877667da30000000000000000000000000000000000000000000000000000002fe20964779878408877777856800005878836877877749dd800000000000000000000000000000000000000000000000000000003c01857679879305977777762910000327985487876a7bbad90000000000000000000000000000000000000000000000000000000e00778679878433887877782610001620864877786aecbaad700000000000000000000000000000000000000000000000000002dda47786798787005868867755205cffde4587778887bbbaaad7000000000000000000000000000000000000000000000000004dccdb677778979300076788777604fc5d48fa77778868aaaaaaad50000000000000000000000000000000000000000000000003c2bcc9677778976300046677777704cb7ca0b96777796bbaaaaaaad400000000000000000000000000000000000000000000000a91ebb8777777974300002477776460abe8a02387877889acbaaaaabc2000000000000000000000000000000000000000000000009edba77777779812039a7038678400687660058787689703accbaaabc1000000000000000000000000000000000000000000000004ba977777778900dffab603624520073430087886599c00037bccbabc000000000000000000000000000000000000000000000000ba878787778908c9c89b001100000121104789756a9a900000369ccdb0000000000000000000000000000000000000000000000aca88969777893f26bbe91000111111111347a8649a98b8100000015afc000000000000000000000000000000000000000000006caa8996a877786f01a6562011111111222237a669aa888cb7414600000aa0000000000000000000000000000000000000000002daaa89b6a96777b9502742111111000111110586999998799047558778698000000000000000000000000000000000000000000bbaabaa969a77778600022011110012201100177aa7999777a400000210210000000000000000000000000000000000000000009caaadc6078b877779501112111036666010028aaa76a9a777880000000000000000000000000000000000000000000000000006daabda144a7aa778777401211105a434201000bb996699a86778400000000000000000000000000000000000000000000000005daaca4002aa7898789777532111014343101009d987769aa9677781000000000000000000000000000000000000000000000003dbcc700006c99788977a8473001110011001009db877768a9976767700000000000000000000000000000000000000000000000ddc8200005c9998789a868acb20000000011004cbb777667a9a8676786000000000000000000000000000000000000000000000bb600008867aa88977899967abc8310000000235baa7774678a99666759600000000000000000000000000000000000000000000d6269893007b9787778a788779aabcba52213425cb898536889997667509700000000000000000000000000000000000000000000562020000b97788889a967898989bb65444433278aa7647798998666810780000000000000000000000000000000000000000000000000007b7777225bca7768b989b802333331015c977677a889966777004830000000000000000000000000000000000000000000000000b7778410007c8676898ac502122222203c9877669a88a97878400096000000000000000000000000000000000000000000000006878861220003957889984001019491111ba986569a99aa447781000991000000000000000000000000000000000000000000006878785022000047576608100107e1e6000069a5458bb82000777600008a300000000000000000000000000000000000000000498787787113a00017454607a8bbac969b676067264478200000576840000995000000000000000000000000000000000000005996888788620aa0100835b607edbbdb687bdcccc6295362000000576682000198520000000000000000000000000000000000587204876892004b00214834a904fcbba9677bcbacb07a844500000098666700006965300000000000000000000000000000005740001977799000ad000077446b00cdcbada09caaae702977662001009a7666600029706200000000000000000000000000000970000088768a8102ce200085448d101cbabd706eaabb002d967885300005966665101881060000000000000000000000000001a70000078777999206cda0028435c6002babcc201dcbb7002bea6889940006a8766662588303500000000000000000000000000990000079776898a609bce005634ac006fbabbb010bbbac7002de22878a810398875555779200710000000000000000000000007a50000797777989911bbbc006348f9003bdcac60e57cabcf6008d80877984607988755545700073000000000000000000000003995003897776987a503daae81659df6000047dc30005dbbb81002dd27777906259888854545510850000000000000000000000078894688777679789006caad9593aed0001100c901001cd2000000af8677771b429888885455566740000000000000000000000098777787777787789308cab97820df4001000021000008400011004c7778726d60398888974454566400000000000000000000019665687777678778787aab768300eb00010001011200100120000158857a20cf702987876985445768740000000000000000003666668777777877767bcab8679002f40001000100013500001000000af752005f706a7789008a53450488500000000000000038867667877787787777bbab9776bb02e00000000000009e000010000002fa00009d6099877930099634303783000000000000189402766787789778778baaaa89769fa2d000000000000000000000000000dc0006dc6059877870079973530486000000000005a4000766687889777777baaaaa8b757e52d000000000000100100000000000ad003fbc606787778008889745106700000000008a1000676568888877787abaaaaa9aa77901f3000000000001001000000000008c000acba3777877900977896550070000000008b00001756568888877787baaaaaaa9baba00f8002210000000000000000000009b000cbab967678785787788966305000000007a4000046466588888777769cbaaaaaaaabd10be1123232100106a001000000000c800ccaaaa767677788777a258556400000004980000065466579888777765acbbaaaaabbcc04f9012222321107c011011122005f200dbaaab96776777777880086561000000078700001654465688887775665bbbbaaaaabcd009f702222223221012233323321ec02bcbaaaab86776777788000475620'
    const GIRL_LINES = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001221000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050551247200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e601e8000001b624620000000000000000000000000000000000000000000000000000000000000000000000000000000000061f000000000000ff00068000000000000000000000000000000000000000000000000000000000000000000000000000000004b000000004000300000000090000000000000000000000000000000000000000000000000000000000000000000000000000006c5000600015100520030000080000000000000000000000000000000000000000000000000000000000000000000000000000005000005700000000000400000f55700000000000000000000000000000000000000000000000000000000000000000000000000100020000012125521100000021002800000000000000000000000000000000000000000000000000000000000000000000000070000600003fea779dfff910011000005000000000000000000000000000000000000000000000000000000000000000000000050000000112deb98422225efe10010000ff00000000000000000000000000000000000000000000000000000000000000000000f006000259b233233353322239fb000000099000000000000000000000000000000000000000000000000000000000000000000fd00110f95f52223222233323323cf1000000f000000000000000000000000000000000000000000000000000000000000000007f00001f82a43333333332333333324f2010005c0000000000000000000000000000000000000000000000000000000000000000ff1000f9254333333333333333333223f400000f1000000000000000000000000000000000000000000000000000000000000000f10008e23433333333333333323322333f10000f110000000000000000000000000000000000000000000000000000000000000300001f3333333333333332322234223335d110ff10400000000000000000000000000000000000000000000000000000000000060000983333333333333353222323422326920012f0010000000000000000000000000000000000000000000000000000000000700001d33333333334223239232232632323990000da0300000000000000000000000000000000000000000000000000000000004000059333333333322223337333323523324b70002f0100000000000000000000000000000000000000000000000000000000000f901b5333323333212233322b333326323336c1001f010000000000000000000000000000000000000000000000000000000000cf002b22333332332224343601a333236233237800bf02ee00000000000000000000000000000000000000000000000000000001f00085233324224333332369101a43326323334910fb246d0000000000000000000000000000000000000000000000000000000ff002c22333262273333333492116b733342333452152332b0000000000000000000000000000000000000000000000000000000ff00791234337119333333327a0002c533a31233332223f810000000000000000000000000000000000000000000000000000001ff10d22234338108633332422d00002735612433323313cf300000000000000000000000000000000000000000000000000000001f00a22235339102933322321f0000011287223333273743f80000000000000000000000000000000000000000000000000000000f005242343381118533222618000002104213333324f8433f400000000000000000000000000000000000000000000000000001ff813332243288004825322522102fffff1253323333654344f2000000000000000000000000000000000000000000000000001fc9d823332342b100082453224601fd2f13f9333233234333344f20000000000000000000000000000000000000000000000001f16683233323634100013233324901f72c90f82333342894333335f100000000000000000000000000000000000000000000000f90f453233323751100001163242270bdf3c011423323347e9433336f100000000000000000000000000000000000000000000000dfd4432333326801018d201b46b200572260025333233201afc84349f0000000000000000000000000000000000000000000000001a4323333334900fff7c2017129100b1110083432243f00013dfd97bf000000000000000000000000000000000000000000000000b5333233233806f3a36f000100000010002547322739900000128ffff0000000000000000000000000000000000000000000000cb533325322361f12ccfb0000000000000124b3225733e7000000002bff000000000000000000000000000000000000000000002f4433327322342f00e2251000000000111116b22584333ff9204a00000ff0000000000000000000000000000000000000000001f54433a2642323c9201a1100000000000001023243333325b03d86fced4fe000000000000000000000000000000000000000000f943548724822224200011000000001100000043662334223d100000100100000000000000000000000000000000000000000008e444ff2023932322b20000100002babe00001896932434322780000000000000000000000000000000000000000000000000002f548fa0119276333225100110009f214200000ea33224353222a200000000000000000000000000000000000000000000000002f66eb1001b72343235325211000005343000008f3332234432224a0000000000000000000000000000000000000000000000001fbdf300002e333333239322100000000000000af932222363422226a00000000000000000000000000000000000000000000000fff5100002f434333383238ff10000000000001f8722322353532223b8000000000000000000000000000000000000000000000ff20000ff45b5333323433228bf5100000000112e73232123343422222e900000000000000000000000000000000000000000000f515fef1003a3233223533322389dfff41102612fa33321233335222420fb00000000000000000000000000000000000000000000591010000f622557477323343333be36255411134662222343333222800cf0000000000000000000000000000000000000000000000000005f2236112ff922238333c601111111002f4332227333522246003f10000000000000000000000000000000000000000000000000f3337100006f52323437f201011111101f43322245338836491000fb000000000000000000000000000000000000000000000005623440110001d2253675100000c1f0000fa542224767ef1175b0000ff0000000000000000000000000000000000000000000004734352011000015242207000004f1f2000027d2125df9100065780000ff1000000000000000000000000000000000000000002e9343376001f00009121203b3dd8f324d222022121169100000272a10000ff3000000000000000000000000000000000000006ff2633269710ff0000c12f303fc66e72338eceef21c21410000002622b10001fa6100000000000000000000000000000000009fc1026323a1001f00102c11da02f744332237754ce03f6214000000e9222900005d46200000000000000000000000000000009f50000b3228a000cf0000b7112f00fc444d803a444f30172225100000fe222470001c70a100000000000000000000000000000fc00000b522398001ff1000d2126f000c444f302f444c001f6236a2100002922246000bc00d0000000000000000000000000000fc000008822246a102efb001d112f20018447f100f8463001ff9256ab20003c42224712ab102900000000000000000000000000ff000008b322354b20899f005511af005f9446c000b644d2001ff11536fc001c542222257e100f00000000000000000000000009f200009b3223536a10d46d006113f8001ffa4e20f22c45df7007f303328815056353222129000e3000000000000000000000001d92001aa3222433a201f44f30325ff2000013ff10002faafa0001ff12322904129334422222400d500000000000000000000000995a12a7222234338002e44f62c18ff0000000fd00000ff1000000cf3233440f2195334421223659100000000000000000000000c6322452222243337103a4632910ff100000001000000d200012001f2337712f2018333493112123610000000000000000000000c222242222233333232558325100ff00010000000400000010000025322f10ff201933432ca211287dc200000000000000000017322243222323333229a463228001f10001000000002700000000000df321002f202b323900ae212201cd60000000000000002fd6622243223323332375443222cf01f0000100010000ff000010000001fb00006f20b8322b100ab212101be10000000000000ff3016223322352333237444434225fb1f000000001000000000010000000ff0002fe20284228600598212101f8000000000007f500083223333432333364443439222f21f000000001000000000000000000ef001f9c20235324b008538313009d0000000000ef0000772223333332233554443434422500f1000000000000000000000000009f00089641323422a009234922400e000000000df00001922224333322233a44344443448900f900140000000000000000000000df000d547522233252242246a24109000000009f1000056242253333222323c4433444444f00ff001324200000cf000000000000fa00fc4446222223255222c12b229300000001eb000008312223433322232249444444445cf01fb00111241000df000000133002f100f64446322222322228900c32900000000ab80000082112224333223222244444444448f007f701111224110001246323310ff01fd44444832222322248000172810'

    /** Grid aspect (width / height), used to keep the portrait undistorted. */
    const GIRL_ASPECT = GIRL_COLUMNS / GIRL_ROWS

    /** Wordmark set in dots on the left: two lines, sampled from live text. */
    const LOCKUP_LINES = ['deepseek', 'harness']
    const LOCKUP_COLUMNS = 140
    const LOCKUP_ROWS = 58

    /** Alpha buckets drawn per frame, so the twinkle costs one fill per level. */
    const LEVELS = 12
    const TAU = Math.PI * 2

    /**
     * Twinkle refresh rate. The field is dense, so the frame budget is kept
     * loose: slow alpha breathing reads the same at 16 fps, and the canvas is
     * only alive while the blank home is on screen.
     */
    const FRAME_MS = 1000 / 30

    /** One dot's cell in CSS pixels: fixed, so dots never scale with the window. */
    const DOT_PITCH = 9

    /** Smallest dot pitch the wordmark may use before it is dropped. */
    const TEXT_MIN_PITCH = 3.6

    /** Wordmark assembly: dots reveal left to right over this long. */
    const ASSEMBLY_MS = 1300

    /** Each line's slice of the assembly, in timeline fractions: line 1 starts
     *  while line 0 is still finishing, so the two never pop at once. */
    const ASSEMBLY_SECOND_LINE = 0.42
    const ASSEMBLY_LINE_SPAN = 0.58

    /** Temporary on-canvas readout used to diagnose layout mismatches. */
    const DEBUG = false

    type HalftoneDot = { u: number; v: number; a: number; phase: number; speed: number }
    /** Dot model of the portrait for the light canvas (ink-weighted). */
    let dotModel: HalftoneDot[] | undefined

    /** Dot model of the portrait for the dark canvas (line-art weighted). */
    let lineModel: HalftoneDot[] | undefined

    /** Dot model of the wordmark, built once by rasterising live text. */
    let lockupModel: HalftoneDot[][] | undefined

    /**
     * Decode one hex grid into dots: one dot per non-empty cell, weight from the
     * digit, each with its own twinkle phase and speed so the field never blinks
     * in unison.
     * @param cells - one hex digit per grid cell, row-major.
     * @returns dots in normalised space (`u`/`v` 0..1, `a` weight 0..1).
     */
    function decodeGrid(cells: string) {
      const dots = []
      for (let index = 0; index < cells.length; index += 1) {
        const weight = Number.parseInt(cells[index], 16)
        if (!(weight > 0)) continue
        const row = Math.floor(index / GIRL_COLUMNS)
        const column = index % GIRL_COLUMNS
        dots.push({
          u: (column + 0.5) / GIRL_COLUMNS,
          v: (row + 0.5) / GIRL_ROWS,
          a: weight / 15,
          phase: Math.random() * TAU,
          speed: 0.5 + Math.random() * 0.8,
        })
      }
      return dots
    }

    /**
     * Light canvas: the artwork's ink drives dot weight, so dark hair and the
     * dark dress read dark on the pale canvas.
     * @returns dots in normalised space.
     */
    function mascotDots() {
      if (dotModel === undefined) dotModel = decodeGrid(GIRL_GRID)
      return dotModel
    }

    /**
     * Dark canvas: the dots are light, so the artwork's ink is inverted — skin
     * and the white apron become dense bright dots while ink-heavy hair and the
     * dress fade back into the canvas. Cells with no ink but enclosed by the
     * figure count as full weight, which is what keeps the face from turning
     * into an empty hole.
     * @returns dots in normalised space.
     */
    function invertedDots() {
      if (lineModel !== undefined) return lineModel
      const total = GIRL_COLUMNS * GIRL_ROWS
      const occupied = new Uint8Array(total)
      const weight = new Float32Array(total)
      for (let index = 0; index < GIRL_GRID.length && index < total; index += 1) {
        const value = Number.parseInt(GIRL_GRID[index], 16)
        if (!(value > 0)) continue
        occupied[index] = 1
        weight[index] = value / 15
      }
      const rowFirst = new Int32Array(GIRL_ROWS).fill(-1)
      const rowLast = new Int32Array(GIRL_ROWS).fill(-1)
      const columnFirst = new Int32Array(GIRL_COLUMNS).fill(-1)
      const columnLast = new Int32Array(GIRL_COLUMNS).fill(-1)
      for (let row = 0; row < GIRL_ROWS; row += 1) {
        for (let column = 0; column < GIRL_COLUMNS; column += 1) {
          if (occupied[row * GIRL_COLUMNS + column] === 0) continue
          if (rowFirst[row] < 0) rowFirst[row] = column
          rowLast[row] = column
          if (columnFirst[column] < 0) columnFirst[column] = row
          columnLast[column] = row
        }
      }
      const dots = []
      for (let row = 0; row < GIRL_ROWS; row += 1) {
        for (let column = 0; column < GIRL_COLUMNS; column += 1) {
          if (row < columnFirst[column] || row > columnLast[column]) continue
          if (column < rowFirst[row] || column > rowLast[row]) continue
          const index = row * GIRL_COLUMNS + column
          const alpha = occupied[index] === 1 ? 1 - weight[index] : 1
          if (alpha < 0.45) continue
          dots.push({
            u: (column + 0.5) / GIRL_COLUMNS,
            v: (row + 0.5) / GIRL_ROWS,
            a: alpha,
            phase: Math.random() * TAU,
            speed: 0.5 + Math.random() * 0.8,
          })
        }
      }
      lineModel = dots
      return dots
    }

    /**
     * Rasterise the two wordmark lines with the UI font and reduce them to the
     * same dotted grid the portrait uses.
     * @returns dots in normalised block space (`u`/`v` 0..1, `a` weight 0..1).
     */
    function lockupDots() {
      if (lockupModel !== undefined) return lockupModel
      const supersample = 4
      const family = '"Segoe UI", system-ui, sans-serif'
      // Display treatment: heavy italic with wide tracking, filled solid. Each
      // line is rasterised on its own canvas, so a descender that crosses the
      // other line's band still belongs to its own colour.
      const style = 'italic 700'
      const probe = document.createElement('canvas').getContext('2d')
      probe.font = `${style} 100px ${family}`
      if ('letterSpacing' in probe) probe.letterSpacing = '6px'
      const width = LOCKUP_COLUMNS * supersample
      const height = LOCKUP_ROWS * supersample
      const widest = Math.max(...LOCKUP_LINES.map(line => probe.measureText(line).width), 1)
      const size = ((width * 0.94) / widest) * 100
      const model = LOCKUP_LINES.map((line, lineIndex) => {
        const big = document.createElement('canvas')
        big.width = width
        big.height = height
        const bigContext = big.getContext('2d')
        bigContext.textAlign = 'left'
        bigContext.textBaseline = 'middle'
        if ('letterSpacing' in bigContext) bigContext.letterSpacing = '6px'
        bigContext.font = `${style} ${size.toFixed(1)}px ${family}`
        bigContext.fillStyle = 'rgba(255, 255, 255, 0.92)'
        bigContext.fillText(line, width * 0.02, height * (0.34 + 0.4 * lineIndex))

        const small = document.createElement('canvas')
        small.width = LOCKUP_COLUMNS
        small.height = LOCKUP_ROWS
        const smallContext = small.getContext('2d')
        smallContext.drawImage(big, 0, 0, LOCKUP_COLUMNS, LOCKUP_ROWS)
        const pixels = smallContext.getImageData(0, 0, LOCKUP_COLUMNS, LOCKUP_ROWS).data
        const dots = []
        for (let index = 0; index < LOCKUP_COLUMNS * LOCKUP_ROWS; index += 1) {
          const alpha = pixels[index * 4 + 3] / 255
          if (alpha < 0.08) continue
          dots.push({
            u: ((index % LOCKUP_COLUMNS) + 0.5) / LOCKUP_COLUMNS,
            v: (Math.floor(index / LOCKUP_COLUMNS) + 0.5) / LOCKUP_ROWS,
            a: Math.min(1, alpha * 1.25),
            phase: Math.random() * TAU,
            speed: 0.5 + Math.random() * 0.8,
          })
        }
        return dots
      })
      lockupModel = model
      return model
    }

    /**
     * Paint the dot mascot and wordmark into a canvas, twinkling in place.
     * @param canvas - the frame canvas sized to the conversation area.
     * @returns disposer that cancels the animation and observers.
     */
    function attachMascot(canvas: HTMLCanvasElement) {
      const context = canvas.getContext('2d')
      if (context === null) return () => {}
      const portraitLight = mascotDots()
      const portraitDark = invertedDots()
      const wordmark = lockupDots()
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let reduced = motion.matches
      const started = performance.now()
      // The reveal clock starts on the first paint that actually has a canvas to draw
      // into, otherwise the animation can finish while the element is still sizing.
      let revealStarted = 0
      let width = 1
      let height = 1
      let dpr = 1
      let frame = 0
      let drawnAt = 0
      let disposed = false
      /** Composer card geometry in canvas coordinates; the composition's bound. */
      let composerLeft = 0
      let composerWidth = 0
      let composerTop = 0
      let composerNode: Element | null = null
      const composerObserver = new ResizeObserver(() => { readComposer() })

      /** Re-read the composer card (it mounts with the hero and resizes with it). */
      const readComposer = () => {
        const canvasRect = canvas.getBoundingClientRect()
        // Pick the composer card that actually overlaps this conversation area:
        // hidden or off-screen cards (other panels, mounted shells) must not
        // become the layout bound.
        let node = null
        let rect = null
        for (const candidate of document.querySelectorAll('[data-composer-card]')) {
          const box = candidate.getBoundingClientRect()
          if (box.width < 80 || box.height < 20) continue
          if (box.right <= canvasRect.left || box.left >= canvasRect.right) continue
          if (rect === null || box.width > rect.width) {
            node = candidate
            rect = box
          }
        }
        if (node !== composerNode) {
          composerObserver.disconnect()
          composerNode = node
          if (node !== null) composerObserver.observe(node)
        }
        if (node === null || rect === null) {
          composerLeft = 0
          composerWidth = 0
          composerTop = 0
          return
        }
        composerLeft = rect.left - canvasRect.left
        composerWidth = rect.width
        composerTop = rect.top - canvasRect.top
      }

      /** Last canvas box in viewport coordinates, for pointer hit-testing. */
      let boxLeft = 0
      let boxTop = 0
      let boxWidth = 0
      let boxHeight = 0
      /** Pointer position in canvas coordinates; inactive while outside. */
      let pointerX = -1e6
      let pointerY = -1e6
      let pointerActive = false
      const onPointerMove = (event: PointerEvent) => {
        pointerX = event.clientX - boxLeft
        pointerY = event.clientY - boxTop
        pointerActive = pointerX >= 0 && pointerY >= 0 && pointerX <= boxWidth && pointerY <= boxHeight
        if (pointerActive) {
          trail.push({ x: pointerX, y: pointerY, at: performance.now() })
          if (trail.length > 8) trail.shift()
        spawnRipple()
        }
        if (reduced) paint(performance.now())
      }
      const onPointerLeave = () => { pointerActive = false }
      /** Moving the pointer over the field band leaves a light ripple behind. */
      const spawnRipple = () => {
        const cfg = dfSettings
        if (cfg !== undefined && cfg.ripple === false) return
        const nowMs = performance.now()
        if (nowMs - lastRippleAt < 90) return
        const bandTop = boxHeight - Math.min(440, Math.max(230, boxHeight * 0.4))
        if (pointerY < bandTop) return
        lastRippleAt = nowMs
        fieldRipples.push({ x: pointerX, y: pointerY, at: nowMs })
        if (fieldRipples.length > 8) fieldRipples.shift()
      }
      /** Recent pointer samples so the light leaves a short, fading trail. */
      const trail: { x: number; y: number; at: number }[] = []
      /** Click ripples: origin plus start time, oldest first. */
      const ripples: { x: number; y: number; at: number }[] = []
      const onPointerDown = (event: PointerEvent) => {
        const x = event.clientX - boxLeft
        const y = event.clientY - boxTop
        if (x < 0 || y < 0 || x > boxWidth || y > boxHeight) return
        ripples.push({ x, y, at: performance.now() })
        if (ripples.length > 5) ripples.shift()
      }


      const measure = () => {
        const rect = canvas.getBoundingClientRect()
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        width = Math.max(1, rect.width)
        height = Math.max(1, rect.height)
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        boxLeft = rect.left
        boxTop = rect.top
        boxWidth = width
        boxHeight = height
        readComposer()
      }

      /**
       * Draw one frame: both groups hold still and only their alpha breathes.
       * @param now - frame timestamp.
       */
      let bgLayer: HTMLCanvasElement | null = null
        let bgGlow: HTMLCanvasElement | null = null
        let fieldDots = null
        const fieldRipples: { x: number; y: number; at: number }[] = []
        let lastRippleAt = 0
        let fieldKeyCache = ''
        let composerFocused = false
        let focusAmount = 0
        let bgKey = ''

        const paint = (now: number) => {
        frame = 0
        if (disposed || document.hidden) return
        const cfg = dfSettings
        if (cfg !== undefined && cfg.hero === false) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          frame = requestAnimationFrame(paint)
          return
        }
        if (revealStarted === 0 && width > 200 && height > 200) revealStarted = now
        // The assembly is a short, fast reveal: give it a smoother frame rate
        // than the slow twinkle, then fall back to the cheap cadence.
        const assembling = now - revealStarted < ASSEMBLY_MS + 80
        const interval = (assembling ? 1000 / 60 : FRAME_MS) - 1
        if (!reduced && now - drawnAt < interval) {
          frame = requestAnimationFrame(paint)
          return
        }
        drawnAt = now
        const time = reduced ? 0 : (now - started) / 1000
        const dark = document.body.hasAttribute('data-ds-dark-theme')
        const ink = dark ? '236, 238, 242' : '102, 108, 120'
        // The composer card is the layout's bound: the pair is centred on it and
        // can never be wider than the input box.
        const limit = composerWidth > 160 ? composerWidth : width * 0.94
        const originX = composerWidth > 160 ? composerLeft : (width - limit) / 2

        // One pitch drives both groups: the wordmark and the portrait always share
        // the same dot size, and that pitch scales with the space available. Two
        // hard bounds: the composer width (the pair never exceeds the input box)
        // and the space above the composer (the pair hangs above it instead of
        // being covered by it).
        const availW = limit * 0.94
        const pairCells = LOCKUP_COLUMNS + GIRL_COLUMNS - 30
        const bandTop = composerTop > 140 ? composerTop : height * 0.86
        const heightPitch = Math.max(1, bandTop - 8) / GIRL_ROWS
        let pitch = Math.min(DOT_PITCH, availW / pairCells, heightPitch)
        let showText = true
        if (pitch < TEXT_MIN_PITCH) {
          // Only when the type would fall below the readable floor: drop the
          // wordmark and keep the portrait as large as it can be.
          showText = false
          pitch = Math.min(DOT_PITCH, availW / GIRL_COLUMNS, heightPitch)
        }
        if (pitch < 2.2) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          return
        }
        const blockW = LOCKUP_COLUMNS * pitch
        const blockH = LOCKUP_ROWS * pitch
        const portraitW = GIRL_COLUMNS * pitch
        const portraitH = GIRL_ROWS * pitch
        const overlap = Math.max(8, pitch * 30)
        const pairW = blockW + portraitW - overlap

        // Hang the pair off the composer: the portrait's bottom edge sits on the
        // composer's top edge, and the dot pitch above guaranteed it fits there.
        const portraitY = Math.min(
          Math.max(bandTop - portraitH / 2, 6 + portraitH / 2),
          Math.max(6 + portraitH / 2, height - portraitH / 2 - 6),
        )
        let portraitX
        let blockX = 0
        if (showText) {
          blockX = originX + Math.max(0, (limit - pairW) / 2)
          portraitX = blockX + blockW - overlap + portraitW / 2
        } else {
          portraitX = originX + limit / 2
        }
        // Keep the pair inside the canvas even if the composer rect was odd.
        const minX = portraitW / 2 + 6
        const maxX = Math.max(minX, width - portraitW / 2 - 6)
        portraitX = Math.min(Math.max(portraitX, minX), maxX)
        const blockY = portraitY - blockH / 2
        // The portrait and the wordmark are centred on each other, which leaves their
        // cell rows half a cell apart; nudge the portrait so every dot in the scene
        // (artwork and printed field alike) lands on one single lattice.
        const portraitYAligned = portraitY + pitch / 2
        const portraitRadius = Math.max(0.8, pitch * 0.28)
        const lockupRadius = Math.max(0.8, pitch * 0.34)

        // A faint dot field under everything, built on the artwork's own pitch and
        // ink so the background reads as part of the same printed sheet.
        // Phase the background lattice onto the artwork's own grid: the wordmark and the
        // portrait already sit on one lattice (their origins differ by a whole number
        // of cells), so matching that phase makes the field read as the same printed
        // sheet instead of a second, offset grid.
        // Artwork dots sit at the CENTRES of their cells (blockX + (col + 0.5) * pitch),
        // so the field has to be phased half a cell further: its dots land exactly on
        // the artwork's dots, like stones on intersections, not inside the squares.
        const phaseX = (((blockX + pitch / 2) % pitch) + pitch) % pitch
        const phaseY = (((blockY + pitch / 2) % pitch) + pitch) % pitch
        const buildKey = pitch.toFixed(3) + '|' + ink + '|' + phaseX.toFixed(3) + '|'
          + phaseY.toFixed(3) + '|' + width + '|' + height + '|' + dpr
        if (buildKey !== bgKey) {
          bgKey = buildKey
          bgLayer = document.createElement('canvas')
          bgLayer.width = Math.max(1, Math.round(width * dpr))
          bgLayer.height = Math.max(1, Math.round(height * dpr))
          const layerContext = bgLayer.getContext('2d')
          if (layerContext === null) {
            bgLayer = null
          } else {
            layerContext.setTransform(dpr, 0, 0, dpr, 0, 0)
            const fieldRadius = Math.max(0.45, pitch * 0.11)

            // The resting field.
            layerContext.fillStyle = 'rgba(' + ink + ', 0.1)'
            for (let y = phaseY; y < height + pitch; y += pitch) {
              for (let x = phaseX; x < width + pitch; x += pitch) {
                layerContext.beginPath()
                layerContext.arc(x, y, fieldRadius, 0, TAU)
                layerContext.fill()
              }
            }

            // The focused field: the same lattice, but brighter close to the
            // composer card and fading out with distance, so the click lights the
            // dots around the input rather than the whole page.
            bgGlow = document.createElement('canvas')
            bgGlow.width = bgLayer.width
            bgGlow.height = bgLayer.height
            const glowContext = bgGlow.getContext('2d')
            if (glowContext === null) {
              bgGlow = null
            } else {
              glowContext.setTransform(dpr, 0, 0, dpr, 0, 0)
              const cardLeft = composerWidth > 160 ? composerLeft : (width - limit) / 2
              const cardWidthForGlow = composerWidth > 160 ? composerWidth : limit
              const glowRadiusX = Math.max(160, cardWidthForGlow * 0.55)
              const glowRadiusY = Math.max(150, Math.min(height * 0.3, 260))
              const centerX = cardLeft + cardWidthForGlow / 2
              const centerY = composerTop + 8
              for (let y = phaseY; y < height + pitch; y += pitch) {
                for (let x = phaseX; x < width + pitch; x += pitch) {
                  const dx = (x - centerX) / glowRadiusX
                  const dy = (y - centerY) / glowRadiusY
                  const falloff = Math.exp(-(dx * dx + dy * dy) * 2.1)
                  if (falloff < 0.03) continue
                  glowContext.fillStyle = 'rgba(' + ink + ', ' + (0.3 * falloff).toFixed(3) + ')'
                  glowContext.beginPath()
                  glowContext.arc(x, y, fieldRadius, 0, TAU)
                  glowContext.fill()
                }
              }
            }
          }
        }

        // The portrait runs one opacity notch brighter than the wordmark, so the
        // two groups keep separate alpha ladders.
        const portraitPaths = []
        const wordmarkPaths = [[], []]
        for (let level = 0; level < LEVELS; level += 1) {
          portraitPaths.push(new Path2D())
          wordmarkPaths[0].push(new Path2D())
          wordmarkPaths[1].push(new Path2D())
        }

        // Wordmark assembly: dots light up left to right, with a bright front.
        const assembly = reduced ? 1 : Math.min(1, (now - revealStarted) / ASSEMBLY_MS)
        // The portrait follows the wordmark: a soft vertical wipe grows it downward
        // about a tenth of a second later.
        const portraitProgress = reduced
          ? 1
          : Math.max(0, Math.min(1, ((now - revealStarted) - 140) / 1100))
        while (ripples.length > 0 && now - ripples[0].at > 760) ripples.shift()
        const trailNow = trail.filter(sample => now - sample.at < 420)
        const rippleBoost = (x: number, y: number) => {
          let best = 0
          for (const ripple of ripples) {
            const age = (now - ripple.at) / 760
            const radius = age * 640
            const dx = x - ripple.x
            const dy = y - ripple.y
            if (dx * dx + dy * dy > (radius + 200) * (radius + 200)) continue
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (Math.abs(distance - radius) > 160) continue
            const band = Math.exp(-Math.pow((distance - radius) / 44, 2))
            best = Math.max(best, band * (1 - age))
          }
          return 1 + 1.25 * best
        }
        const trailBoost = (x: number, y: number) => {
          let best = 0
          for (const sample of trailNow) {
            const age = Math.max(0, (now - sample.at) / 420)
            const dx = x - sample.x
            const dy = y - sample.y
            if (Math.abs(dx) > 260 || Math.abs(dy) > 260) continue
            best = Math.max(best, Math.exp(-(dx * dx + dy * dy) / (2 * 95 * 95)) * (1 - age))
          }
          return 1 + 0.95 * best
        }
        const place = (target: Path2D[], dot: HalftoneDot, x: number, y: number, radius: number, kind: 'portrait' | 'wordmark', line?: number) => {
          // The portrait holds a steady level; only the wordmark breathes.
          const breathe = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time * dot.speed + dot.phase)
          // Ease the wave so the low and high ends linger instead of sweeping
          // through the extremes linearly, which reads as a softer pulse.
          const eased = breathe * breathe * (3 - 2 * breathe)
          let tone = kind === 'portrait' ? dot.a : dot.a * (0.35 + 0.65 * eased)
          if (kind === 'portrait' && portraitProgress < 1) {
            const local = Math.max(0, Math.min(1, (portraitProgress - dot.v * 0.45) / 0.55))
            const wipe = local * local * (3 - 2 * local)
            if (wipe <= 0.004) return
            tone *= wipe
          }
          if (kind === 'wordmark') {
            if (assembly < 1) {
              // Whole-word fade: the line rises as one piece, no left-to-right sweep.
              const offset = line === 1 ? ASSEMBLY_SECOND_LINE : 0
              const progress = Math.max(0, Math.min(1, (assembly - offset) / ASSEMBLY_LINE_SPAN))
              const smooth = progress * progress * (3 - 2 * progress)
              if (smooth <= 0.02) return
              tone *= smooth
            }
            if (pointerActive) tone *= trailBoost(x, y)
          }
          // Ripples are a wordmark effect; the portrait stays untouched.
          if (kind === 'wordmark') tone = Math.min(1, tone * rippleBoost(x, y))
          const level = Math.min(LEVELS - 1, Math.max(0, Math.round(tone * (LEVELS - 1))))
          // Halftone weighting: heavier cells draw slightly larger dots, so the
          // field reads as printed ink rather than a uniform grid.
          const size = radius * (0.82 + 0.36 * dot.a)
          target[level].moveTo(x + size, y)
          target[level].arc(x, y, size, 0, TAU)
        }
        const portrait = dark ? portraitDark : portraitLight
        for (const dot of portrait) {
          place(
            portraitPaths,
            dot,
            portraitX + (dot.u - 0.5) * portraitW,
            portraitYAligned + (dot.v - 0.5) * portraitH,
            portraitRadius,
            'portrait',
          )
        }
        if (showText) {
          wordmark.forEach((dots, index) => {
            for (const dot of dots) {
              place(
                wordmarkPaths[index],
                dot,
                blockX + dot.u * blockW,
                blockY + dot.v * blockH,
                lockupRadius,
                'wordmark',
                index,
              )
            }
          })
        }

        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        context.clearRect(0, 0, width, height)
        // The field is painted after the clear so it survives the frame.
        if (bgLayer !== null && (cfg === undefined || cfg.field !== false)) {
          context.drawImage(bgLayer, 0, 0, width, height)
        }
        const focusTarget = composerFocused ? 1 : 0
        focusAmount += (focusTarget - focusAmount) * 0.14
        if (focusAmount > 0.005 && bgGlow !== null) {
          context.save()
          context.globalAlpha = Math.min(1, focusAmount)
          context.drawImage(bgGlow, 0, 0, width, height)
          context.restore()
        }

        // The wave field lives on the lattice: the light pattern is pure brightness,
        // and the pointer can nudge dots aside. Nothing follows the cursor and every
        // displaced dot springs straight back to its own cell.
        const fieldKey = width + '|' + height + '|' + pitch.toFixed(3) + '|'
          + phaseX.toFixed(2) + '|' + phaseY.toFixed(2)
        if (fieldKey !== fieldKeyCache) {
          fieldKeyCache = fieldKey
          fieldDots = []
          const bandHeight = Math.min(440, Math.max(230, height * 0.4))
          const bandTop = height - bandHeight
          for (let y = phaseY; y < height + pitch; y += pitch) {
            if (y < bandTop) continue
            const depth = Math.min(1, (y - bandTop) / bandHeight)
            const vertical = depth * depth * (3 - 2 * depth)
            for (let x = phaseX; x < width + pitch; x += pitch) {
              fieldDots.push({ x: x, y: y, vertical: vertical, ox: 0, oy: 0, vx: 0, vy: 0 })
            }
          }
        }

        if (!reduced && fieldDots !== null && (cfg === undefined || cfg.wave !== false)) {
          const dt = 1 / 30
          const unit = pitch / 8
          const fieldRadius = Math.max(0.45, pitch * 0.11)
          const breathe = 0.86 + 0.14 * Math.sin(time * 0.13)
          const buckets = [[], [], [], [], [], []]
          while (fieldRipples.length > 0 && now - fieldRipples[0].at > 1100) fieldRipples.shift()
          for (const dot of fieldDots) {

            const warpX = Math.sin(dot.y * 0.006 / unit + time * 0.23) * 30
              + Math.sin(dot.x * 0.003 / unit - time * 0.17) * 20
            const warpY = Math.sin(dot.x * 0.0035 / unit + time * 0.29) * 26
            const u = (dot.x + warpX) / unit
            const v = (dot.y + warpY) / unit
            const field = 0.5
              + 0.3 * Math.sin(u * 0.0035 - time * 0.55)
              + 0.22 * Math.sin(u * 0.0061 + time * 0.37 + v * 0.01)
              + 0.18 * Math.sin(u * 0.0107 - time * 0.29 + v * 0.021)
              + 0.12 * Math.sin(u * 0.0173 + time * 0.83 - v * 0.033)
            let light = Math.max(0, Math.min(1, field)) ** 1.6
            // A touch only adds light: rings race outward and fade, the dots stay put.
            for (const ripple of fieldRipples) {
              const age = (now - ripple.at) / 1100
              const rdx = dot.x - ripple.x
              const rdy = dot.y - ripple.y
              const distance = Math.sqrt(rdx * rdx + rdy * rdy)
              const ring = Math.exp(-Math.pow((distance - age * 420) / 42, 2)) * (1 - age)
              if (ring > 0.001) light += ring * 0.8
            }
            const alpha = dot.vertical * (0.05 + Math.min(1, light) * 0.85) * breathe * (dark ? 1 : 1.2)
            const level = Math.min(5, Math.floor(alpha * 7))
            buckets[level].push(dot.x, dot.y)
          }
          for (let level = 0; level < buckets.length; level += 1) {
            const bucket = buckets[level]
            if (bucket.length === 0) continue
            const alpha = 0.03 + level * 0.105
            context.fillStyle = 'rgba(' + ink + ', ' + alpha.toFixed(3) + ')'
            context.beginPath()
            for (let index = 0; index < bucket.length; index += 2) {
              context.moveTo(bucket[index] + fieldRadius, bucket[index + 1])
              context.arc(bucket[index], bucket[index + 1], fieldRadius, 0, TAU)
            }
            context.fill()
          }
        }

        const paintGroup = (paths: Path2D[], boost: number, color: string) => {
          for (let level = 0; level < LEVELS; level += 1) {
            const alpha = Math.min(1, (0.05 + (level / (LEVELS - 1)) * 0.5) * boost).toFixed(3)
            context.fillStyle = `rgba(${color}, ${alpha})`
            context.fill(paths[level])
          }
        }
        // The portrait's opacity nudge flips with the palette: +10% on the light
        // canvas, and its inverse trim on the dark one, where light dots already
        // read brighter against the canvas.
        paintGroup(portraitPaths, dark ? 1.15 : 1.8, ink)
        if (showText) {
          paintGroup(wordmarkPaths[0], dark ? 1 : 1.2, ink)
          paintGroup(wordmarkPaths[1], dark ? 1 : 1.2, '122, 170, 255')
        }
        if (DEBUG) {
          context.fillStyle = '#ff5555'
          context.font = '12px monospace'
          const readout = [
            'pitch=' + pitch.toFixed(2) + ' limit=' + limit.toFixed(0) + ' composerTop=' + composerTop.toFixed(0),
            'canvas=' + width.toFixed(0) + 'x' + height.toFixed(0) + ' dpr=' + dpr + ' showText=' + showText,
            'portrait=' + portraitW.toFixed(0) + 'x' + portraitH.toFixed(0)
              + ' @ ' + portraitX.toFixed(0) + ',' + portraitY.toFixed(0),
            'block=' + blockW.toFixed(0) + 'x' + blockH.toFixed(0)
              + ' @ ' + blockX.toFixed(0) + ',' + blockY.toFixed(0),
          ]
          readout.forEach((line, index) => context.fillText(line, 12, 20 + index * 16))
          context.strokeStyle = '#ff5555'
          context.strokeRect(portraitX - portraitW / 2, portraitY - portraitH / 2, portraitW, portraitH)
          context.strokeStyle = '#5599ff'
          context.strokeRect(blockX, blockY, blockW, blockH)
        }
        if (!reduced) frame = requestAnimationFrame(paint)
      }

      const observer = new ResizeObserver(() => {
        measure()
        if (reduced) paint(performance.now())
      })
      observer.observe(canvas)
      /** Focus inside the composer card lights the field around it. */
      const onFocusChange = () => {
        const active = document.activeElement
        composerFocused = active !== null && active !== document.body
          && typeof active.closest === 'function'
          && active.closest('[data-composer-card]') !== null
      }
      window.addEventListener('focusin', onFocusChange, { passive: true })
      window.addEventListener('focusout', onFocusChange, { passive: true })
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('pointerdown', onPointerDown, { passive: true })
      const refresh = () => {
        if (disposed) return
        cancelAnimationFrame(frame)
        frame = 0
        if (!document.hidden) frame = requestAnimationFrame(paint)
      }
      const onMotion = () => { reduced = motion.matches; refresh() }
      const themeObserver = new MutationObserver(refresh)
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      const unsubscribeSettings = dfSubscribeSettings(refresh)
      motion.addEventListener('change', onMotion)
      document.addEventListener('visibilitychange', refresh)
      measure()
      refresh()

      return () => {
        disposed = true
        unsubscribeSettings()
        themeObserver.disconnect()
        motion.removeEventListener('change', onMotion)
        document.removeEventListener('visibilitychange', refresh)
        cancelAnimationFrame(frame)
        observer.disconnect()
        composerObserver.disconnect()
        window.removeEventListener('focusin', onFocusChange)
        window.removeEventListener('focusout', onFocusChange)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('pointerdown', onPointerDown)
      }
    }

    /**
     * Frame layer for the blank home: paint the dot mascot below the content and
     * pass the wrapped scroll body through untouched.
     * @param props - the home flag and the wrapped Conversation body.
     * @returns the layout-neutral frame.
     */
    function HeroFrame({ hero, children }: { hero: boolean; children?: React.ReactNode }) {
      const { values } = useDfSettings()
      const show = hero === true && values.hero
      const canvasRef = React.useRef<HTMLCanvasElement>(null)
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!show || canvas === null) return undefined
        return attachMascot(canvas)
      }, [show])
      return h('div', { className: 'dwe-frame' },
        values.aurora && h('div', { className: 'fish-backdrop', 'data-home': hero === true, 'aria-hidden': true },
          h(FishPlate, { scene: values.scene, live: true })),
        show ? h('div', { key: 'sign', className: 'dwe-sign' }, 'dsh-fish-ui') : null,
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

/* One whale on the blank home: the official pixel whale would otherwise sit
   behind this dot field, so its canvas is hidden. It keeps its slot layer and
   still renders the wrapped content; only its artwork is suppressed. */
:root:has(canvas.dwe-whale) [data-home-whale] {
  display: none !important;
}

/* Blank-home headline: drop the headline copy and the brand mark
   beside it, leaving the dot portrait alone above the composer. The title group
   is a CSS-module class (matched by its local name inside the hash, scoped by
   the headline ancestor); the mark is the hero's own brand slot, matched by its
   public slot key. If upstream renames either hook the rule simply stops
   applying. */
:root:has(canvas.dwe-whale) [class*="headline"] [class*="titleGroup"],
:root:has(canvas.dwe-whale) [data-slot="conversation.hero.brand.mark"] {
  display: none !important;
}


/* Product signature: only while the blank home is on screen, because the
   element lives inside the hero frame layer. */
.dwe-sign {
  position: fixed;
  right: 14px;
  bottom: 10px;
  z-index: 2147483000;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-tertiary);
  opacity: 0.28;
  pointer-events: none;
  user-select: none;
}

/* ------------------------------------------------------------------ accents */

/* Composer focus: the shipped 0.5px hairline turns whale blue and an inset ring
   thickens the edge. The inset shadow follows the card radius and costs no
   layout, and a focused draft editor is the only trigger — toolbar buttons
   inside the card keep the resting look. */
/* Frosted composer, but only where something interesting runs behind it: while a
   Session is open the messages scroll under the card, so glass reads as glass. On
   the blank home the card sits on flat dotted paper, where translucency only muddies
   the surface — there it keeps the shipped solid background. */
/* On the blank home the card must be fully opaque: the shipped menu surface is
   slightly translucent, so the wave field behind it would show through the card as
   moving light bands. */
/* The blank home keeps the card solid only when frosting is switched off. */
:root.df-off-glass body:has(canvas.dwe-whale) [data-composer-card] {
  background: var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1));
}

:root:not(.df-off-glass) [data-composer-card] {
  /* Much more translucent than the host surface, with a stronger blur and a touch of
     saturation: the frosted look only reads if the backdrop is actually visible. */
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent),
      color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent) 42%,
      transparent
    ),
    color-mix(in srgb, var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1)) 54%, transparent);
  -webkit-backdrop-filter: blur(26px) saturate(1.25);
  backdrop-filter: blur(26px) saturate(1.25);
}

/* Composer focus: a soft whale-blue ring fades in under the card's own hairline
   instead of recolouring it (a rebinding token switches instantly and reads as a
   pop). Both states declare the same shadow layers so the transition interpolates
   every layer, and the easing starts quickly and settles slowly. */
/* Focus ring in light grey: the composer is a text surface, so the highlight stays
   neutral and the accent colour is reserved for content. */
:root {
  --df-focus-ink: 124, 128, 136;
}

body[data-ds-dark-theme] {
  --df-focus-ink: 224, 226, 232;
}

:root:not(.df-off-focusring) [data-composer-card] {
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 0 0 1px rgba(var(--df-focus-ink), 0),
    0 0 0 0 rgba(var(--df-focus-ink), 0),
    0 0 12px 0 rgba(var(--df-focus-ink), 0),
    0 0 32px 2px rgba(var(--df-focus-ink), 0);
  transition: box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

:root:not(.df-off-focusring) [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus) {
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 0 0 1.2px rgba(var(--df-focus-ink), 0.92),
    0 0 0 3px rgba(var(--df-focus-ink), 0.12),
    0 0 14px 1px rgba(var(--df-focus-ink), 0.22),
    0 0 40px 6px rgba(var(--df-focus-ink), 0.1);
}

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


/* ------------------------------------------------------------- startup splash */
.df-splash {
  position: fixed;
  inset: 0;
  z-index: 2147483600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050507;
  pointer-events: none;
  animation: df-splash-out 460ms 1860ms cubic-bezier(0.4, 0, 1, 1) forwards;
  contain: strict;
}

/* Compositor-only animation: every property below is opacity or transform. */
.df-splash-grid {
  position: absolute;
  inset: -2px;
  background-image: radial-gradient(circle at 1px 1px, rgba(186, 196, 214, 0.5) 0.9px, transparent 1.15px);
  background-size: 18px 18px;
  opacity: 0;
  will-change: opacity;
  animation: df-splash-grid-in 620ms 60ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.df-splash-ring {
  position: absolute;
  width: 108vmax;
  height: 108vmax;
  border: 1px solid rgba(176, 196, 232, 0.55);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.08);
  will-change: transform, opacity;
  animation: df-splash-ring 900ms 60ms cubic-bezier(0.16, 0.84, 0.36, 1) forwards;
}

.df-splash-mark {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08em;
  overflow: hidden;
}

.df-splash-line {
  display: block;
  font: 800 clamp(38px, 7.8vw, 108px) / 1.14 "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0.09em;
  color: transparent;
  background-size: 5px 5px;
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.985);
  will-change: transform, opacity;
  animation: df-splash-line 760ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.df-splash-deepseek {
  background-image: radial-gradient(circle at 1px 1px, #eef0f4 1.1px, transparent 1.35px);
}

.df-splash-harness {
  background-image: radial-gradient(circle at 1px 1px, #7aaaff 1.1px, transparent 1.35px);
  animation-delay: 170ms;
}

.df-splash-sheen {
  position: absolute;
  top: -10%;
  bottom: -10%;
  left: 0;
  width: 34%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.42) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  transform: translate3d(-120%, 0, 0);
  will-change: transform, opacity;
  animation: df-splash-sheen 820ms 1080ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
}

.df-splash-veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 46%, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, 0.62) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 26%);
}

@keyframes df-splash-grid-in {
  to { opacity: 0.55; }
}

@keyframes df-splash-ring {
  0% { opacity: 0; transform: scale(0.08); }
  30% { opacity: 0.5; }
  100% { opacity: 0; transform: scale(1.15); }
}

@keyframes df-splash-line {
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes df-splash-sheen {
  0% { opacity: 0; transform: translate3d(-120%, 0, 0); }
  20% { opacity: 0.9; }
  100% { opacity: 0; transform: translate3d(300%, 0, 0); }
}

@keyframes df-splash-out {
  to { opacity: 0; visibility: hidden; }
}

@media (prefers-reduced-motion: reduce) {
  .df-splash,
  .df-splash-grid,
  .df-splash-ring,
  .df-splash-line,
  .df-splash-sheen {
    animation: none;
    opacity: 1;
    transform: none;
  }
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

/* Selected conversation: a flat black plate in dark theme instead of the host's
   translucent hover fill. */
body[data-ds-dark-theme] [class*="_sessionRow"][class*="_selected"] {
  background-color: #0d0d10;
}

body:not([data-ds-dark-theme]) [class*="_sessionRow"][class*="_selected"] {
  background-color: #e9e9ec;
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

    /**
     * Startup splash: the dot wordmark over the boot screen.
     *
     * The whole animation is CSS transform/opacity so the compositor drives it: no canvas,
     * no per-frame JavaScript while the app is still booting.
     */
    function dfPlaySplash() {
      if (window.__dfSplashPlayed === true) return
      window.__dfSplashPlayed = true
      try {
        if (typeof document === 'undefined' || document.body === null) return
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const layer = document.createElement('div')
        layer.className = 'df-splash'
        layer.setAttribute('aria-hidden', 'true')
        const grid = document.createElement('div')
        grid.className = 'df-splash-grid'
        const ring = document.createElement('div')
        ring.className = 'df-splash-ring'
        const mark = document.createElement('div')
        mark.className = 'df-splash-mark'
        const deepseek = document.createElement('span')
        deepseek.className = 'df-splash-line df-splash-deepseek'
        deepseek.textContent = 'deepseek'
        const harness = document.createElement('span')
        harness.className = 'df-splash-line df-splash-harness'
        harness.textContent = 'harness'
        const sheen = document.createElement('div')
        sheen.className = 'df-splash-sheen'
        mark.append(deepseek, harness, sheen)
        const veil = document.createElement('div')
        veil.className = 'df-splash-veil'
        layer.append(grid, ring, mark, veil)
        document.body.appendChild(layer)
        const remove = () => {
          if (layer.isConnected) layer.remove()
        }
        layer.addEventListener('animationend', event => {
          if (event.animationName === 'df-splash-out') remove()
        })
        setTimeout(remove, 3200)
      } catch (error) {
        console.warn('[dsh-fish-ui] splash failed', error)
      }
    }

    /* fish runtime:start */
    // Profile settings and host theme token layers.
    const DF_SETTINGS_KEY = 'dsh-fish-ui:settings'
    const DF_FLAGS = [
      'hero', 'field', 'wave', 'ripple', 'thinkingSphere', 'thinkingLabel',
      'glass', 'effortBadge', 'sidebarDots', 'sidebarRail', 'bold', 'focusRing', 'diff',
      'reading', 'code', 'fishFont', 'fishGlow', 'fishMotion', 'fishCode',
      'catppuccin', 'aurora', 'cursor', 'textMotion', 'hostIcons',
    ] as const
    type FishSettings = Readonly<Record<typeof DF_FLAGS[number], boolean> & { scene: SceneId; sceneMotion: string; iconStyle: string; accentColor: string }>
    const DF_DEFAULT_SETTINGS = Object.freeze({
      ...Object.fromEntries(DF_FLAGS.map(key => [key, true])),
      scene: 'atlas', sceneMotion: 'calm', iconStyle: 'duotone', accentColor: BRAND_BLUE,
    }) as FishSettings
    function validSetting(key: string, value: unknown) {
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
      for (const [key, className] of Object.entries(DF_OFF_CLASS)) {
        document.documentElement.classList.toggle(className, dfSettings[key] === false)
      }
      document.documentElement.dataset.fishPace = dfSettings.sceneMotion
      document.documentElement.dataset.fishIcons = dfSettings.iconStyle
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
          hero: ['\u70b9\u9635\u4eba\u50cf\u4e0e\u5b57\u6807', '\u7a7a\u767d\u6b22\u8fce\u9875\u4e0a\u7684\u7acb\u7ed8\u548c\u5b57\u6807'],
          field: ['\u80cc\u666f\u70b9\u9635', '\u94fa\u6ee1\u6574\u9875\u7684\u6de1\u70b9\u9635'],
          wave: ['\u5e95\u90e8\u6ce2\u6d6a', '\u9875\u9762\u5e95\u90e8\u7f13\u6162\u6d41\u52a8\u7684\u660e\u6697\u6ce2'],
          ripple: ['\u6307\u9488\u6d9f\u6f2a', '\u9f20\u6807\u5212\u8fc7\u70b9\u9635\u65f6\u8361\u5f00\u7684\u5149\u73af'],
          thinkingSphere: ['\u70b9\u9635\u7403', '\u601d\u8003\u65f6\u65cb\u8f6c\u7684\u5c0f\u7403'],
          thinkingLabel: ['英文思考文案', '把状态行换成 “Deep thinking for 12s. . .”'],
          glass: ['\u78e8\u7802\u73bb\u7483', '\u4f1a\u8bdd\u9875\u8f93\u5165\u6846\u7684\u534a\u900f\u660e\u6548\u679c'],
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
          hero: ['Dot artwork', 'The portrait and the wordmark on the blank home'],
          field: ['Dot field', 'The faint lattice behind everything'],
          wave: ['Bottom wave', 'The slow brightness wave along the bottom edge'],
          ripple: ['Pointer ripples', 'Light rings where the pointer crosses the field'],
          thinkingSphere: ['Dot sphere', 'The rotating point-sphere beside the live status'],
          thinkingLabel: ['English status label', 'Replace the status row with “Deep thinking for 12s. . .”'],
          glass: ['Frosted glass', 'Translucent input card on session pages'],
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
      aurora: ['会话背景', '在欢迎页和聊天记录后面显示所选场景'],
      cursor: ['指针物理', '跟随指针的柔光、输入框微倾斜'],
      textMotion: ['思考与文字动效', '回复浮入、思考块微光、流式文字呼吸感'],
      hostIcons: ['导航与操作图标', '新会话、搜索、文件夹、复制和发送等按钮使用所选图标风格'],
    })
    Object.assign(DF_COPY.en.items, {
      catppuccin: ['Catppuccin palette', 'Latte / Mocha backgrounds, text, borders and accents'],
      aurora: ['Conversation backdrop', 'Show the selected scene on the welcome page and behind messages'],
      cursor: ['Pointer physics', 'A cursor-following glow and a subtle composer tilt'],
      textMotion: ['Thinking & text motion', 'Replies rise in, reasoning shimmers, streaming text breathes'],
      hostIcons: ['Navigation & action icons', 'Use the chosen icon style for new chats, search, folders, copy, send and related controls'],
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
      :root:not(.df-off-fishglow) [data-composer-card]:focus-within {
        box-shadow: 0 0 0 1px var(--fish-ink),
                    0 18px 50px -28px var(--fish-ink) !important;
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
      :root:not(.df-off-fishmotion) button {
        transition: transform .16s ease, box-shadow .16s ease;
      }
      :root:not(.df-off-fishmotion) button:hover {
        transform: translateY(-1px);
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
  opacity: .18;
  mask-image: linear-gradient(90deg, #000, rgb(0 0 0 / .38) 28% 72%, #000);
}
.fish-backdrop[data-home="true"] {
  z-index: -2;
  opacity: .43;
  mask-image: radial-gradient(ellipse at 45% 46%, rgb(0 0 0 / .27) 12%, rgb(0 0 0 / .6) 58%, #000 96%);
}
body[data-ds-dark-theme] .fish-backdrop { opacity: .34; }
body[data-ds-dark-theme] .fish-backdrop[data-home="true"] { opacity: .82; }
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
.fish-brand {
  flex: none;
  width: 27px;
  height: 27px;
  display: inline-grid;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(145deg, #718DFF, #4D6BFE 48%, #243EAA);
  box-shadow: inset 0 0 0 1px rgb(191 212 255 / .42);
}
.fish-logo { display: block; width: 100%; height: 100%; }
.df-foot-button { gap: 8px; }
.df-foot-button .fish-brand { width: 22px; height: 22px; border-radius: 7px; }
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
      let frame = 0
      let x = 0, y = 0, targetX = 0, targetY = 0
      const clearCard = () => {
        if (!card) return
        card.classList.remove('fish-tilting')
        card.style.removeProperty('--fish-tilt-x')
        card.style.removeProperty('--fish-tilt-y')
        card = null
      }
      const paint = () => {
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
        const next = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-composer-card]') : null
        if (next !== card) { clearCard(); card = next }
        if (!card) return
        const rect = card.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        card.style.setProperty('--fish-tilt-x', ((.5 - (targetY - rect.top) / rect.height) * 1.6).toFixed(2) + 'deg')
        card.style.setProperty('--fish-tilt-y', (((targetX - rect.left) / rect.width - .5) * 1.6).toFixed(2) + 'deg')
        card.classList.add('fish-tilting')
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
        const enabled = dfSettings.cursor && media.matches && !document.hidden
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
      const [tab, setTab] = React.useState('scenes')
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
        group(zh ? '阅读' : 'Reading', [item('reading'), item('code')]),
        group(copy.groups.hero, [
          item('hero'), item('field'), item('wave'), item('ripple'),
        ]),
        group(copy.groups.thinking, [
          item('thinkingSphere'), item('thinkingLabel'),
        ]),
        group(copy.groups.composer, [
          item('glass'), item('effortBadge'),
        ]),
        group(copy.groups.sidebar, [
          item('sidebarDots'), item('sidebarRail'),
        ]),
        group(copy.groups.accents, [
          item('bold'), item('focusRing'), item('diff'),
        ]),
        group(zh ? 'Fish 字体与质感' : 'Fish finish', [
          item('fishFont'), item('fishGlow'), item('fishMotion'), item('fishCode'),
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
        const focusable = () => panel === null ? [] : [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:checked:not(:disabled), input[type="color"]:not(:disabled), [href], [tabindex="0"]')]
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
          h('span', { key: 'title', className: 'df-sheet-title' }, h('span', { className: 'fish-brand' }, h(FishBrand)), 'Deep Fish UI'),
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
          h('span', { key: 'icon', className: 'fish-brand' }, h(FishBrand)),
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
        dfPlaySplash()
        ctx.effect(() => {
          dfMounted = true
          const visible = () => document.documentElement.toggleAttribute('data-fish-paused', document.hidden)
          document.addEventListener('visibilitychange', visible)
          visible()
          dfApplySettings()
          return () => {
            dfMounted = false
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
          style.textContent = FISH_FX_CSS + '\n' + FISH_STUDIO_CSS + '\n' + DF_SCENE_ART_CSS + '\n' + productIconCss()
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: fx styles')
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
        installModelStudio(ctx, React)
        dfInstallReplyMotion(React, ctx, dfPlaySceneArrival)
        // Fresh conversation on every launch. The service may not be reachable the first
        // moment the shell is up, so retry for a few seconds and leave a manual trigger.
        ctx.inject(['uiWorkspace'], scope => {
          const open = tries => {
            try {
              if (typeof scope.uiWorkspace.startSession === 'function') {
                scope.uiWorkspace.startSession()
                console.info('[dsh-fish-ui] opened a new session on launch')
                return
              }
            } catch (error) {
              console.warn('[dsh-fish-ui] new session failed', error)
              return
            }
            if (tries < 30) window.setTimeout(() => open(tries + 1), 400)
          }
          window.__dfNewSession = () => open(0)
          scope.effect(() => {
            const timer = window.setTimeout(() => open(0), 2500)
            return () => window.clearTimeout(timer)
          }, 'dsh-fish-ui: new session on launch')
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
