# dsh-fish-ui

**Deep Fish UI** — a dot-matrix theme for the DeepSeek Harness Web UI: a fish drawn in dots on the blank home, whale-blue accents, a reading layout, a code palette, and a **Fish finish** layer with Maple Mono NF CN, composer glow and soft motion.

Everything is switchable from **Settings → Plugins → dsh-fish-ui**, or the **Deep Fish UI** action in the sidebar footer.

## What's inside

- **Fish hero**: the dot-matrix fish and wordmark on a blank session, plus a full-page dot field, a slow bottom wave, and pointer ripples.
- **Thinking**: a rotating dot sphere beside the live status, and an optional English status label.
- **Reading layout**: roomier paragraphs, headings and quotes; muted syntax colours; a re-inked diff palette.
- **Whale-blue accents**: bold runs in chat prose, the composer focus ring, and sidebar details.
- **Fish finish**:
  - **Maple Mono NF CN** across the UI, inputs, prose and code, with `ss01` / `cv01` / `liga`;
  - **Composer glow**: 16px radius and a soft accent ring on focus;
  - **Code surface**: rounded code blocks with a hairline border and tinted inline-code pills;
  - **Soft motion**: buttons lift 1px on hover; all motion is disabled under `prefers-reduced-motion`.

## Install

```bash
dsh plugin --profile <profile> add dsh-fish-ui
```

Then **fully quit and reopen DSH** (Cmd+Q on macOS, not just a page refresh) so the client half mounts.

From a local checkout:

```bash
dsh plugin --profile <profile> add /absolute/path/to/dsh-fish-ui
```

## Font

Install the font once per machine:

```bash
brew install --cask font-maple-mono-nf-cn
```

Without it the stack falls back to the system monospace font; everything else still works, and the font layer can be turned off in settings.

## Settings

The settings sheet groups preferences into **Interface & reading**, **Hero**, **Thinking**, **Composer**, **Sidebar**, **Accents**, and **Fish finish**. Changes apply immediately and are saved to the profile configuration.

## Compatibility

- DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`
- Node.js `>=22`

Do not install two theme plugins that own the same slots at once; disable one before enabling the other.

## License

MIT. See [LICENSE](./LICENSE).
