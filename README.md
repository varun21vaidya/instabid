# instabid.live

A verified, pay-to-rank Instagram leaderboard. Creators bid for placement in category leaderboards, verify ownership of their Instagram handle via a bio challenge code, and pay through Stripe Checkout. Built with Astro on Cloudflare.

## Features

- **Pay-to-rank leaderboard** — bids ($5 min / $50,000 max USD) place profiles in category rankings
- **Bio verification** — challenge-code flow proving Instagram handle ownership before a profile is marked verified
- **Stripe Checkout** — real payment sessions with idempotency keys; falls back to demo mode when no Stripe key is configured
- **Seasons & categories** — time-boxed seasons with per-category leaderboards and an archive of past seasons
- **Click tracking** — outbound clicks are logged with hashed IP + user agent to deter manipulation
- **SEO** — sitemap, robots.txt, OG image, security headers (`public/_headers`)

## Tech Stack

| Layer     | Tech                                          |
| --------- | --------------------------------------------- |
| Framework | [Astro 5](https://astro.build) (SSR)          |
| Hosting   | Cloudflare Pages/Workers (`@astrojs/cloudflare`) |
| Styling   | Tailwind CSS 4 (Vite plugin)                  |
| Database  | Cloudflare D1 (SQLite) via Drizzle ORM        |
| Payments  | Stripe Checkout                               |

## Project Structure

```
├── astro.config.mjs        # Astro + Cloudflare adapter config
├── wrangler.jsonc          # Cloudflare config (D1 binding: DB)
├── drizzle.config.ts       # Drizzle Kit config
├── drizzle/                # Generated migrations
├── public/                 # Static assets (_headers, og-image, etc.)
└── src/
    ├── components/         # BidModal, LeaderboardCard, FAQSection, ...
    ├── db/
    │   ├── schema.ts       # categories, seasons, profiles, bids, ...
    │   └── index.ts        # Drizzle client over D1 binding
    ├── lib/
    │   └── verification.ts # Challenge generation + bio checking
    ├── pages/
    │   ├── api/
    │   │   ├── create-checkout.ts   # Stripe Checkout session
    │   │   ├── stripe-webhook.ts    # Payment lifecycle events
    │   │   ├── verify-bio.ts        # Generate/check challenge codes
    │   │   └── redirect-click.ts    # Tracked outbound redirects
    │   ├── index.astro               # Leaderboard home
    │   ├── category/[category].astro # Per-category boards
    │   └── archive.astro             # Past seasons
    └── styles/global.css
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare account with a D1 database
- (Optional) Stripe secret key for live payments

### Install

```bash
npm install
```

### Environment Variables

Set these in `wrangler.jsonc` vars or via `wrangler pages secret put`:

| Variable            | Required | Description                                        |
| ------------------- | -------- | -------------------------------------------------- |
| `STRIPE_SECRET_KEY` | No       | Enables live Stripe Checkout. Omit for demo mode.  |
| `PUBLIC_SITE_URL`   | No       | Canonical site URL. Defaults to the request origin. |

Without `STRIPE_SECRET_KEY`, checkout runs in **demo mode** (payments simulate instantly for local testing).

### Develop

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Production build to ./dist
npm run preview   # Preview production build locally
```

### Database

Schema lives in `src/db/schema.ts`. After editing it:

```bash
npm run db:generate   # Generate a migration into ./drizzle
npm run db:migrate    # Apply migrations to D1
```

## Deployment

Deploys as a Cloudflare Pages project using `wrangler.jsonc` (`pages_build_output_dir: ./dist`). The `DB` binding points at the `instabid-db` D1 database.

```bash
npx wrangler pages deploy dist
```

Or connect the GitHub repo to Cloudflare Pages for automatic deploys.

## API Endpoints

| Endpoint                 | Method | Purpose                                    |
| ------------------------ | ------ | ------------------------------------------ |
| `/api/create-checkout`   | POST   | Validate bid, create Stripe Checkout URL   |
| `/api/stripe-webhook`    | POST   | Handle payment events, activate bids       |
| `/api/verify-bio`        | POST   | Generate or verify Instagram bio challenge |
| `/api/redirect-click`    | GET    | Log click, redirect to profile             |

## License

[MIT](./LICENSE) © Varun Vaidya
