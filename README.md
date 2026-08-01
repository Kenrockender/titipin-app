# Titipin — Personal Jastip Platform

A full-stack web app for running a personal *jasa titip* (personal shopper) business, built from the PRD, database schema, tech-stack guide, and folder-structure blueprint. It covers the whole flow end-to-end: storefront → custom requests → checkout with DP → admin pipeline → **Shopper Mode** → out-of-stock / store-credit pivot.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase-ready (`@supabase/ssr`).

The app **runs immediately on built-in mock data** — no accounts or keys needed. When you're ready, connect a real Supabase project and the SQL + client code is already in place.

## Quick start

```bash
cd titipin-app
npm install
npm run dev
```

Open http://localhost:3000.

Admin access is **email-based**. On the **Login** page:
- Log in with **`admin@titipin.id`** (any password) → redirects to the Admin dashboard (pipeline, request inbox, orders, catalog, pricing engine, Shopper Mode).
- Log in with **any other email** (e.g. `rani@example.com`) → customer view (storefront, cart, dashboard, requests, profile).
- Quick buttons for both are on the login card. Change the admin email via `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local`.

## Try the full flow

1. **Customer:** browse `/catalog` → open a product → *Add to Cart* → `/cart` → pick a DP % → *Place Order*.
2. Land on the order page, *Upload receipt* → *Confirm DP Payment*.
3. **Admin:** log in as Admin → **Shopper Mode**. The paid item now appears grouped by store. Tap **Secured** (fires the mock "I just secured your item!" WhatsApp) or **Out of stock**.
4. Mark an item **Out of stock**, then as the customer open that order → choose **Keep as Store Credit**. The balance updates on the Profile page.
5. **Admin → Request Inbox:** open the built-in request, use the **Quote** calculator (base × padded FX + upside % + flat fee), and send the quote.
6. **Admin → Pricing Engine:** change the markup — every quote across the app recalculates instantly.

The floating **WhatsApp widget** is site-wide and pre-fills a contextual message (product name on product pages, order ID on the dashboard).

## Project structure

Follows the blueprint in *Next.js Folder Structure*:

```
app/
  (public)/    landing, catalog, catalog/[productId], request
  (auth)/      login, register
  (customer)/  dashboard, dashboard/[orderId], profile, cart (checkout)
  admin/       overview, requests, orders, catalog, pricing, shopper-mode
components/    ui/ · layout/ (Navbar, Footer, WhatsApp) · catalog/ · dashboard/
lib/           pricing.ts · format.ts · mock-data.ts · store.tsx · supabase/
types/         database.types.ts  (mirrors the 9-table schema)
supabase/      schema.sql · seed.sql
middleware.ts  admin gate (Supabase session check when connected)
```

`lib/pricing.ts` is the single source of truth for the money math (upside %, flat fee, padded exchange-rate buffer, DP calculation).

## Connecting a real Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor (optionally `seed.sql`).
3. Create Storage buckets: `product_images` (Public), `receipts` (Private), `request_uploads` (Private).
4. Copy `.env.local.example` → `.env.local` and fill in the URL + keys, your `NEXT_PUBLIC_ADMIN_EMAIL`, and `NEXT_PUBLIC_WA_NUMBER`.
5. Replace the mock actions in `lib/store.tsx` with Supabase queries (clients are ready in `lib/supabase/`), and uncomment the admin gate in `middleware.ts`.

With the env vars blank, the app stays in mock mode.

## Deploy

Push to GitHub and import into [Vercel](https://vercel.com) (creator of Next.js). Add the same env vars in the Vercel dashboard. The free tier is plenty to start.

## Notes on scope

Payments use the PRD's **MVP fallback** (manual transfer / QRIS + receipt upload). Midtrans/Xendit and the automated WhatsApp Cloud API are Phase 2 — the code is structured so they slot into `lib/store.tsx` and a new `/api` route without touching the UI.

## Adding real product photos

Catalog images now load from `public/products/`, named by product id (e.g. `prod-labubu.jpg`). Drop your own photos there and they appear automatically — no code changes. Until a photo exists, a clean Titipin placeholder shows instead of a broken image. See `public/products/README.txt` for the full list of ids. You can also set any image per product via **Admin → Catalog → edit → Image URL** (a `/products/...jpg` path or a full URL both work).
