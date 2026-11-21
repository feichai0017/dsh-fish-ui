// The Studio sits both in the sidebar sheet and in Harness' plugin preferences.
// Keep layout decisions on the Studio container so either entry can be narrow.
export const studioFinishCss = `
.fish-studio, .df-sheet-panel {
  --fish-panel: var(--df-shell-surface, var(--dsw-alias-bg-base, #f4f6fa));
  --fish-label: var(--df-shell-ink, var(--dsw-alias-label-primary, #20283b));
  --fish-muted: var(--df-shell-muted, var(--dsw-alias-label-secondary, #4c586e));
  --fish-edge: var(--df-shell-line, color-mix(in srgb, var(--fish-label) 18%, var(--fish-panel)));
  --fish-well: color-mix(in srgb, var(--df-shell-raised, var(--fish-panel)) 94%, var(--fish-label));
  --fish-selected: color-mix(in srgb, var(--df-accent, #4d6bfe) 14%, var(--fish-panel));
}
.df-sheet-panel .df-sheet-head {
  background: var(--df-shell-raised, var(--fish-panel));
  border-color: var(--fish-edge);
}
/* One floating sheet. Its title bar and grouped rows use thin fills, leaving
   the backdrop blur to the sheet's outer surface. Keep extra pigment under text. */
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root:not(.df-off-glass) .df-sheet-scrim {
    background: color-mix(in srgb, var(--df-shell-depth, #172036) 22%, transparent);
  }
  :root:not(.df-off-glass) .df-sheet-panel {
    background: var(--df-shell-film, none),
      color-mix(in srgb, var(--fish-panel), transparent calc(var(--df-glass-transparency, 22%) * .68));
    border-color: var(--fish-edge);
    box-shadow: var(--df-command-lift-shadow);
    -webkit-backdrop-filter: var(--df-shell-filter);
    backdrop-filter: var(--df-shell-filter);
  }
  :root:not(.df-off-glass) .df-sheet-head {
    background: color-mix(in srgb, var(--df-shell-raised, var(--fish-panel)) 38%, transparent);
  }
  :root:not(.df-off-glass) .df-sheet-close {
    background: color-mix(in srgb, var(--fish-label) 5%, transparent);
  }
  :root:not(.df-off-glass) .df-sheet-close:hover {
    background: color-mix(in srgb, var(--fish-label) 12%, transparent);
  }
  :root:not(.df-off-glass) .df-sheet-panel :is(.fish-tabs, .fish-controls, .df-glass-controls) {
    background: color-mix(in srgb, var(--df-shell-raised, var(--fish-panel)) 66%, transparent);
  }
}
html:is([data-fish-pace="still"], .df-off-fishmotion) .df-sheet-panel { animation: none; }
.fish-studio .fish-cover {
  height: clamp(136px, 30cqi, 190px);
  border-radius: 14px;
}
.fish-studio:has(.fish-details) .fish-cover { height: clamp(88px, 20cqi, 126px); }
.fish-cover::after {
  background: linear-gradient(90deg, rgb(5 12 25 / .80), rgb(9 20 36 / .38) 50%, transparent 83%),
    linear-gradient(0deg, rgb(5 12 22 / .56), transparent 58%);
  box-shadow: inset 0 0 0 1px rgb(236 242 255 / .19);
  border-radius: inherit;
}
.fish-cover-copy { inset-inline: clamp(14px, 4cqi, 24px); bottom: clamp(12px, 3cqi, 21px); }
.fish-cover h2 { font-size: clamp(25px, 6.4cqi, 43px); line-height: 1.08; }
.fish-cover p { margin-top: 6px; line-height: 1.3; }
.fish-swatches { right: 13px; bottom: 14px; border-color: rgb(255 255 255 / .44); border-radius: 10px; }
.fish-swatches i { width: 9px; height: 6px; }
.fish-tabs {
  display: inline-flex; flex-wrap: wrap; gap: 2px; max-width: 100%;
  margin: 12px 0; padding: 3px; border: 1px solid var(--fish-edge); border-radius: 10px;
  background: var(--fish-panel);
}
.fish-tabs button { min-height: 30px; padding: 4px 10px; border-radius: 7px; }
.fish-tabs button[aria-pressed="true"] {
  background: var(--fish-selected); color: var(--fish-label);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--df-accent) 35%, transparent);
}
.fish-tabs button[aria-pressed="true"] svg { color: var(--df-accent); }
.fish-tabs button[aria-pressed="true"]::after { content: none; }

.fish-scene-grid { gap: 8px; }
.fish-scene-card {
  display: grid; isolation: isolate; padding: 0; border-radius: 10px; background: #17243b;
}
.fish-card-art, .fish-card-label { grid-area: 1 / 1; }
.fish-card-art { width: 100%; min-height: 74px; aspect-ratio: 1.95; border-radius: 0; }
.fish-card-art::after {
  content: ''; position: absolute; pointer-events: none; inset: 0;
  background: linear-gradient(0deg, rgb(5 10 23 / .88), rgb(8 18 32 / .64) 24%, transparent 62%);
}
.fish-card-label {
  position: relative; align-self: end; min-height: 30px; padding: 3px 8px 6px;
  color: #fff; font-size: 12px; letter-spacing: .005em; text-shadow: 0 1px 3px rgb(0 0 0 / .7);
}
.fish-scene-card .fish-card-label svg,
.fish-scene-card:has(input:checked) .fish-card-label svg { color: #e8f1ff; }
.fish-picked { z-index: 1; color: #172945; background: #f5f8ff; box-shadow: 0 1px 5px rgb(5 10 20 / .26); }
.fish-scene-card:has(input:checked) {
  box-shadow: 0 0 0 1px var(--df-accent); border-color: var(--df-accent);
}
.fish-details .df-set-group-title {
  color: var(--fish-muted); margin: 16px 0 4px; letter-spacing: .07em; font-size: 10px;
}
.fish-details .df-set-group:first-child .df-set-group-title { margin-top: 2px; }
.fish-details .df-set-row { padding-block: 8px; }
.fish-studio .df-glass-controls { background: var(--df-shell-raised, var(--fish-panel)); }
.fish-studio .fish-controls { background: var(--df-shell-raised, var(--fish-panel)); }
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  html:not(.df-off-fishmotion,[data-fish-pace="still"]) .fish-card-art > svg { transition: transform 200ms ease-out; }
  html:not(.df-off-fishmotion,[data-fish-pace="still"]) .fish-scene-card:not(:has(:disabled)):hover .fish-card-art > svg { transform: scale(1.045); }
}
@container (max-width: 390px) {
  .fish-studio .fish-cover { height: 124px; }
  .fish-studio:has(.fish-details) .fish-cover { height: 92px; }
  .fish-card-art { aspect-ratio: 2.12; }
  .fish-tabs { margin-block: 9px; }
}
@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active) {
  :root:not(.df-off-glass) .df-sheet-panel {
    background: var(--fish-panel); -webkit-backdrop-filter: none; backdrop-filter: none;
    box-shadow: 0 4px 12px -4px var(--df-command-lift);
  }
  :root:not(.df-off-glass) .df-sheet-head,
  :root:not(.df-off-glass) .df-sheet-panel :is(.fish-tabs, .fish-controls, .df-glass-controls) {
    background: var(--df-shell-raised, var(--fish-panel));
  }
}
@media (forced-colors: active) {
  :root:not(.df-off-glass) .df-sheet-panel { background: Canvas; border-color: CanvasText; box-shadow: none; }
  .fish-card-label { color: CanvasText; background: Canvas; text-shadow: none; }
  .fish-scene-card .fish-card-label svg, .fish-scene-card:has(input:checked) .fish-card-label svg { color: CanvasText; }
  .fish-scene-card:has(input:checked), .fish-tabs button[aria-pressed="true"] { outline: 2px solid Highlight; outline-offset: -2px; }
}
`
