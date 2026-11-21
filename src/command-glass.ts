// Harness mounts the slash / reference picker and its searchable command
// dialogs in the same composer slot. Style the floating surface itself so
// keyboard selection, scrolling and the composer's zero-height anchor stay native.
const overlay = '[data-composer-overlay]'
const menu = ':is([data-trigger-menu], [aria-label]:has(> input[type="text"]))'
const panel = `${overlay} ${menu}`

export const commandGlassCss = `
body {
  --df-command-paper: var(--df-shell-raised, #f3f6fc);
  --df-command-ink: var(--df-shell-ink, #182337);
  --df-command-muted: var(--df-shell-muted, #4a586d);
  --df-command-edge: var(--df-shell-line, #bdc9d9);
  --df-command-lift: rgb(18 32 61 / 17%);
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
  box-shadow: inset 0 1px rgb(255 255 255 / 10%), 0 8px 24px -7px var(--df-command-lift);
}
${panel}:dir(rtl) { --df-command-indicator: -2px; }

/* Keep at least 98% ink-blocking pigment. Text remains readable even when
   a nested compositor has no backdrop available to sample. */
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root:not(.df-off-glass) ${panel} {
    background:
      linear-gradient(155deg, color-mix(in srgb, var(--df-command-accent) 4%, transparent), transparent 55%),
      color-mix(in srgb, var(--df-command-paper) 98%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(110%);
    backdrop-filter: blur(20px) saturate(110%);
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
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  :root:not(.df-off-glass) ${panel} {
    background: var(--df-command-paper);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (forced-colors: active) {
  ${panel} { border-color: CanvasText; }
  ${panel} [role="option"][aria-selected="true"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
`
