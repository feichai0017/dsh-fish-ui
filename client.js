/**
 * dsh-fish-ui — a Maple Mono NF CN finish layer for the DSH Web UI.
 *
 * A pure client half: one stylesheet appended after the shell and theme styles,
 * so these declarations win on equal specificity. It deliberately touches only
 * typography and a few surface details, leaving colors and layout to the theme
 * (deepclear-ui or whatever else is active).
 */
window.__ModuleLoader__.load({
  id: 'dsh-fish-ui',
  factory() {
    const CSS = `
      :root {
        --fish-font: "Maple Mono NF CN", "Maple Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        --fish-radius: 16px;
        --fish-ink: var(--dc-accent, #7cc8ff);
      }

      /* ---------- type ---------- */
      html, body {
        font-family: var(--fish-font) !important;
        font-feature-settings: "ss01" 1, "cv01" 1, "liga" 1;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      body {
        letter-spacing: .005em;
      }
      button, input, textarea, select, [contenteditable="true"] {
        font-family: inherit !important;
      }
      code, pre, kbd, samp {
        font-family: var(--fish-font) !important;
      }
      h1, h2, h3 {
        font-weight: 650;
        letter-spacing: .012em;
      }
      p, li, blockquote {
        line-height: 1.75;
      }
      :not(pre) > code {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, #222) 78%, transparent);
        padding: .12em .38em;
        border-radius: 5px;
      }

      /* ---------- surfaces ---------- */
      pre {
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, #333) 70%, transparent);
      }
      [data-composer-card] {
        border-radius: var(--fish-radius) !important;
        transition: box-shadow .25s ease, border-color .25s ease;
      }
      [data-composer-card]:focus-within {
        box-shadow: 0 0 0 1px var(--fish-ink),
                    0 18px 50px -28px var(--fish-ink) !important;
      }
      button {
        transition: transform .16s ease, box-shadow .16s ease;
      }
      button:hover {
        transform: translateY(-1px);
      }

      /* ---------- selection & scroll ---------- */
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
        * {
          animation: none !important;
          transition: none !important;
        }
      }
    `
    return {
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui'
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: styles')
      },
    }
  },
})
