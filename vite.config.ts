import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // relative asset paths so the build works from any sub-path or static host
  base: './',
  server: {
    host: true,
    // the live-preview environment proxies the app under an arbitrary
    // <port>-<sandbox>.e2b.app host, so allow any host header in dev
    allowedHosts: true,
  },
})
