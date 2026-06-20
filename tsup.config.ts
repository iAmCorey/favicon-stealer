import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  // 同时产出 ESM(.mjs) 与 CJS(.js) — 解决 Vite 8 / 现代打包器 SSR
  // 跑纯 CJS 包时的 "exports is not defined" 崩溃。
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  // react 由消费方提供,不打进包里
  external: ['react', 'react-dom'],
  // 源码用经典 jsx(import React + React.createElement),匹配它
  esbuildOptions(options) {
    options.jsx = 'transform';
  },
  // Favicon 是客户端组件;bundle 后把 "use client" 提到产物最顶部,兼容 RSC(Next 等)
  banner: { js: '"use client";' },
});
