// These surfaces sit outside the conversation artwork. Tint their paint with the same
// scene swatches without changing window drag, DockKit stacking, or editor geometry.
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
  --df-shell-reflection: rgb(255 255 255 / .78);
  --df-shell-highlight: var(--df-shell-reflection);
  --df-shell-shadow: rgb(31 44 70 / .12);
  --df-shell-film: linear-gradient(155deg, color-mix(in srgb, var(--df-shell-scene) 10%, transparent), transparent 45%);
  --df-shell-card-fill: var(--df-shell-raised);
}
:root[data-fish-pace] body[data-ds-dark-theme] {
  --df-shell-surface: color-mix(in srgb, var(--df-shell-depth) 33%, #171c29);
  --df-shell-raised: color-mix(in srgb, var(--df-shell-scene) 8%, var(--df-shell-surface));
  --df-shell-line: color-mix(in srgb, var(--df-shell-scene) 23%, var(--df-shell-surface));
  --df-shell-ink: #f0f3fd;
  --df-shell-muted: #bbc6d9;
  --df-shell-reflection: rgb(232 240 255 / .16);
  --df-shell-shadow: rgb(4 9 20 / .36);
}
:root[data-fish-pace].df-off-aurora body {
  --df-shell-scene: #a4aeba;
  --df-shell-depth: #374250;
}

/* A matte finish retains the palette but removes the rim highlight and surface wash. */
:root[data-fish-pace].df-off-glass body {
  --df-shell-film: none;
  --df-shell-highlight: transparent;
}

/* The sidebar column paints macOS vibrancy under a transparent sidebar root. Set its
   native tokens locally, including the Windows caption row's own paint. */
:root[data-fish-pace] div:has(> [data-slot="sidebar"]) {
  --dsw-specific-sidebar-fill: var(--df-shell-surface);
  --dsw-specific-sidebar-tint: var(--df-shell-surface);
  --dsw-specific-sidebar-wash-top: color-mix(in srgb, var(--df-shell-scene) 11%, transparent);
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
:root[data-fish-pace] [data-sidebar-right-panel] :is([data-dockkit-pane], [data-dockkit-empty], [data-dockkit-float]),
:root[data-fish-pace] header[data-window-drag]:has(> [data-conversation-header-leading]) {
  background: var(--df-shell-film), var(--df-shell-surface);
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
  box-shadow: inset 0 0 0 1px var(--df-card-edge), inset 0 2px 0 var(--df-shell-highlight),
    0 0 0 3px var(--df-card-focus), 0 4px 16px -8px var(--df-shell-shadow), 0 10px 32px -10px var(--df-card-halo);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root[data-fish-pace]:not(.df-off-glass) [data-composer-card] {
    --df-shell-card-fill: color-mix(in srgb, var(--df-shell-raised) 94%, transparent);
    -webkit-backdrop-filter: blur(18px) saturate(1.12);
    backdrop-filter: blur(18px) saturate(1.12);
  }
}
:root[data-fish-pace]:not(.df-off-focusring) [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus) {
  --df-card-edge: var(--df-shell-accent);
  --df-card-focus: color-mix(in srgb, var(--df-shell-accent) 16%, transparent);
}
:root[data-fish-pace]:not(.df-off-fishglow) [data-composer-card]:focus-within {
  --df-card-halo: color-mix(in srgb, var(--df-shell-accent) 32%, transparent);
}
@media (prefers-reduced-motion: no-preference) and (not (prefers-reduced-transparency: reduce)) {
  :root[data-fish-pace]:not(.df-off-glass,.df-off-focusring,.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused])
    [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus)::before {
    content: '';
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
@media (prefers-reduced-transparency: reduce) {
  :root[data-fish-pace] body {
    --df-shell-film: none;
    --df-shell-highlight: transparent;
  }
  :root[data-fish-pace]:not(.df-off-glass) [data-composer-card] {
    --df-shell-card-fill: var(--df-shell-raised);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  :root[data-fish-pace] div:has(> [data-slot="sidebar"]),
  :root[data-fish-pace][data-platform="darwin"] div:has(> [data-slot="sidebar"]) {
    background: var(--df-shell-surface);
  }
}
`
