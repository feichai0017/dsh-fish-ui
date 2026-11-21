// Match the frame's painted columns and residents. Keep filters off their
// containers so window-caption controls and floating DockKit panes stay anchored.
const sidebar = 'div:has(> [data-slot="sidebar"])'
const header = 'header[data-window-drag]:has(> [data-conversation-header-leading])'
const dockCell = '[data-sidebar-right-panel] :is([data-dockkit-pane], [data-dockkit-empty], [data-dockkit-float])'
const sceneWindow = ':root[data-fish-pace][data-df-window-scene]'
const sceneGlass = `${sceneWindow}:not(.df-off-glass)`
const footer = '[data-shell-bottom]'
const heroRow = '[data-content-phase="hero"] [class*="heroWorkspaceRow"]'
const preset = '[data-slot="conversation.hero.agentPreset"]'
const heroChip = `:is(${heroRow} > button, ${heroRow} > ${preset} > * > button)[aria-haspopup="menu"]`

export const shellGlassCss = `
:root[data-fish-pace] body {
  --df-shell-scene: var(--df-scene-glow, #9cbfff);
  --df-shell-depth: var(--df-scene-deep, #152665);
  --df-shell-accent: var(--df-accent, #4d6bfe);
  --df-shell-surface: color-mix(in srgb, var(--df-shell-scene) 14%, #f5f7fa);
  --df-shell-raised: color-mix(in srgb, var(--df-shell-scene) 7%, #fcfdff);
  --df-shell-line: color-mix(in srgb, var(--df-shell-depth) 20%, var(--df-shell-surface));
  --df-shell-ink: #202839;
  --df-shell-muted: #48566a;
  --df-glass-keylight: rgb(255 255 255 / .97);
  --df-glass-rim-light: rgb(255 255 255 / .70);
  --df-glass-rim-shade: rgb(34 54 82 / .22);
  --df-glass-saturation: 1.26;
  --df-glass-fresnel: linear-gradient(145deg, var(--df-glass-keylight), var(--df-glass-rim-light) 16%,
    transparent 41%, var(--df-glass-rim-shade) 68%, var(--df-glass-rim-light) 96%);
  --df-shell-highlight: var(--df-glass-rim-light);
  --df-shell-shadow: rgb(30 45 70 / .18);
  --df-shell-reflected-sky: rgb(255 255 255 / .32);
  --df-shell-film: radial-gradient(ellipse at 0% 0%, var(--df-shell-reflected-sky), transparent 58%),
    linear-gradient(135deg, transparent 25%, color-mix(in srgb, var(--df-shell-scene) 9%, transparent) 100%);
  --df-shell-chrome-fill: var(--df-shell-surface);
  --df-shell-card-fill: var(--df-shell-raised);
}
:root[data-fish-pace] body[data-ds-dark-theme] {
  --df-shell-surface: color-mix(in srgb, var(--df-shell-depth) 33%, #171c29);
  --df-shell-raised: color-mix(in srgb, var(--df-shell-scene) 8%, var(--df-shell-surface));
  --df-shell-line: color-mix(in srgb, var(--df-shell-scene) 23%, var(--df-shell-surface));
  --df-shell-ink: #f0f3fd;
  --df-shell-muted: #bbc6d9;
  --df-glass-keylight: rgb(243 250 255 / .59);
  --df-glass-rim-light: rgb(226 240 255 / .23);
  --df-glass-rim-shade: rgb(1 8 20 / .56);
  --df-glass-saturation: 1.32;
  --df-shell-reflected-sky: rgb(221 237 255 / .09);
  --df-shell-shadow: rgb(3 9 19 / .46);
}
:root[data-fish-pace].df-off-aurora body {
  --df-shell-scene: #a4aeba;
  --df-shell-depth: #374250;
}

/* A matte finish retains the palette but removes the rim highlight and surface wash. */
:root[data-fish-pace].df-off-glass body {
  --df-shell-film: none;
  --df-glass-keylight: transparent;
  --df-glass-rim-light: transparent;
  --df-glass-rim-shade: transparent;
  --df-glass-fresnel: none;
}

/* The sidebar column paints macOS vibrancy under a transparent sidebar root. Set its
   native tokens locally, including the Windows caption row's own paint. */
:root[data-fish-pace] ${sidebar} {
  --dsw-specific-sidebar-fill: var(--df-shell-chrome-fill);
  --dsw-specific-sidebar-tint: var(--df-shell-chrome-fill);
  --dsw-specific-sidebar-wash-top: color-mix(in srgb, var(--df-shell-scene) 16%, transparent);
  --dsw-specific-sidebar-wash-bottom: color-mix(in srgb, var(--df-shell-depth) 5%, transparent);
  --dsw-specific-sidebar-wash-top-clear: transparent;
  --dsw-specific-sidebar-wash-bottom-clear: transparent;
  border-inline-end-color: var(--df-shell-line);
}
:root[data-fish-pace].df-off-glass div:has(> [data-slot="sidebar"]) {
  background: var(--df-shell-surface);
}
:root[data-windows-titlebar][data-fish-pace] div:has(> [data-rightbar-col]) {
  --dsw-specific-sidebar-fill: var(--df-shell-surface);
}
:root[data-fish-pace] div:has(> [data-rightbar-col]) > div:has(+ [data-rightbar-col]) {
  border-inline-start-color: var(--df-shell-line);
}
:root[data-fish-pace] [data-slot="sidebar"] [role="treeitem"][aria-selected="true"],
:root[data-fish-pace] [data-slot="sidebar"] div:has(> button[aria-current="page"]) {
  color: var(--df-shell-ink);
  background: color-mix(in srgb, var(--df-shell-accent) 14%, var(--df-shell-surface));
  box-shadow: inset 2px 0 var(--df-shell-accent);
}

/* The same action has dedicated vibrancy tokens on macOS and elevated button
   tokens in the web shell. Neither should inherit the former neutral slab. */
:root[data-fish-pace] [data-slot="sidebar.session.action"] {
  --dsw-alias-button-elevated-fill: var(--df-shell-raised);
  --dsw-specific-sidebar-glass-fill: var(--df-shell-raised);
  --dsw-alias-button-floating-hover: color-mix(in srgb, var(--df-shell-accent) 14%, var(--df-shell-raised));
  --dsw-specific-sidebar-glass-hover: var(--dsw-alias-button-floating-hover);
  --dsw-alias-border-l3: var(--df-shell-line);
}

/* Color the painted dock cells: their parent spans hidden/offscreen panes and holds
   fixed floating windows, so putting a backdrop filter on it would break docking. */
:root[data-fish-pace] [data-rightbar-col] {
  background: var(--df-shell-surface);
}
/* AppFrame gives the macOS/Windows centre column its own opaque backing.
   The selected painting lives behind all three columns. */
${sceneWindow} div:has(> [data-rightbar-col]) > div:has(+ [data-rightbar-col]) {
  background: transparent;
}
${sceneWindow} ${footer} {
  min-height: 8px;
  box-sizing: border-box;
  background: var(--df-shell-surface);
}
/* These two native triggers sit over the illustration and animated portrait.
   Their inset rim doesn't change the hit target or the measured popover anchor. */
${sceneWindow} ${heroChip} {
  --dsw-alias-label-primary: var(--df-shell-ink);
  --dsw-alias-label-caption: var(--df-shell-muted);
  color: var(--df-shell-ink);
  background: var(--df-shell-card-fill);
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px var(--df-shell-line), inset 0 1px 1px var(--df-shell-highlight);
  -webkit-backdrop-filter: var(--df-shell-filter, none);
  backdrop-filter: var(--df-shell-filter, none);
}
${sceneWindow} ${heroChip}:is(:hover:not(:disabled), [aria-expanded="true"]) {
  background: var(--df-shell-raised);
}
${sceneWindow} ${heroChip}:focus-visible {
  outline: 2px solid var(--df-shell-accent);
  outline-offset: 2px;
}
:root[data-fish-pace] ${dockCell},
:root[data-fish-pace] ${header} {
  background: var(--df-shell-film), var(--df-shell-chrome-fill);
  border-color: var(--df-shell-line);
}
/* Files paints its own opaque navigator, search bar and file list over the dock
   cell. Rebind only this first-party tool and the built-in start page. */
:root[data-fish-pace] [data-sidebar-right-panel] :is([data-files-page], [data-files-state], [data-sidebar-right-guide]) {
  --dsw-alias-bg-base: var(--df-shell-surface);
  --dsw-alias-bg-layer-1: var(--df-shell-raised);
  --dsw-alias-label-primary: var(--df-shell-ink);
  --dsw-alias-label-secondary: var(--df-shell-muted);
  --dsw-alias-border-l3: var(--df-shell-line);
  --dsw-alias-border-l4: var(--df-shell-line);
}
:root[data-fish-pace] [data-sidebar-right-panel] [data-dockkit-strip] {
  --dsw-alias-markdown-tag: color-mix(in srgb, var(--df-shell-accent) 14%, var(--df-shell-surface));
}
:root[data-fish-pace] :is([data-slot="sidebar"], [data-dockkit-strip], [data-slot="conversation.header"]) {
  --dsw-alias-label-primary: var(--df-shell-ink);
  --dsw-alias-label-secondary: var(--df-shell-muted);
}

/* A dense tinted face keeps the draft legible even without backdrop-filter.
   Filter only when a translucent face is actually requested and supported. */
:root[data-fish-pace] [data-composer-card] {
  --dsw-elevation-stroke-color: var(--df-shell-line);
  --dsw-alias-label-primary: var(--df-shell-ink);
  --dsw-alias-label-caption: var(--df-shell-muted);
  --df-card-edge: var(--df-shell-line);
  --df-card-halo: transparent;
  --df-card-focus: transparent;
  background: var(--df-shell-film), var(--df-shell-card-fill);
  color: var(--df-shell-ink);
  box-shadow: inset 0 0 0 1px var(--df-card-edge), inset 0 2px 2px -1px var(--df-shell-highlight),
    inset 0 -2px 3px -2px var(--df-glass-rim-shade), 0 0 0 3px var(--df-card-focus),
    0 2px 4px -2px var(--df-shell-shadow), 0 12px 28px -14px var(--df-shell-shadow), 0 10px 32px -10px var(--df-card-halo);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root[data-fish-pace]:not(.df-off-glass) body {
    --df-shell-chrome-fill: color-mix(in srgb, var(--df-shell-surface), transparent var(--df-glass-transparency, 22%));
    --df-shell-card-fill: color-mix(in srgb, var(--df-shell-raised), transparent var(--df-glass-transparency, 22%));
    --df-shell-filter: blur(var(--df-glass-blur, 24px)) saturate(var(--df-glass-saturation));
    --df-shell-backdrop-content: '';
    --df-shell-files-base: transparent;
    --df-shell-track-fill: radial-gradient(ellipse at 85% 0%, color-mix(in srgb, var(--df-shell-scene) 32%, var(--df-shell-surface)), var(--df-shell-surface) 85%);
  }
  :root[data-fish-pace]:not(.df-off-glass) [data-composer-card] {
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
  /* The host owns ::after for its dashed choose-workspace affordance. Only a
     regular composer gets the polished rim, with a cutout over its contents. */
  @supports (mask-composite: exclude) or (-webkit-mask-composite: xor) {
    :root[data-fish-pace]:not(.df-off-glass) [data-composer-card]:not(:has([data-composer-input][aria-haspopup="menu"]))::after {
      content: var(--df-shell-backdrop-content);
      position: absolute;
      inset: 0;
      padding: 1px;
      border-radius: inherit;
      pointer-events: none;
      background: radial-gradient(ellipse 22% 95% at var(--df-card-light-x, 24%) 0%, var(--df-glass-keylight), transparent),
        var(--df-glass-fresnel);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      mask-composite: exclude;
    }
  }
  /* Keep fixed caption buttons and floating DockKit panels anchored to the window.
     Only their paint layer receives a filter. Host drawer/float positioning wins. */
  @layer df-glass-anchors {
    :where(:root[data-fish-pace]:not(.df-off-glass)) :where(${sidebar}, ${header}, ${dockCell}, [data-composer-card]) { position: relative; }
  }
  :root[data-fish-pace]:not(.df-off-glass) [data-slot="sidebar"] > div {
    position: relative;
    background: transparent;
  }
  :root[data-fish-pace]:not(.df-off-glass) :is(${header}, ${dockCell}) {
    isolation: isolate;
  }
  :root[data-fish-pace]:not(.df-off-glass) :is(${sidebar}, ${header}, ${dockCell})::before {
    content: var(--df-shell-backdrop-content);
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
  :root[data-fish-pace]:not(.df-off-glass) :is(${header}, ${dockCell})::before {
    z-index: -1;
  }
  :root[data-fish-pace]:not(.df-off-glass) ${sidebar}::before {
    background-image: var(--df-shell-film);
    box-shadow: inset -1px 0 var(--df-shell-highlight);
  }
  :root[data-fish-pace]:not(.df-off-glass) ${header}::before {
    box-shadow: inset 0 1px var(--df-shell-highlight), inset 0 -1px var(--df-glass-rim-shade);
  }
  :root[data-fish-pace]:not(.df-off-glass) ${dockCell}::before {
    box-shadow: inset 1px 0 var(--df-shell-highlight);
  }
  /* DockKit paints its cells above the track. Give that material depth and let
     the native file navigator show the cell through, including in overlay mode. */
  :root[data-fish-pace]:not(.df-off-glass) [data-rightbar-col] {
    background: var(--df-shell-track-fill);
  }
  :root[data-fish-pace]:not(.df-off-glass) [data-sidebar-right-panel] :is([data-files-page], [data-files-state], [data-sidebar-right-guide]) {
    --dsw-alias-bg-base: var(--df-shell-files-base);
  }

  /* Keep one layer of glass between the user and the painting. Pigment and
     blur live on the same pseudo-element; an opaque track behind the pane
     or a painted column behind the blur would conceal the scene. */
  ${sceneGlass} body {
    --df-window-backing: transparent;
    --df-window-seat-shade: color-mix(in srgb, var(--df-shell-chrome-fill) 36%, transparent);
    --df-window-control-fill: color-mix(in srgb, var(--df-shell-raised) 62%, transparent);
  }
  ${sceneGlass} :is(${sidebar}, ${header}, ${dockCell}, [data-rightbar-col], ${footer}) {
    background: var(--df-window-backing);
  }
  ${sceneGlass} ${sidebar} {
    --dsw-specific-sidebar-fill: var(--df-window-backing);
  }
  ${sceneGlass} :is(${sidebar}, ${header}, ${dockCell}, ${footer})::before {
    background: var(--df-shell-film), var(--df-shell-chrome-fill);
  }
  ${sceneGlass} ${footer} {
    position: relative;
    isolation: isolate;
  }
  ${sceneGlass} ${footer}::before {
    content: var(--df-shell-backdrop-content);
    position: absolute;
    z-index: -1;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 1px var(--df-shell-highlight);
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
  ${sceneGlass}[data-windows-titlebar] div:has(> [data-rightbar-col])::before {
    background: var(--df-shell-film), var(--df-shell-chrome-fill);
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
  ${sceneGlass} [data-sidebar-right-guide] {
    --dsw-alias-bg-layer-1: var(--df-window-control-fill);
    --dsw-specific-guide-hero: var(--df-shell-muted);
  }
  /* The active sticky seat normally fades to the solid page colour, even in
     a chat with no history. Keep its scroll geometry and soften that fade.
     Put the statistics' own reading surface below the card, not behind it. */
  ${sceneGlass} [data-content-phase="active"] [data-composer-seat] {
    background: linear-gradient(180deg, transparent, var(--df-window-seat-shade) 36px);
  }
  ${sceneGlass} [data-content-phase="active"] [data-composer-dock]:has(button) {
    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    border-radius: 0 0 8px 8px;
    padding-inline: 8px;
    background: var(--df-window-backing);
  }
  ${sceneGlass} [data-content-phase="active"] [data-composer-dock]:has(button)::before {
    content: var(--df-shell-backdrop-content);
    position: absolute;
    z-index: -1;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: var(--df-shell-chrome-fill);
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  :root[data-fish-pace]:not(.df-off-glass,.df-off-cursor,.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused])
    [data-composer-card].fish-tilting {
    --df-card-light-x: var(--df-glass-light-x, 24%);
  }
}
:root[data-fish-pace]:not(.df-off-focusring) [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus) {
  --df-card-edge: var(--df-shell-accent);
  --df-card-focus: color-mix(in srgb, var(--df-shell-accent) 16%, transparent);
}
:root[data-fish-pace]:not(.df-off-fishglow) [data-composer-card]:focus-within {
  --df-card-halo: color-mix(in srgb, var(--df-shell-accent) 32%, transparent);
}
@media (prefers-reduced-motion: no-preference) {
  :root[data-fish-pace]:not(.df-off-glass,.df-off-focusring,.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused])
    [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus)::before {
    content: var(--df-shell-glint-content, '');
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 9%;
    width: 32%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--df-shell-accent) 34%, var(--df-shell-highlight) 55%, transparent);
    animation: df-focus-reflection 540ms cubic-bezier(.19,.72,.24,1) both;
  }
}
@keyframes df-focus-reflection {
  0% { opacity: 0; transform: translateX(0); }
  32% { opacity: 1; }
  100% { opacity: 0; transform: translateX(145%); }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  :root[data-fish-pace] body,
  :root[data-fish-pace]:not(.df-off-glass) body {
    --df-shell-card-fill: var(--df-shell-raised);
    --df-shell-chrome-fill: var(--df-shell-surface);
    --df-shell-files-base: var(--df-shell-surface);
    --df-shell-track-fill: var(--df-shell-surface);
    --df-shell-filter: none;
    --df-shell-backdrop-content: none;
    --df-shell-glint-content: none;
    --df-shell-film: none;
    --df-glass-keylight: transparent;
    --df-glass-rim-light: transparent;
    --df-glass-rim-shade: transparent;
    --df-glass-fresnel: none;
  }
  :root[data-fish-pace] div:has(> [data-slot="sidebar"]),
  :root[data-fish-pace][data-platform="darwin"] div:has(> [data-slot="sidebar"]) {
    background: var(--df-shell-surface);
  }
  ${sceneGlass} body {
    --df-window-backing: var(--df-shell-surface);
    --df-window-seat-shade: var(--df-shell-surface);
    --df-window-control-fill: var(--df-shell-raised);
  }
}
@media (forced-colors: active) {
  :root[data-fish-pace] [data-composer-card]:focus-within {
    outline: 2px solid Highlight;
    outline-offset: 1px;
  }
}
`
