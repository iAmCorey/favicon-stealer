# favicon-stealer
A react component to get clear and consistent favicon of a website easily.


# Installation

> Requires **React 18 or 19** as a peer dependency. Make sure `react` and `react-dom` are installed in your project (most React apps already have them).

## npm
```shell
npm install favicon-stealer
```
## pnpm
```shell
pnpm add favicon-stealer
```

# Usage
```tsx
import { Favicon, type FaviconProps } from 'favicon-stealer';

// Basic: auto-detect the site's favicon
<Favicon url="https://example.com" />

// Provide your own image first; falls back to auto-detection if it fails to load
<Favicon url="https://example.com" src="/logos/example.png" />

// Lazy-load below-the-fold icons (waits until scrolled into view)
<Favicon url="https://example.com" lazy />
```

## Props
| Name | Type | Description |
| ---- | ---- | ----------- |
| `url` | `string` | The URL of the website to fetch the favicon for. |
| `src` | `string` | The image src(can be local) of the favicon to display. |
| `alt` | `string` | The alt text for the favicon image. |
| `size` | `number` | The size of the favicon in pixels. Default is 32. |
| `className` | `string` | A class name to apply to the element. |
| `timeout` | `number` | The timeout in milliseconds before giving up on a slow/unresponsive **auto-detected** source and trying the next one. A provided `src` is exempt — it is only abandoned on a real load failure, never on a timeout. Default is 2000 (2 seconds). |
| `lazy` | `boolean` | Whether to load the favicon lazily (defers loading until scrolled into view; lazy icons are exempt from the timeout). Default is false. |
| `border` | `boolean` | Whether to show a border around the favicon. Default is false. |
| `padding` | `number` | The padding in pixels.(px) Default is 0. |
| `background` | `string` | The background color of the favicon. Default is transparent.(in hex) |
| `borderRadius` | `number` | The border radius in pixels.(px) Default is 0. |
| `preferFallback` | `boolean` | Whether to prefer fallback service (e.g.Google's favicon service) over the website's own favicon. Default is false. |
| `preferSrc` | `boolean` | Whether to try the provided `src` before auto-detecting the website's own favicon (if both are provided). If `src` fails to load it falls back to auto-detection either way. Default is true. |


# NPM Package
[favicon-stealer - npm](https://www.npmjs.com/package/favicon-stealer)


# GitHub Repository
[favicon-stealer - github](https://github.com/iAmCorey/favicon-stealer)


# License
MIT License


# Changelog
- v1.0.0: Initial release (2025.1.21)
- v1.0.1: Add README.md (2025.1.21)
- v1.0.2: Update license to MIT (2025.1.21)
- v1.1.0: Fix show bug(2025.2.1)
- v1.2.0: Add props(lazy, border, padding, background, borderRadius)(2025.2.1)
- v1.4.0: Improved favicon detection and optimized package size; Added preferGoogle option and improved favicon loading reliability (2025.2.27)
- v1.5.0: Update default timeout to 3000(3 seconds) (2025.2.27)
- v1.6.0: change prop preferGoogle to preferFallback (2025.2.27)
- v1.8.0: Add props(src, alt, preferSrc), add new fallback(favicon.im)(2025.3.13)
- v1.9.0: Fix show bug when use 'src'(2025.3.26)
- v2.0.0: Dual ESM/CJS build with an `exports` map — fixes Vite 8 / modern bundler SSR "exports is not defined". Breaking: output is now a single bundle, deep sub-path imports (e.g. `favicon-stealer/dist/Favicon`) are gone (2026.6.20)
- v3.0.0: Rewrite of favicon resolution + rendering.
  - **BREAKING**: `react` is now a `peerDependency` (consumer must provide React); the unused `react-dom` peer was dropped.
  - **BREAKING**: styling is fully self-contained inline `style` — no Tailwind classes are emitted, and default `padding`/`borderRadius`/`background` no longer override your `className`.
  - **BREAKING**: `src` behavior — `preferSrc` is now honored, a provided `src` no longer times out (it falls back only on a real load failure), the default `timeout` is now 2000ms (was 3000), and the candidate source list was trimmed, so some sites/inputs resolve differently.
  - Fixes: `src` load-failure no longer hangs on the skeleton; reload on `url`/`src` change without a stale frame or wasted request; cache/SSR hits use `img.decode()` (feature-detected — falls back to `naturalWidth` on engines without it, e.g. old WebViews / jsdom; no false-negative on dimension-less SVGs); offscreen `lazy` images wait for the viewport instead of being timed out through every source to the letter fallback; de-duped sources (no `key` collision); `border` works; `alt=""` is honored for decorative icons (and the loading image is silent to screen readers until shown); empty/invalid `url` no longer renders a blank box; pulse keyframes inject once per document (DOM-id de-duped across HMR / duplicate copies); `FaviconProps` is exported. (2026.6.21)