import { defineConfig, envField } from 'astro/config'
import vercel from '@astrojs/vercel'
import expressiveCode from 'astro-expressive-code'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel({ maxDuration: 30 }),
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', default: '' }),
    },
  },
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
