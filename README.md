<img src="https://raw.githubusercontent.com/feichai0017/dsh-fish-ui/v0.6.1/icon.png" alt="Deep Fish UI" width="72" height="72">

# Deep Fish UI

**Deep Fish UI** adds painted conversation backgrounds and a model and reasoning picker to DeepSeek Harness. The interface starts in DeepSeek blue (`#4D6BFE`). Choose a preset or a custom accent independently of the scene.

Open **Deep Fish UI** in the sidebar footer or **Settings → Plugins → dsh-fish-ui** to change the appearance.

## Model and reasoning picker

Open the composer's model button. Select a model card, then choose one of the reasoning levels offered for that model. The ridge changes shape with the model and rises with the effort setting. The compact trigger follows the session through reasoning and text output. Use the original model row to search the full provider catalog. Harness applies selections to the current session and reports pending or rejected changes.

## Scenes

The six original, AI-generated 1280 × 640 paintings ship in the plugin. Landscape references include [USGS seafloor relief](https://www.usgs.gov/media/images/shaded-relief-bathymetry-examples), [NASA lunar imagery](https://science.nasa.gov/moon/image-galleries/moonscapes/) and [Bian Shoumin’s lotus leaves at The Met](https://www.metmuseum.org/art/collection/search/49236).

| Scene | When the first text of a reply arrives |
| --- | --- |
| Tidal Atlas | A cyan current traces the submarine canyon. |
| Polar Silk | A seam of green light travels along the auroral curtain. |
| Lunar Orbit | A small satellite crosses the bright edge of the moon. |
| Amber Dunes | A warm glint follows the crest of a dune. |
| Neon Rain | City lights shimmer once in the harbor reflection. |
| Celadon Pond | A ripple expands through the still water beside the lotus. |

Each arrival plays once per live turn. Opening history or loading older messages keeps the scene quiet. **Scene motion** offers Still, Calm and Flow. Still and the system’s reduced-motion setting suppress the arrivals. **Icon style** switches between outline and duotone for the plugin and common Harness actions. Appearance preferences are saved to the current profile.

## What's inside

- **Catppuccin palette** supplies light and dark reading surfaces, text and borders. Accent color is a separate preference.
- **Whale-girl hero**: the dot-matrix maid portrait and wordmark on a blank session, a full-page dot field, a slow bottom wave and pointer ripples.
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

**Scenes** contains the gallery, backdrop, motion and icon controls. **Interface details** contains reading, hero, thinking, composer, sidebar, accent, font and interaction controls.

## Compatibility

- DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`
- Model and reply integration verified against Harness `0.2.2-rc.5`.
- Node.js `>=22`

## Development

The plugin is written in TypeScript. Harness loads the compiled host and browser entries from the npm package. To build a checkout with Node.js 22 or later, run:

```sh
npm ci
npm run build
```

## License

Deep Fish UI is distributed under the [MIT License](./LICENSE). Notices for the inherited code and dot artwork ship in [THIRD-PARTY-NOTICES](./THIRD-PARTY-NOTICES).
