import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
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