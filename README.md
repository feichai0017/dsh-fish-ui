<img src="https://raw.githubusercontent.com/feichai0017/dsh-fish-ui/v0.6.1/icon.png" alt="Deep Fish UI" width="72" height="72">

# Deep Fish UI

**Deep Fish UI** adds painted conversation backgrounds and a model and reasoning picker to DeepSeek Harness. The interface starts in DeepSeek blue (`#4D6BFE`). Choose a preset or a custom accent independently of the scene.

Open **Deep Fish UI** in the sidebar footer or **Settings → Plugins → dsh-fish-ui** to change the appearance.

## Launch and welcome

When Harness starts on a blank conversation, a 1.66-second opening shows the selected painting inside a circular window. The etched rim takes your accent color. A click, keystroke or scroll dismisses it immediately. Restoring an existing conversation takes you straight back to the transcript.

Under **Scenes**, use **Launch animation** to control automatic playback and **Preview intro** to replay it. Still mode, reduced motion and forced colors skip the opening. The scene button in the corner of the welcome page opens the gallery.

On the desktop welcome page, open the workspace name above the composer. Choose **Add workspace…** to open the system folder chooser, or select an already listed workspace. Harness adds the folder and selects it. Deep Fish UI supplies the desktop chooser when the host's workspace menu is missing its folder action.

## Window and menus

The selected painting fills the window behind the conversation, sidebar, tools pane, title bar and bottom bar. Opening a pane reveals another part of the same picture. The bars blur the painting behind them and a separate wash keeps the transcript legible. To return to a plain window, turn off **Window backdrop** under **Scenes**.

Frosted surfaces have a fine lit edge and a shaded lower lip in both light and dark mode. With pointer effects on, light follows the pointer along the composer's edge. Menus use a denser material to keep labels legible over conversation text. The selected accent marks focus and keyboard selection.

Under **Interface details → Fish finish**, turn on **Frosted glass** and choose **Interface** or **Command menu**. Drag **Transparency** (0–70%) or **Blur** (0–40 px) to see the result on the sample and the live interface. Release to save to the current profile. Arrow keys also adjust the sliders.

New configurations start at 22% transparency and 24 px blur for the interface. The command and model menus use the separate menu settings, initially 2% transparency and 20 px blur. Saved slider values carry over on upgrade. Reduced transparency or increased contrast switches the material to a solid surface.

## Model and reasoning picker

Open the composer's model button. Select a model card, then choose one of the reasoning levels offered for that model. The shaded ridge takes its light from the scene, changes shape with the model and rises with reasoning effort. It moves while the session is thinking or streaming and rests when the session is idle. Use the original model row to search the full provider catalog. Harness applies selections to the current session and reports pending or rejected changes.

Use **Save current as Daily** or **Save current as Deep** in the model menu to remember a provider, model and reasoning level. Both presets live in the current Harness profile. Once saved, select **Daily** or **Deep** in the composer toolbar to apply the combination to that conversation in one click. To replace a preset, select the new combination and save it to the same slot.

## Pending approvals

When Harness is waiting for tool approval, the corresponding conversation shows an **Approval** button in the sidebar. Select it to open that conversation and focus the native approval card. **Needs your attention** in the sidebar footer lists the sessions currently awaiting approval, including sessions in other workspaces. Use the card's own controls to allow or reject the request. The sidebar updates when the request ends.

Active sessions and tabs pick up the current scene's color. Tool steps, message bubbles and plugin groups have distinct reading surfaces. Changing scenes crossfades the full-window painting. Still mode and the system's reduced-motion setting skip these transitions.

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
