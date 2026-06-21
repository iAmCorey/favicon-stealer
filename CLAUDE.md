# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`favicon-stealer` is a single-component React library published to npm. It exports one component, `<Favicon url="..." />`, that resolves and displays a website's favicon by trying a chain of candidate URLs and falling back gracefully. The entire runtime is ~175 lines in `src/Favicon.tsx`; everything else is build/packaging scaffolding.

## Commands

```shell
npm run build      # tsup -> dist/ (dual ESM + CJS + .d.ts). The only build step.
npm publish        # prepublishOnly auto-runs `npm run build` first
```

There is **no test runner and no linter**. `npm test` is a placeholder that intentionally exits 1 (`echo "Error: no test specified" && exit 1`). Don't trust it as a check; verify changes by building and, if needed, importing the `dist/` output into a consuming app.

## Architecture

**Module graph (all of it):**
- `src/index.tsx` — barrel; re-exports `Favicon` as a named export.
- `src/Favicon.tsx` — the whole component. A client component (`"use client"` directive at top).
- `src/lib/utils/index.ts` — `getDomain(url)`: normalizes any URL/bare-host string into a clean hostname (adds `https://` if missing, strips `www.`, returns input unchanged on parse failure).

**The fallback chain is the core idea.** `Favicon` builds one ordered, de-duped array of candidate image URLs (`sources`, memoized) and walks it by index on failure:
- site-own guesses against the domain (`/favicon.ico`, `/apple-touch-icon.png`, `/logo.svg`, `/logo.png`) plus third-party services (`favicon.im`, Google `s2/favicons`).
- `preferFallback` flips which group comes first; the caller-supplied `src` (if any) is folded into the **same** array — prepended when `preferSrc` (default) or appended otherwise — so a failed `src` falls through to auto-detection like any other source.

The walk is a `useReducer` over `{index, status}`. An `<img onError>`, or a per-source `timeout` (default 2000ms — the user `src` slot is **exempt**, so an explicit image is only dropped when it genuinely fails), dispatches `error` to advance the index; exhausting the array flips `status` to `error` and renders the letter-avatar. Cache/SSR hits (where the `<img>` is already `complete` and fires no event) are resolved via `img.decode()`, which reliably tells a decoded image — including dimension-less SVGs — from a broken one. Reset-on-`sources`-change happens **during render** (a `prevSources` state guard), not in an effect, so a stale-index frame never paints.

**Styling is fully self-contained inline `style` — no Tailwind.** The component emits zero utility classes; every visual (size, background, padding, borderRadius, border, skeleton, letter-avatar) is an inline `style`, and the pulse `@keyframes` is injected once into `document.head` (guarded module singleton, SSR-safe). Neutral surfaces use `color-mix(in srgb, currentColor …)` so they adapt to light/dark. Default/zero geometry (`padding`/`borderRadius`/`background`) is emitted as `undefined` rather than `0`/`transparent` so a consumer's `className` CSS can still win. If you add a styling prop, apply it via inline `style`.

## Build & packaging specifics

`tsup.config.ts` is the source of truth for the build, not `tsconfig.json` (tsconfig exists mainly for editor/type intent and its settings are overridden by esbuild):
- Emits **both** ESM (`dist/index.mjs`) and CJS (`dist/index.js`) plus `.d.ts`. Dual format exists specifically to fix the "exports is not defined" SSR crash under Vite 8 / modern bundlers — don't drop CJS or ESM.
- `"use client";` is re-injected as a bundle banner so the output stays RSC-compatible (Next.js App Router) after bundling.
- Source uses **classic JSX** (`options.jsx = 'transform'`, i.e. `React.createElement`); keep `import React` in any new `.tsx` file.
- `react` / `react-dom` are marked `external`, so they're never bundled. Note they're declared under `dependencies` (not `peerDependencies`) in `package.json` — keep that in mind if you touch dependency wiring.
- `package.json` `exports`/`main`/`module`/`types` must keep pointing at the `dist/` filenames tsup produces.

## Releasing

Versioning is manual: bump `version` in `package.json`, add a line to the changelog at the bottom of `README.md`, then `npm publish` (build runs automatically via `prepublishOnly`). Keep `package-lock.json` in sync with the bumped version — a recent commit existed solely to fix a lockfile left stale at an old version. Only `dist`, `LICENSE`, and `README.md` are shipped (`files` field); `src` is not published.

Note: inline code comments in `src/` and `tsup.config.ts` are written in Chinese.
