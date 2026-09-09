import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `RF_INLINE_IMAGES=1` is used by scripts/build-preview.mjs: the single-file
 * preview has every master as a data URI and no sibling files to fetch, so the
 * responsive ladder has to be switched off there (see src/components/ui.tsx).
 */
const inlineImages = process.env.RF_INLINE_IMAGES === '1'

export default defineConfig({
  plugins: [react()],
  // relative asset paths so the build works from any sub-path or static host
  base: './',
  define: { __RF_INLINE__: JSON.stringify(inlineImages) },
  // the demo is routinely opened from a tunneled/preview host, and Vite's
  // default host allow-list blocks those requests outright
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
  build: {
    // one shared vendor chunk: the demo re-uses React on every view, and a
    // single long-cached file beats re-parsing three small ones on a phone
    rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'framer-motion'] } } },
  },
})
