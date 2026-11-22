// Keep the artwork on native seats. Moving a row, panel or button changes the
// geometry of its drag region, sticky header or stretched click target in Harness.
const root = ':root[data-fish-pace]'
const glass = `${root}:not(.df-off-glass)`
const moving = `${root}:not(.df-off-fishmotion,[data-fish-pace="still"],[data-fish-paused])`
const selection = '[data-slot="sidebar"] :is([role="treeitem"][aria-selected="true"], div:has(> button[aria-current="page"]))'
const activeTab = ':is([data-conversation-tabs] > [role="tab"], [data-dockkit-tab]:not([data-dockkit-tab-quiet]))[aria-selected="true"]'
// Daylight gives the picker inside the terminal row its own compact surface.
const guideCard = '[data-sidebar-right-guide] :is([data-sidebar-right-guide-entry], button[aria-haspopup="menu"]:not(:where(body:not([data-ds-dark-theme]) [data-sidebar-right-guide-entry] button)))'
const daylight = `${glass} body:not([data-ds-dark-theme])`
const shellPicker = '[data-sidebar-right-guide-entry="terminal"] button[aria-haspopup="menu"]'
const compass = '[data-sidebar-right-guide] > span[aria-hidden="true"]:first-child'
const catalogRow = '[data-plugin-panel] :is(li[data-plugin-item], li[data-plugin-package])'
const arriving = `${moving}[data-df-arrival]:not(.df-off-glass)`
const leftRail = 'div:has(> [data-slot="sidebar"])'
const titleBar = 'header[data-window-drag]:has(> [data-conversation-header-leading])'
const dockGlass = '[data-sidebar-right-panel] :is([data-dockkit-pane], [data-dockkit-empty], [data-dockkit-float])'
const bottomBar = '[data-shell-bottom]'

export const workbenchFinishCss = `
/* Only the glass pigment animates. The standard rim, blur, fill and pointer
   behavior live on the shell's existing ::before layers. */
@property --df-arrival-rim {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}
@media (prefers-reduced-motion: no-preference) and (prefers-reduced-transparency: no-preference)
    and (prefers-contrast: no-preference) and (forced-colors: none) {
  ${arriving} body {
    --df-arrival-base-film: var(--df-shell-film);
    --df-arrival-light: color-mix(in srgb, var(--df-shell-accent) 48%, var(--df-shell-scene));
    --df-arrival-level: 18%;
  }
  ${arriving} body[data-ds-dark-theme] {
    --df-arrival-light: color-mix(in srgb, var(--df-shell-scene) 68%, #f5faff);
  }
  ${arriving}[data-df-arrival="illuminate"] body { --df-arrival-level: 83%; }
  ${arriving}[data-df-arrival="settle"] body { --df-arrival-level: 0%; }

  ${arriving} ${titleBar}::before,
  ${arriving}[data-windows-titlebar] div:has(> [data-rightbar-col])::before {
    --df-arrival-source: 58% 100%;
    --df-arrival-line-size: 55% 2px;
    --df-arrival-pool-size: 51% 23px;
  }
  ${arriving} ${leftRail}::before {
    --df-arrival-source: 100% 34%;
    --df-arrival-line-size: 2px 55%;
    --df-arrival-pool-size: 64px 57%;
    --df-arrival-delay: 65ms;
  }
  ${arriving} ${dockGlass}::before {
    --df-arrival-source: 0% 43%;
    --df-arrival-line-size: 2px 55%;
    --df-arrival-pool-size: 64px 57%;
    --df-arrival-delay: 100ms;
  }
  ${arriving} ${bottomBar}::before {
    --df-arrival-source: 42% 0%;
    --df-arrival-line-size: 54% 2px;
    --df-arrival-pool-size: 52% 22px;
    --df-arrival-delay: 135ms;
  }
  ${arriving} :is(${leftRail}, ${titleBar}, ${dockGlass}, ${bottomBar})::before,
  ${arriving}[data-windows-titlebar] div:has(> [data-rightbar-col])::before {
    --df-arrival-rim: color-mix(in srgb, var(--df-arrival-light) var(--df-arrival-level), transparent);
    --df-shell-film:
      radial-gradient(ellipse var(--df-arrival-line-size) at var(--df-arrival-source), var(--df-arrival-rim), transparent),
      radial-gradient(ellipse var(--df-arrival-pool-size) at var(--df-arrival-source),
        color-mix(in srgb, var(--df-arrival-rim) 24%, transparent), transparent),
      var(--df-arrival-base-film);
    transition: --df-arrival-rim 620ms cubic-bezier(.22,.68,.3,1) var(--df-arrival-delay, 0ms);
  }
}
@media not (forced-colors: active) {
  ${root} body {
    --df-wb-light: color-mix(in srgb, var(--df-shell-accent) 68%, var(--df-shell-scene));
    --df-wb-ink: color-mix(in srgb, var(--df-shell-accent) 36%, var(--df-shell-ink));
    --df-wb-hairline: color-mix(in srgb, var(--df-shell-line) 58%, transparent);
    --df-wb-rim: inset 0 1px 0 var(--df-shell-highlight), inset 0 0 0 1px var(--df-wb-hairline);
    --df-wb-selection: color-mix(in srgb, var(--df-shell-accent) 9%, var(--df-shell-surface));
  }

  ${glass} ${selection} {
    color: var(--df-shell-ink);
    background:
      linear-gradient(to bottom, transparent, var(--df-wb-light) 24% 76%, transparent) 2px center / 2px 78% no-repeat,
      var(--df-wb-selection);
    box-shadow: none;
  }
  ${glass} ${activeTab} {
    color: var(--df-wb-ink);
    background: linear-gradient(to right, transparent, var(--df-wb-light) 30% 70%, transparent)
      center bottom / 72% 2px no-repeat, var(--df-wb-selection);
    box-shadow: var(--df-wb-rim);
  }
  /* Active split panes share a canvas. Mark the working pane on its own
     strip so focus is visible even while both panes show the same tool. */
  ${glass} [data-dockkit-pane][data-dockkit-pane-active] > [data-dockkit-strip] {
    background-image: linear-gradient(to right, var(--df-wb-light), transparent);
    background-size: 45% 1px;
    background-position: left bottom;
    background-repeat: no-repeat;
  }

  /* Chat content keeps its native width, ordering and height. The speaker's
     bubble and the disclosure icon identify two different parts of a turn. */
  ${glass} [data-conversation-content] [data-message-bubble] {
    background: linear-gradient(115deg, color-mix(in srgb, var(--df-wb-light) 9%, transparent), transparent 72%),
      color-mix(in srgb, var(--df-shell-raised) 90%, var(--df-shell-accent));
    color: var(--df-shell-ink);
    box-shadow: var(--df-wb-rim), 0 5px 14px -10px var(--df-shell-shadow);
  }
  ${root}:not(.df-off-reading) [data-step-process] [data-step-process-icon] {
    color: var(--df-wb-ink);
  }
  ${root}:not(.df-off-reading) [data-step-process] [data-process-activity][aria-expanded="true"] {
    color: var(--df-shell-ink);
  }

  /* The native guide already owns a compass. Etch a scale around that glyph;
     its single, noninteractive ring uses the host's existing free margin. */
  ${glass} ${compass} { position: relative; color: var(--df-wb-ink); }
  ${glass} ${compass}::before {
    content: '';
    position: absolute;
    pointer-events: none;
    inset: -6px;
    border-radius: 50%;
    background:
      conic-gradient(from -1deg, var(--df-wb-light) 0 2deg, transparent 2deg 90deg,
        var(--df-wb-light) 90deg 92deg, transparent 92deg 180deg,
        var(--df-wb-light) 180deg 182deg, transparent 182deg 270deg,
        var(--df-wb-light) 270deg 272deg, transparent 272deg),
      repeating-conic-gradient(from -0.5deg, var(--df-wb-hairline) 0 1deg, transparent 1deg 15deg);
    mask-image: radial-gradient(circle closest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
    box-shadow: inset 0 0 0 1px var(--df-wb-hairline);
  }
  ${glass} ${guideCard} {
    color: var(--df-shell-ink);
    border-color: transparent;
    background: linear-gradient(var(--df-wb-hairline), var(--df-wb-hairline))
      right 14px bottom / calc(100% - 68px) 1px no-repeat;
    box-shadow: none;
  }
  ${glass} ${guideCard} > span:first-child {
    border-radius: 6px;
    background-color: color-mix(in srgb, var(--df-shell-raised) 52%, transparent);
    box-shadow: none;
  }

  /* One sheet per section instead of a stack of glass filters. Neither the
     list nor its descendants establish a new containing or stacking block. */
  ${glass} [data-plugin-panel] ul:has(> li:is([data-plugin-item], [data-plugin-package])) {
    border-radius: var(--dsw-radius-xl, 12px);
    background: linear-gradient(110deg, color-mix(in srgb, var(--df-shell-raised) 58%, transparent),
      color-mix(in srgb, var(--df-shell-raised) 22%, transparent));
    box-shadow: var(--df-wb-rim);
  }
  ${glass} ${catalogRow}:not(:last-child) {
    background-image: linear-gradient(to right, var(--df-wb-hairline), transparent);
    background-size: calc(100% - 80px) 1px;
    background-repeat: no-repeat;
    background-position: right 8px bottom;
  }
  ${root}:not(.df-off-focusring) :is([data-plugin-panel], [data-slot="sidebar"], [data-sidebar-right-guide],
      [data-conversation-tabs], [data-dockkit-strip]) { --dsw-focus-ring-color: var(--df-wb-ink); }
  ${root}:not(.df-off-focusring) :is([data-sidebar-right-guide-entry], [data-dockkit-tab],
      [data-conversation-tabs] > [role="tab"]):focus-visible {
    outline: 2px solid var(--df-wb-ink);
    outline-offset: -2px;
  }
}

/* The terminal row delegates almost its whole area to a stretched start
   button. Enlarge the separate shell picker within the row's existing space. */
${daylight} ${shellPicker} {
  inline-size: 28px;
  block-size: 28px;
  min-inline-size: 28px;
  min-block-size: 28px;
  margin-block: -4px;
  border-radius: 7px;
}
@media (forced-colors: none) and (prefers-contrast: no-preference) and (prefers-reduced-transparency: no-preference) {
  ${daylight} ${selection} {
    --df-wb-light: var(--df-wb-ink);
    background-color: color-mix(in srgb, var(--df-shell-accent) 12%, var(--df-shell-surface));
  }
  ${daylight} ${shellPicker} {
    color: var(--df-wb-ink);
    background: color-mix(in srgb, var(--df-shell-accent) 8%, var(--df-shell-surface));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--df-wb-ink) 24%, transparent);
  }
  ${daylight} ${shellPicker}[aria-expanded="true"] {
    background: color-mix(in srgb, var(--df-shell-accent) 18%, var(--df-shell-raised));
    box-shadow: inset 0 0 0 1px var(--df-wb-ink);
  }
  @media (hover: hover) and (pointer: fine) {
    ${daylight} ${shellPicker}:hover:not([aria-expanded="true"]) {
      background: color-mix(in srgb, var(--df-shell-accent) 14%, var(--df-shell-raised));
    }
  }
}
@media (forced-colors: none) {
  ${glass}:not(.df-off-focusring) body:not([data-ds-dark-theme])
    :is([data-sidebar-right-guide] button, [data-slot="sidebar"] [role="treeitem"],
        [data-slot="sidebar"] button[aria-current]):focus-visible {
    outline: 2px solid var(--df-wb-ink);
    outline-offset: -2px;
  }
}

@media (hover: hover) and (pointer: fine) and (forced-colors: none) {
  ${glass} ${guideCard}:hover {
    border-color: var(--df-wb-hairline);
    background: color-mix(in srgb, var(--df-wb-selection) 76%, transparent);
  }
  ${glass} ${catalogRow}:hover {
    background-color: color-mix(in srgb, var(--df-shell-accent) 11%, var(--df-shell-raised));
  }
}

@media (prefers-reduced-motion: no-preference) and (forced-colors: none) and (prefers-contrast: no-preference) {
  ${moving}:not(.df-off-glass) ${selection} { animation: df-workbench-select 210ms ease-out; }
  ${moving}:not(.df-off-glass) ${activeTab} { animation: df-workbench-tab 180ms ease-out; }
  ${moving}:not(.df-off-glass) ${compass}::before { animation: df-workbench-orient 360ms cubic-bezier(.2,.72,.22,1); }
  /* The host mounts its detail header on navigation. Animate only the ink
     of the heading; its clickable crumb, content, and embedded views stay put. */
  ${moving} [data-plugin-panel] :is([data-plugin-item-detail], [data-plugin-detail]) > div > div > h3:first-child {
    animation: df-workbench-title 200ms ease-out;
  }
  ${moving}:not(.df-off-glass) ${guideCard} { transition: border-color 150ms ease, background-color 150ms ease; }
}
@keyframes df-workbench-select {
  from { background-size: 2px 12%; }
  to { background-size: 2px 78%; }
}
@keyframes df-workbench-tab {
  from { background-size: 12% 2px, auto; }
  to { background-size: 72% 2px, auto; }
}
@keyframes df-workbench-orient {
  from { opacity: .3; transform: rotate(-14deg); }
  to { opacity: 1; transform: rotate(0); }
}
@keyframes df-workbench-title {
  from { color: var(--df-wb-ink); }
  to { color: var(--df-shell-ink); }
}
@media (prefers-contrast: more) and (forced-colors: none),
       (prefers-reduced-transparency: reduce) and (forced-colors: none) {
  ${glass} ${selection}, ${glass} ${activeTab}, ${glass} ${guideCard},
  ${glass} [data-conversation-content] [data-message-bubble],
  ${glass} [data-plugin-panel] ul:has(> li:is([data-plugin-item], [data-plugin-package])) {
    background: var(--df-shell-raised);
    box-shadow: inset 0 0 0 1px var(--df-shell-line);
  }
  ${glass} ${selection}, ${glass} ${activeTab} { box-shadow: inset 3px 0 var(--df-wb-ink); }
  ${glass} ${guideCard}:hover { background: var(--df-shell-raised); }
  ${glass} [data-dockkit-pane][data-dockkit-pane-active] > [data-dockkit-strip] { background-image: none; }
  ${glass} ${compass}::before { content: none; }
}
`
