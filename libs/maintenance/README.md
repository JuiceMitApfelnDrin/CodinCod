# Maintenance Worker

This Cloudflare Worker serves a maintenance page when the main website is down or being deployed.

## Architecture

The maintenance page is **built from the main frontend SvelteKit app** to ensure consistent branding and styling. This means:

- ✅ **Shared components**: Uses the same Header, Typography, and UI components as the main site
- ✅ **Consistent styling**: Same Tailwind theme, colors, and design system
- ✅ **Automatic updates**: When you update the frontend design, the maintenance page updates too
- ✅ **Zero duplication**: No need to maintain separate HTML/CSS

## How It Works

1. **Frontend build** (`libs/frontend`):
   - The route `/maintenance` is prerendered to static HTML at build time
   - After building, `scripts/copy-maintenance.mjs` copies the HTML to this worker
   - The HTML includes all inlined CSS and is a fully self-contained page

2. **Worker deployment** (`libs/maintenance`):
   - The worker imports the generated `maintenance.html.ts` file
   - When the main site is down, it serves this HTML with a 503 status code
   - The page auto-refreshes every 15 seconds to check if the site is back up

## Building

The maintenance page HTML is auto-generated when you build the frontend:

```bash
# Build the frontend (which generates the maintenance page)
pnpm --filter frontend build

# Deploy the maintenance worker
pnpm --filter maintenance deploy
```

## Development

To preview the maintenance page locally:

```bash
# Option 1: View it in the frontend dev server
pnpm --filter frontend dev
# Navigate to http://localhost:5173/maintenance

# Option 2: Test the worker locally
pnpm --filter maintenance dev
```

## Files

- `src/index.ts` - Main worker logic (checks if site is up, serves maintenance page if down)
- `src/maintenance.html.ts` - **Auto-generated** from frontend build (do not edit manually)
- `../frontend/src/routes/maintenance/+page.svelte` - Source of truth for the maintenance page

## Deployment

The worker is deployed to Cloudflare Workers and acts as a failover:

1. First, it tries to fetch the main website
2. If the main site responds with 200 OK, it proxies the request through
3. If the main site is down or errors, it serves the maintenance page with 503 status

This ensures users always see a branded page even during deployments or downtime.
