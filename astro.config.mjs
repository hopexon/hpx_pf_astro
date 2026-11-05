import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://hpx-pfproject01.vercel.app/',
  server: { host: '127.0.0.1' },
  integrations: [
    expressiveCode({ removeUnusedThemes: false }),
    react(),
    mdx()],
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});
