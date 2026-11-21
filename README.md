# dsh-fish-ui

A **finish layer** for the DeepSeek Harness Web UI: [Maple Mono NF CN](https://github.com/subframe7536/maple-font) everywhere, plus a few quiet surface details (composer glow, rounded code blocks, softer scrollbars, motion-safe hover).

It is built to sit **on top of a theme**, not to replace one — in particular it is tuned to pair with [deepclear-ui](https://github.com/KUN-NNN/deepclear-ui), whose `--dc-accent` token it reuses for focus rings, selection and scrollbar hover. Install it after your theme; disable it and the UI returns to the theme's own look.

> Why "fish"? The author's companion persona is a fat AI fish. It is a finish coat, not a whole aquarium.

## Features

- **Maple Mono NF CN** across the UI, inputs, code and inline code, with `ss01` / `cv01` / `liga` enabled.
- Composer: 16px radius and a soft accent glow on focus.
- Code blocks: rounded, hairline border, inline code with a tinted pill.
- Typography: 650-weight headings, 1.75 line-height for prose, letter-spacing tuned for a monospace face.
- Selection and scrollbars use the active theme accent.
- Buttons lift 1px on hover; all motion is disabled under `prefers-reduced-motion`.

## Install

```bash
dsh plugin --profile <profile> add dsh-fish-ui
```

Then **fully quit and reopen DSH** (Cmd+Q on macOS, not just a page refresh) so the client half is mounted.

From a local checkout:

```bash
dsh plugin --profile <profile> add /absolute/path/to/dsh-fish-ui
```

## Pairing with deepclear-ui

```bash
dsh plugin --profile <profile> add deepclear-ui
dsh plugin --profile <profile> add dsh-fish-ui
```

Both are client-side layers. deepclear-ui owns colors, the dot-matrix hero and layout; dsh-fish-ui owns type and surface detail. They do not register the same slots and do not fight over colors — if you see a visual conflict, disable dsh-fish-ui first and report it.

## Requirements

- DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`
- Node.js `>=22`
- The **Maple Mono NF CN** font installed on the machine (`brew install --cask font-maple-mono-nf-cn`). Without it the stack falls back to the system monospace font.

## How it works

`client.js` is a Cordis client plugin that appends one `<style>` element when applied and removes it on teardown. No host state, no network, no slots, no font files shipped. The CSS is scoped to type and surface selectors and reads the host's semantic tokens (`--dsw-*`) plus deepclear's `--dc-accent`.

## Disable / uninstall

```bash
dsh plugin --profile <profile> disable dsh-fish-ui   # keep the package, turn the layer off
dsh plugin --profile <profile> remove dsh-fish-ui    # remove it entirely
```

## License

MIT. See [LICENSE](./LICENSE).
