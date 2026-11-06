# Mona Wear Storefront (مونا وییر)

Persian (RTL) premium fashion storefront built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui-style components + Lucide + Framer Motion**, integrated with the **Sazito Client SDK v1.3.3** (`@sazito/client-sdk`). **Booking is intentionally not implemented.**

> Status: the code type-checks, lints and builds (`npm run build`). It has **not** been tested against a real Sazito store, real payment gateways or a full browser session. See "Needs live verification" below.

## Windows quick start (PowerShell)

1. Install **Node.js 20 or newer** from https://nodejs.org (LTS) if needed. Check with `node -v`.
2. Extract the ZIP, then in PowerShell:

```powershell
cd C:\path\to\monawear-storefront
npm install
Copy-Item .env.example .env.local
notepad .env.local      # fill in SAZITO_DOMAIN (see below), then save
npm run dev
```

3. Open http://localhost:3000

Without `SAZITO_DOMAIN` the site still starts and shows a "connection not configured" notice; it never shows fake products.

Other scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm start`, `npm run docs:api`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `SAZITO_DOMAIN` | **Yes** | Store domain **without** `https://` (e.g. `yourstore.sazito.com`) |
| `SAZITO_API_KEY` | Only if your store needs one | Server-side only, never exposed to the browser |
| `NEXT_PUBLIC_SITE_URL` | Yes for production | Canonical URLs, sitemap, Open Graph. Use `http://localhost:3000` locally |

## Architecture (as approved)

- **Browser → same-origin routes only.** UI code never talks to Sazito. It calls `/api/sazito/<module>/<operation>` through `src/lib/api/client.ts` (`sazitoFetch`).
- **67 dedicated route handlers** (one per Sazito operation) in `src/app/api/sazito/**`, each a few lines using `defineRoute()` (`src/lib/sazito/route.ts`): strict Zod validation, same-origin check on writes, per-request SDK client, original `{data}/{error}` contract preserved.
- **HttpOnly cookies** hold the JWT (`mw_auth`) and the SDK guest credentials (`mw_cart`, `mw_invoice`, `mw_ship`, `mw_pay`, `mw_discount`). The JWT is never returned to the browser. Credential cookies change only after a success or a definite 4xx answer (the SDK itself clears credentials on any error, including network failures).
- **Server components** (SEO pages) call the SDK directly via `src/lib/sazito/services.ts`.
- **URL preservation:** `src/app/[...slug]/page.tsx` resolves any path through Sazito's entity-route API (product, category, CMS page, blog post) instead of guessing URL patterns.
- **Booking:** never imported or called. Zod schemas are `.strict()`, so `schedulerBookingAttributes` / `bookingAttributes` are rejected; ESLint forbids `.booking`.
- Full route table: `docs/sazito-api-map.md` (regenerate with `npm run docs:api`, source: `src/lib/sazito/routes.json`).

### Seeing every call in Chrome DevTools

DevTools → **Network → Fetch/XHR**. Each operation is its own request, e.g. `GET /api/sazito/products/list?page=1`, `POST /api/sazito/cart/add-item`, `POST /api/sazito/invoices/create`. In development, responses carry `X-Sazito-Module`, `X-Sazito-Operation`, `X-Sazito-Request-Id`, `X-Sazito-Upstream-Ms` and `Server-Timing`. The `npm run dev` terminal logs each upstream SDK call (method, route, upstream path with query *names* only, status, duration, request id). Cookies, tokens, bodies and customer data are never logged. Server-to-server calls cannot appear in the browser, by design.

## Implemented

Homepage (announcement marquee, header, mega menu from Sazito menu/categories, search overlay, hero slideshow, category tiles, product rails, campaign banners, masonry gallery, Shop the Look, trust strip, FAQ, recently viewed, footer from CMS/general info) · category and "all products" listing with price/availability/discount filters, sorting, pagination, active chips, mobile filter drawer, skeletons, empty states · search page and live search · product page (gallery with thumbnails/zoom/lightbox, variants and colors, stock, quantity, size-guide dialog, description/specs, dynamic product forms with file upload, reviews when enabled, related products, JSON-LD) · cart drawer and page · checkout (address with province/city, shipping rates, coupon, wallet credit, payment methods, gateway redirect/POST, pending polling, return handler, result page) · registration, password login, mobile OTP, email login, password reset · profile, order history, order detail, order feedback, wallet · order tracking · SEO (metadata, canonical, breadcrumbs, product JSON-LD, sitemap, robots) · RTL/Persian throughout, reduced-motion support.

## Needs live verification (requires your real Sazito domain)

Everything that talks to Sazito: real product/price/stock data; the **price unit** (set `priceDivisor` in `src/config/site.ts` once you know if prices are Toman or Rial); the in-stock filter semantics (the SDK adds the filter only when `availableOnly === false`, which this project follows); sort direction of `price`; variant attribute shapes (size/color); the product description attribute name; cart/invoice cookies across steps; guest checkout; login/OTP flows; `users/merge` after login; wallet; reviews; **payment gateways and the gateway return parameters** (`/checkout/return` accepts several common names and falls back to the cookie); pending-payment polling; order tracking for guests.

## Known limitations (not faked)

- **No color filter** — the SDK's product list has none. Swatches come from real variant data.
- **No newsletter** — the SDK has no endpoint for it.
- **Payment steps needing OTP or receipt upload** (`show_otp_modal`, `UPLOAD`) show a "not supported yet" message; their payload format is not documented in the SDK.
- **Checkout dynamic form:** the `invoices/add-form` route exists but there is no UI, because the SDK does not say which form to show.
- **Order status:** the SDK's Order type has no status fields, so tracking shows order contents only.
- `images/upload` and `images/delete` routes exist but are disabled (`siteConfig.featureFlags.imageAdminRoutes`).
- Hero, mosaic, campaign and FAQ content in `src/config/site.ts` are temporary placeholders (gradients/generic text). Replace with licensed photography and real copy in `public/images`.
- `next.config.mjs` allows any HTTPS image host; restrict `remotePatterns` to your Sazito CDN domain for production.

## Deploying

`npm run build && npm start` on Node 20+. Set the three environment variables on the host. Production hides debug headers and request logging.
