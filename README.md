<img src="./icon.png" alt="Deep Fish UI" width="72" height="72">

# Deep Fish UI

**Deep Fish UI** pairs the dot-matrix whale-girl with six illustrated scenes for the DeepSeek Harness Web UI. Each has its own motion and illustrated backdrop. The interface starts in DeepSeek blue (`#4D6BFE`). Choose a preset or any custom accent independently of the scene.

Everything is toggleable from **Settings → Plugins → dsh-fish-ui**, or the **Deep Fish UI** action in the sidebar footer.

## Scenes

| Scene | Motion |
| --- | --- |
| Tidal Atlas | Sea-depth contours drift beneath a plotted route. |
| Polar Silk | Aurora ribbons sway above two mountain ridges. |
| Lunar Orbit | A satellite circles a cratered moon. |
| Amber Dunes | Wind shifts the foreground sand ridges. |
| Neon Rain | Slanted rain passes a skyline and its reflections. |
| Celadon Pond | Concentric ripples expand between lotus leaves. |

Choose a card in **Scenes** to apply it. The backdrop recedes behind a conversation. **Scene motion** has Still, Calm and Flow settings. **Icon style** switches between outline and duotone for the plugin and common Harness actions, including new chat, search, folders, copy and send. The **Navigation & action icons** switch restores the host artwork. Preferences are saved to the current profile.

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
- Node.js `>=22`

## Development

The plugin is written in TypeScript. Harness loads the compiled host and browser entries from the npm package. To build a checkout with Node.js 22 or later, run:

```sh
npm ci
npm run build
```

## License

Deep Fish UI is distributed under the [MIT License](./LICENSE). Notices for the inherited code and dot artwork ship in [THIRD-PARTY-NOTICES](./THIRD-PARTY-NOTICES).
