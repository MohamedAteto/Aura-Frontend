# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a shared API server and the **Aura Store** — an enhanced e-commerce frontend.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

**Env vars (set in Replit Secrets):**
- `SESSION_SECRET` — session secret for API server
- `VITE_API_URL` (in `artifacts/aura/.env`) — points to the deployed .NET 8 backend (Railway). Default: `https://aura-backend-production.up.railway.app`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (api-server artifact)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend (aura)**: React + Vite + Tailwind CSS v4 + wouter + framer-motion + recharts + sonner + axios

## Where things live

```
artifacts/
  api-server/   — Express 5 API server (PORT 8080, path /api)
  aura/         — Aura Store frontend (PORT 19345, path /)
    src/
      context/        — AuthContext, WishlistContext
      components/     — Navbar, Footer, ProductCard, AdminLayout, etc.
      pages/          — Home, Shop, ProductPage, Cart, Login, Register, Orders, Profile, Wishlist
      pages/admin/    — Dashboard, AdminProducts, AdminOrders, AdminUsers, AdminCoupons
      lib/api.ts      — Axios client + mediaUrl helper
  mockup-sandbox/ — Canvas component preview server
lib/            — Shared TypeScript libraries
```

## Architecture decisions

- **wouter** used for routing (not react-router-dom) — already in catalog, smaller bundle
- **Wishlist** is localStorage-only (no backend endpoint needed) — stored in `aura_wishlist`
- **Auth tokens** stored in `aura_token` / `aura_user` — localStorage when "remember me" is checked, sessionStorage otherwise
- **VITE_API_URL** must point to the .NET 8 backend; CORS must be configured on the backend to allow the Replit preview domain
- **recharts** used for admin dashboard charts (Area, Bar, Pie); all chart cards use consistent dark tooltip styles

## Product

- **Home** — animated hero with typewriter effect, floating product cards, ticker strip, featured products, promo showcase, category browsing
- **Shop** — product grid with sidebar filters (category, price range, rating, sort), pagination, real-time search
- **Product Detail** — image, variations (size/color), wishlist, add to cart, reviews with star rating form
- **Cart** — line items with quantity editing, coupon code support, order checkout
- **Orders** — order history with expandable status stepper, simulated payment (demo)
- **Profile** — update name, change password with strength indicator and visibility toggle
- **Wishlist** — localStorage-based saved products with heart toggle on every product card
- **Admin Dashboard** — KPI cards with trend indicators, revenue area chart, order status pie chart, top products, low-stock alert table
- **Admin Products / Orders / Users / Coupons** — full CRUD management tables

## User preferences

- Dark purple Aura theme (#07060a bg, #a78bfa violet, #7dd3fc sky blue)
- DM Sans + Fraunces serif fonts
- Framer Motion animations throughout
- Sonner toasts for all feedback

## Gotchas

- Set `VITE_API_URL` in `artifacts/aura/.env` to the actual Railway backend URL
- Backend CORS must allow the Replit preview domain for API calls to work
- Admin routes require `role === 'Admin'` in the JWT — demo creds: `admin@shop.com` / `Admin123!`
- Do not run `pnpm dev` at workspace root — use `restart_workflow` instead

## Pointers

- `.local/skills/pnpm-workspace` — monorepo conventions
- `.local/skills/react-vite` — Vite artifact patterns
