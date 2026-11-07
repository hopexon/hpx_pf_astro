# HPX Portfolio

Personal portfolio site of HPX — profile, drawings, web dev tips, and small tools.

**Live:** https://hpx-pfproject01.vercel.app/

## Tech Stack

- **Framework:** [Astro](https://astro.build) 7 (static output) + Astro Actions
- **UI:** Astro components, Web Components, React 19 (islands), MDX
- **Language:** TypeScript
- **Code highlighting:** astro-expressive-code
- **Contact form:** Resend (email) + Cloudflare Turnstile (bot protection)
- **Hosting:** Vercel (`@astrojs/vercel`)
- **Tooling:** pnpm, Node.js 26 (`.nvmrc`), sharp

## Pages

| Path              | Description                                   |
| :---------------- | :-------------------------------------------- |
| `/`               | Welcome page                                  |
| `/top`            | Top page with the main menu                   |
| `/about`          | Profile of the author                         |
| `/works`          | Drawing collection                            |
| `/tips`           | Tips for web development and design           |
| `/tips/[slug]`    | Individual tip articles                       |
| `/tools`          | Utility tools for developers and designers    |
| `/tools/interval` | Fingerboard map tool for guitarists           |
| `/contact`        | Contact form                                  |

## Getting Started

```sh
nvm use
pnpm install --frozen-lockfile
pnpm run dev:bg    # start dev server in background (127.0.0.1:4321)
pnpm run build     # build to ./dist/
```

### Environment Variables (contact form)

| Name                   | Scope  |
| :--------------------- | :----- |
| `RESEND_API_KEY`       | server |
| `TURNSTILE_SECRET_KEY` | server |
| `CONTACT_FROM`         | server |
| `CONTACT_TO`           | server |
| `TURNSTILE_SITE_KEY`   | client |
