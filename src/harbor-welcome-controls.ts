const glass = ':root[data-fish-pace]:not(.df-off-glass)'
const moving = glass + ':not(.df-off-fishmotion, [data-fish-pace="still"], [data-fish-paused])'
const welcome = 'body:has(.dwe-frame[data-df-welcome="true"]:not([hidden] *))'
const guide = '[data-sidebar-right-guide]'
// The terminal puts a stretched button before its glyph. More lives inside a menu anchor.
const entry = `${guide} :is([data-sidebar-right-guide-entry], ${guide} > span > button[aria-haspopup="menu"])`
const lens = '> span:first-of-type:has(> svg)'
const card = '.dwe-frame[data-df-welcome="true"] [data-composer-card]'
const editorFocus = ':has(:is([contenteditable="true"], textarea):focus)'

export const harborWelcomeControlsCss = `
@media (forced-colors: none) and (prefers-contrast: no-preference) and (prefers-reduced-transparency: no-preference) {
  ${glass} ${welcome} {
    --df-harbor-light: color-mix(in srgb, var(--df-shell-accent) 34%, #37bcd6);
    --df-harbor-ink: color-mix(in srgb, var(--df-shell-accent) 40%, #063a64);
    --df-harbor-enamel: #d5e9f3;
  }
  ${glass} ${welcome}[data-ds-dark-theme] {
    --df-harbor-ink: #d3edff;
    --df-harbor-enamel: #1c3b55;
  }
  ${glass} ${welcome} ${entry} ${lens} {
    position: relative;
    isolation: isolate;
    color: var(--df-harbor-ink);
    background: none;
  }
  ${glass} ${welcome} ${entry} ${lens}::before,
  ${glass} ${welcome} ${entry} ${lens}::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 9px;
    pointer-events: none;
  }
  ${glass} ${welcome} ${entry} ${lens}::before {
    z-index: -1;
    background:
      radial-gradient(ellipse at 4% -25%, rgb(255 255 255 / .72), transparent 58%),
      linear-gradient(148deg, var(--df-harbor-enamel) 32%,
        color-mix(in srgb, var(--df-harbor-enamel) 72%, var(--df-harbor-light)) 82%, var(--df-harbor-enamel));
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .67),
      inset 0 0 0 1px color-mix(in srgb, var(--df-harbor-light) 33%, transparent),
      0 2px 3px -2px rgb(4 35 69 / .35);
  }
  ${glass}:not(.df-off-focusring) ${card}${editorFocus} {
    --df-card-edge: color-mix(in srgb, var(--df-shell-accent) 68%, var(--df-harbor-light));
    --df-glass-fresnel: linear-gradient(115deg, var(--df-shell-highlight), var(--df-harbor-light) 18%,
      transparent 45% 69%, var(--df-shell-accent) 90%, var(--df-shell-highlight));
  }

  @media (prefers-reduced-motion: no-preference) {
    ${moving} ${welcome} ${entry} ${lens}::after {
      opacity: 0;
      background: linear-gradient(117deg, transparent 40%, rgb(203 241 255 / .72) 49%,
        rgb(255 255 255 / .84) 51%, transparent 60%) 100% 50% / 320% 100% no-repeat;
    }
    ${moving} ${welcome} ${entry}:is(:focus-visible, :has(> button:focus-visible)) ${lens}::after {
      animation: df-harbor-lens 560ms ease-out;
    }
    @media (hover: hover) and (pointer: fine) {
      ${moving} ${welcome} ${entry}:hover ${lens}::after { animation: df-harbor-lens 560ms ease-out; }
    }
    ${moving}:not(.df-off-focusring) ${card}${editorFocus}::before {
      background: linear-gradient(90deg, transparent, var(--df-harbor-light) 33%, white 56%,
        var(--df-shell-accent) 72%, transparent);
    }
  }
}
@keyframes df-harbor-lens {
  0% { background-position-x: 100%; opacity: 0; }
  28% { opacity: .75; }
  76% { opacity: .9; }
  100% { background-position-x: 0%; opacity: 0; }
}
`
