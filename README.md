# dsh-fish-ui

**Deep Fish UI** — a Catppuccin-themed, dot-matrix theme for the DeepSeek Harness Web UI: a fish drawn in dots on the blank home, aurora light, pointer physics, thinking and text motion, Maple Mono NF CN type, and a switchable **Fish finish** layer.

Everything is toggleable from **Settings → Plugins → dsh-fish-ui**, or the **Deep Fish UI** action in the sidebar footer.

## What's inside

- **Catppuccin palette**: Latte / Mocha backgrounds, text, borders, sidebar and accents, plus the code and diff palettes.
- **Fish hero**: a dot-matrix fish and wordmark on a blank session, a full-page dot field, a slow bottom wave and pointer ripples.
- **Aurora**: slowly drifting gradient light behind the interface, breathing with the accent colour.
- **Pointer physics**: a soft glow that follows the cursor, and a subtle 3D tilt on the composer.
- **Thinking & text motion**: replies rise in, reasoning blocks shimmer gently, streaming text keeps a calm breathing rhythm.
- **Fish finish**: Maple Mono NF CN across the UI and code with `ss01` / `cv01` / `liga`, a 16px composer with accent focus glow, rounded code surfaces, and motion-safe hover.

All motion is disabled under `prefers-reduced-motion`.

## Install

```bash
dsh plugin --profile <profile> add dsh-fish-ui
```

Then **fully quit and reopen DSH** (Cmd+Q on macOS, not just a page refresh).

## Font

```bash
brew install --cask font-maple-mono-nf-cn
```

Without it the stack falls back to the system monospace font; the font layer can be turned off in settings.

## Settings groups

**Interface & reading** · **Hero** · **Thinking** · **Composer** · **Sidebar** · **Accents** · **Fish finish** · **Catppuccin & motion**

## Compatibility

- DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`
- Node.js `>=22`

## License

MIT. See [LICENSE](./LICENSE).
