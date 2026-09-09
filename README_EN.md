# Changzheng Theme (changzheng V1) — DeepSeek Harness Web Theme Plugin

A black-and-red theme plugin for the DeepSeek Harness Web GUI, built around the
Long March red-star icon set, with a CRT television effect. It is independent of
the built-in light/dark themes: you enable or disable it with one click from
**Settings → General → "长征主题 · 黑红"**.

## Folder layout

```
changzheng V1/
├── host.js            # Host half (icon asset RPC service)
├── client.js          # Client half (theme + all UI customization)
├── manifest.json      # Plugin manifest (name/version/icon map/features)
├── README.md          # Chinese readme (original)
├── README_EN.md       # This English readme
├── README_JP.md       # Japanese readme
├── README_Nya.md      # Nya easter egg (meow only)
└── assets/            # All 12 theme PNG assets
```

## Deploying on another dsh environment

### 1. Place the files

Put the whole `changzheng V1` folder at the **session workspace root** of the
target environment (for example `D:\dsh0\changzheng V1`). Keep all 12 PNGs in
`assets/` intact.

The Host half resolves icons in this order (relative paths resolve against the
session workspace):

1. `changzheng V1/assets/` (bundled with this package — recommended)
2. `main-changzheng/` (legacy folder compatibility)
3. `D:\dsh0\main-changzheng` (dev machine absolute path fallback)

### 2. Register the plugin

Use the dsh Web GUI dynamic plugin interface (a new semantic prefix such as
`czthm` works on new environments):

```js
cordis_define({
  plugin: { kind: 'new', idPrefix: 'czthm' },
  name: '长征主题 · 显像管特效',
  purpose: 'Black-red Long March theme: independent theme, appearance toggle, logo, CRT effect and full icon set.',
  code: {
    host:   entire host.js content,
    client: entire client.js content,
  },
})
```

Then `cordis_run` to activate (first run needs user approval when the approval
policy is `ask`).

### 3. Optional: switch the theme colors

The theme is a registered theme (id `changzheng`). After activation, open
**Settings → General**; below the Appearance row you will find
**"长征主题 · 黑红"** — click **启用 (Enable)** to apply the global black-red
palette, **停用 (Disable)** to restore the native dark theme.

## Feature list (V1.5 / runtime package pkg-1 rebuild)

| Area | Content |
| --- | --- |
| Appearance row | Settings → General "外观" row is replaced by four cubes: **Light / Dark / Follow system / Changzheng (red star)** — usable on every theme; the selected cube is red with gold border |
| Theme gating | Styles and UI take effect **only while the `changzheng` theme is active**; switching back to light/dark fully restores the native product UI; the appearance row is always present |
| Independent theme | Registers a `changzheng` theme (black base `#0c0000`, primary red `#e60012`, gold accents), independent of light/dark/system |
| Register resilience | `theme.register` retries after 400ms on a transient conflict (old fiber teardown lag), fixing the "switch row disappeared" issue |
| Global palette | The DeepSeek blue palette is fully remapped to red (send button, links, selection/active states, business accents, settings controls) |
| Geometry | All buttons, inputs, menus, tabs and long-box controls use right angles (`border-radius: 0`) |
| Branding | Top-left `logo.png` at 112px, centered and pasted directly (no frame); click = New Session; hero shows a 128px radiating star + 256px "为人民服务" banner (original "探索未至之境 · 预览版" headline hidden) |
| Top info bar | Dark-red background (same as the sidebar); 「显像管」CRT toggle + 「小贴士」tips button |
| CRT effect | Full-screen scanlines + RGB aperture grille + rolling bright band + vignette + contrast/saturation filter + power-on fade; toggled from the top bar |
| Tips dialog | Shows "1.兵贵神速 / 2.欲速则不达 / 3.人心齐，泰山移"; close by clicking the mask or the button |
| Icon usage | `star.png` → workspace folder icons; `settings.png` → settings entry; `new.png` → New Session action; `新分支.png` → fork action; `read.png` → read-type tool cards and the permission control; `write.png` → write/edit cards; `thinking/complete/error.png` → running/done/error tool states |
| Tool cards | read/glob/grep/read_image/write/edit/todo_write use themed black-red cards (state icon + tool icon + args/result summary) |
| Actions | Sidebar-footer "New Session" (new.png) and session-header "Fork" (新分支.png) are functional |
| Status text | "深度求索中..." is displayed as "为人民服务中..." (same red gradient shimmer) |

## Version history

| Version | Content |
| --- | --- |
| V1.5 (pkg-1) | **Appearance row with four theme cubes** (light/dark/system/changzheng·red star, replaces the product Appearance row); theme-register timing resilience (fixes the missing switch row); rebuilt package with all later fixes |
| V1.2 | Code blocks / user messages black-red right angles, themed tool cards / thinking / context-injection rows, enhanced CRT, new "为人民服务" banner |
| V1.1 (pkg-12) | **Theme gating**: CSS gated by the `--cz-changzheng-active` marker variable; UI mounts/unmounts on `theme/change`; switching back to light/dark fully restores the native theme |
| V1 (pkg-11) | All controls right-angled, red settings control, tips dialog, full icon set, 112px centered logo, "为人民服务中..." status text, blue→red |

## Known limitations & maintenance notes

1. **Theme switching is not persisted**: state is in-memory for the dynamic
   plugin; after a page refresh the durable theme preference (dark/light) is
   restored — pick **Light/Dark/Changzheng** in the Appearance row again (the
   plugin itself stays running for the session). Switching back to light/dark
   unloads all Changzheng styling and UI, keeping only the appearance row.
2. **CSS-module class-name dependency**: rules for the frame-less brand, hidden
   hero headline, folder icon replacement, right angles and red controls rely
   on the `_local` segment of product class names (e.g. `hash_brand`,
   `hash_folder`, `hash_titleGroup`, `hash_turnStatus`, `hash_triggerRow`,
   `hash_sectionHeader`, `hash_newSession`, `hash_modes`, `hash_trailing`). If
   the target dsh version renames component classes, those rules silently stop
   applying — **slot features and theme colors are unaffected**; delete the
   dead CSS lines if desired.
3. **Tool card takeover**: read/glob/grep/read_image/write/edit/todo_write
   cards are replaced by minimal themed cards; to keep the native rich cards
   (diff, images, etc.), remove the corresponding keys from the
   `tool.call.toolview` section in `client.js`.
4. **`redo.png` is unused**: undo/redo has no available slot or service API; it
   appears only in the settings-row icon strip.
5. **Scope**: red/black/right-angle rules apply under `body[data-ds-dark-theme]`
   (dark palette, with the theme marker); in the light theme only the registered
   slot UI is present while the theme is active.
6. **Approval**: new environments need one user approval for the Client code on
   first run (when the approval policy is `ask`).
