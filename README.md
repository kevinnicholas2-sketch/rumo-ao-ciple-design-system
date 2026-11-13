# Rumo ao CIPLE design system

A set of static pages for designing, testing and sharing the Rumo ao CIPLE visual system. No build step and no framework: plain HTML, CSS and JavaScript.

## Run it

The pages read stylesheets and local storage, so open them through a local server, not by double-clicking the files.

```bash
npx http-server . -p 5173 -c-1
```

Then open http://localhost:5173/.

## The pages

| Page | What it is |
| --- | --- |
| `index.html` | **The main tool.** A "Design Options" panel on the left (Themes, Color, Type, Layout, Export) and live previews on the right: web dashboard, mobile reading, social post, printable worksheet, sample UI, spacing, column grid, responsive frame, layout checks, compare and CSS. |
| `type-playground.html` | Standalone type experiments: font pairs, weight roles, line height and tracking. |
| `color-playground.html` | Standalone color experiments: harmonies, tonal ramps, semantic roles, contrast checker and dark mode. |
| `layout-playground.html` | Standalone spacing scale, column grid and responsive strategies. |
| `shape-playground.html` | Radius scale, separation, border weight, shadows and the Light/Dark elevation rule. |
| `token-cascade.html` | Every custom property in the theme, editable live, with a sample interface built only from `var(--token)`. |
| `share-playground.html` | Edit five tokens, save themes in the browser and copy a view-only link. |

## How the theme flows between pages

1. You edit in `index.html`. The tool keeps your current work in the browser's local storage.
2. **Export > Download tokens.css** writes the theme with the shared token names (`--color-primary`, `--space-4`, `--radius-md` and so on). Light is `:root`; Dark colors sit under `:root[data-theme="dark"]` and shadows are `none` in Dark.
3. `token-cascade.html` and `share-playground.html` load `tokens.css` and also pick up the main tool's current theme automatically (same browser, same address). Both have a switch to use the `tokens.css` file instead.
4. **Export > Import** reads a `tokens.css`, a theme `.json` or a share link back into the tool.

`tokens.css` in this folder is the default theme (Azulejo) written by the tool. The previews inside the main tool use their own `--cip-*` variables; the CSS tab can show either set.

## Things worth knowing

- **View-only links.** "Copy share link" puts the whole theme in the address (`#s=…`). Anyone with the link can see the theme; the tool opens read-only. `share-playground.html` uses `?s=…` with five values and never reads local themes in read-only mode.
- **Saved themes** live in the browser's local storage on that device only. Nothing is sent anywhere. Clearing site data deletes them.
- **Undo and redo** cover design edits (Ctrl+Z, Ctrl+Shift+Z). History lasts for the page session.
- **Health** (top bar) summarizes contrast in Light and Dark, the layout checks, font weights and type spacing. Each issue has a "Go to it" button.
- **Layout checks** render the real dashboard and reading screens at four widths with your chosen strategy (Fluid, Adaptive or Combination) and report overflow, text size, tap targets, line length and long Portuguese words.
- **Fonts.** Heading and body fonts are loaded from Google Fonts by the main tool. Offline, the fallbacks in each font stack are used.

## Files

```
index.html, app.js, styles.css   the main tool
tokens.css                       the shared theme file
*-playground.html                standalone experiments
token-cascade.html               token table + live cascade
share-playground.html            save and share five tokens
```

## Publishing

The site is served by GitHub Pages from the `main` branch (root folder). Pushing to `main` redeploys it in a minute or two.

It also deploys to Vercel as a static site: `vercel.json` turns off the build step and serves the root folder, and `.vercelignore` keeps local tooling and private notes out of the upload.

Share links are built from the address the tool is opened at, so links copied from the hosted site work for anyone. Links copied on `localhost` only work on your machine.
