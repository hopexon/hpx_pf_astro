# HPX Portfolio

Personal portfolio site of HPX — profile, drawings, web dev tips, and small tools.

**Live:** [https://hpx-dev.com/](https://hpx-dev.com/)

## Tech Stack

- **Framework:** [Astro](https://astro.build) 7 (static output) + Astro Actions
- **UI:** Astro components, Web Components, React 19 (islands), MDX
- **Language:** TypeScript
- **Code highlighting:** astro-expressive-code
- **Contact form:** Resend (email) + Cloudflare Turnstile (bot protection)
- **Hosting:** Cloudflare Workers (`@astrojs/cloudflare`)
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

## Cloudflare deployment

The site is configured for Cloudflare Workers with Static Assets. Production and
preview builds are created by Cloudflare Workers Builds from the GitHub repository.

- Build command: `pnpm build`
- Deploy command: `pnpm wrangler deploy`
- Preview command: `pnpm wrangler preview`
- Production branch: `main`

See [Cloudflare deployment setup](docs/cloudflare-deployment.md) for the initial
GitHub connection, environment variables, preview settings, and domain cutover.
