// Harness mounts the slash / reference picker and its searchable command
// dialogs in the same composer slot. Style the floating surface itself so
// keyboard selection, scrolling and the composer's zero-height anchor stay native.
const overlay = '[data-composer-overlay]'
const menu = ':is([data-trigger-menu], [aria-label]:has(> input[type="text"]))'
const panel = `${overlay} ${menu}`
const floatingMenus = `:is(${panel}, [role="menu"]:has(.df-ms-hero))`

export const commandGlassCss = `
body {
  --df-command-paper: var(--df-shell-raised, #f3f6fc);
  --df-command-ink: var(--df-shell-ink, #182337);
  --df-command-muted: var(--df-shell-muted, #4a586d);
  --df-command-edge: var(--df-shell-line, #bdc9d9);
  --df-command-lift: rgb(18 32 61 / 17%);
  --df-command-film: linear-gradient(148deg, color-mix(in srgb, var(--df-glass-keylight, white) 11%, transparent), transparent 34%),
    linear-gradient(20deg, transparent 60%, color-mix(in srgb, var(--df-shell-scene, #9cbfff) 6%, transparent));
  --df-command-lift-shadow: inset 0 1px var(--df-glass-keylight, rgb(255 255 255 / .6)),
    inset 1px 0 var(--df-glass-rim-light, rgb(255 255 255 / .18)),
    inset 0 -1px var(--df-glass-rim-shade, rgb(14 22 38 / .12)),
    0 2px 5px -2px var(--df-command-lift), 0 13px 32px -10px var(--df-command-lift);
}
body[data-ds-dark-theme] {
  --df-command-paper: var(--df-shell-raised, #202a3b);
  --df-command-ink: var(--df-shell-ink, #f3f6fc);
  --df-command-muted: var(--df-shell-muted, #bcc8db);
  --df-command-edge: var(--df-shell-line, #47556d);
  --df-command-lift: rgb(3 8 18 / 44%);
}
${panel} {
  --df-command-accent: var(--df-shell-accent, var(--df-accent, #4d6bfe));
  --dsw-alias-label-primary: var(--df-command-ink);
  --dsw-alias-label-secondary: var(--df-command-muted);
  --dsw-alias-label-tertiary: var(--df-command-muted);
  --dsw-alias-label-caption: var(--df-command-muted);
  --dsw-alias-menu-icon: var(--df-command-ink);
  --dsw-specific-menu: var(--df-command-paper);
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, var(--df-command-accent) 12%, var(--df-command-paper));
  --df-command-indicator: 2px;
  isolation: isolate;
  color: var(--df-command-ink);
  background: var(--df-command-paper);
  border: 1px solid var(--df-command-edge);
  border-radius: var(--dsw-radius-lg, 14px);
  box-shadow: 0 8px 24px -7px var(--df-command-lift);
}
${panel}:dir(rtl) { --df-command-indicator: -2px; }

/* Menu material has its own controls. Its default keeps 98% pigment, even
   when the composer behind it has been set to clear glass. */
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root:not(.df-off-glass) ${floatingMenus} {
    background: var(--df-command-film),
      color-mix(in srgb, var(--df-command-paper), transparent var(--df-menu-transparency, 2%));
    -webkit-backdrop-filter: blur(var(--df-menu-blur, 20px)) saturate(var(--df-glass-saturation, 1.26));
    backdrop-filter: blur(var(--df-menu-blur, 20px)) saturate(var(--df-glass-saturation, 1.26));
    border: 1px solid var(--df-command-edge);
    box-shadow: var(--df-command-lift-shadow);
  }
}
${panel} [role="presentation"] {
  color: var(--df-command-muted);
  font-weight: 600;
}
${panel} [role="option"][aria-selected="true"] {
  color: var(--df-command-ink);
  background: var(--dsw-alias-interactive-bg-hover);
  box-shadow: inset var(--df-command-indicator) 0 var(--df-command-accent);
}
:root ${panel} button:hover { transform: none; }
/* The native material fades all its children on enter; paint the labels
   immediately and move the panel as a unit. */
${panel}[data-menu-phase="enter"] > * { animation: none; }
@keyframes df-command-settle {
  from { translate: 0 3px; }
  to { translate: 0 0; }
}
@media (prefers-reduced-motion: no-preference) {
  :root:not(.df-off-fishmotion):not([data-fish-pace="still"]) ${panel} {
    animation: df-command-settle 145ms cubic-bezier(.22,.72,.24,1);
  }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  :root:not(.df-off-glass) ${floatingMenus} {
    background: var(--df-command-paper);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: 0 4px 12px -4px var(--df-command-lift);
  }
}
@media (forced-colors: active) {
  :root:not(.df-off-glass) ${floatingMenus}, ${panel} {
    background: Canvas; color: CanvasText; border-color: CanvasText; box-shadow: none;
  }
  ${panel} [role="option"][aria-selected="true"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
`
