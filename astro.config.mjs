import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import expressiveCode from 'astro-expressive-code'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  srcDir: process.env.ASTRO_BUILD_SRC_DIR,
  publicDir: process.env.ASTRO_BUILD_PUBLIC_DIR,
  output: 'static',
  // Images are managed manually; disable Cloudflare Images (default: 'cloudflare-binding').
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', default: '' }),
    },
  },
  site: 'https://hpx-dev.com/',
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
