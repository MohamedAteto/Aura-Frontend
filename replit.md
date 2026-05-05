# Aura Store

A premium dark-themed e-commerce frontend connected to a .NET 8 backend on Railway — Amazon/Jumia inspired with full shopping flow.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

**Env vars:**
- `SESSION_SECRET` — session secret for API server
- `VITE_API_URL` (in `artifacts/aura/.env`) — points to deployed .NET 8 backend. Default: `https://aura-backend-production.up.railway.app`

## Stack

- **Monorepo**: pnpm workspaces · Node.js 24 · TypeScript 5.9
- **API framework**: Express 5 (api-server artifact)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend (aura)**: React + Vite + Tailwind CSS v4 + wouter + framer-motion + recharts + sonner + axios

## Where things live

```
artifacts/
  api-server/   — Express 5 API server (PORT 8080, path /api)
  aura/         — Aura Store frontend (PORT 19345, path /)
    src/
      context/        — AuthContext, WishlistContext, CartContext
      components/     — Navbar (search), Footer, ProductCard (quick-view), AdminLayout
                        QuickViewModal, SearchAutocomplete, RecentlyViewed
                        CategoryStrip, TrustBadges, FeaturedCarousel, ScrollToTop
      pages/          — Home, Shop, ProductPage, Cart, Checkout, Login, Register
                        Orders, Profile, Wishlist
      pages/admin/    — Dashboard, AdminProducts, AdminOrders, AdminUsers, AdminCoupons
      lib/api.ts      — Axios client + mediaUrl helper
  mockup-sandbox/ — Canvas component preview server
lib/            — Shared TypeScript libraries
```

## Architecture decisions

- **wouter** for routing (not react-router-dom)
- **Wishlist** is localStorage-only (`aura_wishlist`) — no backend endpoint needed
- **Auth tokens** in `aura_token` / `aura_user` — localStorage (remember me) or sessionStorage
- **VITE_API_URL** must point to .NET 8 backend; CORS must allow Replit preview domain
- **recharts** for admin charts; **QuickViewContext** is a module-level object in App.tsx
- **Recently viewed** tracked in `aura_recently_viewed` localStorage (last 8 product IDs)

## Product

### User Features
- Auth: register, login with remember-me, JWT, role-based admin access
- Profile: update name, change password (strength indicator), avatar initial
- Orders: history with expandable status stepper, simulated payment

### Shopping Experience
- **Home**: animated hero, typewriter, floating cards, ticker, carousels, newsletter, trust badges
- **Shop**: grid/list toggle, sidebar filters (category, price, rating, sort), pagination, filter chips
- **Product Detail**: breadcrumb, image hover-zoom, size/color variants, rating histogram, buy now, recently viewed tracking, related products carousel
- **Search autocomplete**: real-time debounced search dropdown in Navbar with trending chips
- **Quick view modal**: click Eye on any product card to preview + add to cart without navigating
- **Recently viewed**: persisted strip shown at bottom of product pages
- **Wishlist**: localStorage heart toggle on every product card
- **Cart**: free-shipping progress bar, stepper qty, save for later, coupon codes
- **Checkout**: 3-step flow (Address → Payment → Review), shipping options, card UI preview, cash on delivery

### Admin Dashboard
- KPI cards (revenue, orders, users, products) with trend indicators
- Revenue area chart, order status pie chart, top products table, low-stock alerts
- Full CRUD: Products, Orders, Users, Coupons

## User preferences

- Dark purple Aura theme (#07060a bg, #a78bfa violet, #7dd3fc sky blue)
- DM Sans + Fraunces serif fonts
- Framer Motion animations throughout
- Sonner toasts for all feedback
- Amazon/Jumia inspired feature completeness

## Gotchas

- Set `VITE_API_URL` in `artifacts/aura/.env` to the Railway backend URL
- Backend CORS must allow Replit preview domain (`*.janeway.replit.dev` and `*.replit.dev`)
- Admin routes require `role === 'Admin'` in JWT — demo: `admin@shop.com` / `Admin123!`
- Do not run `pnpm dev` at workspace root — use `restart_workflow` instead
- CORS errors in dev preview are expected; the Railway backend controls allowed origins

## Pointers

- `.local/skills/pnpm-workspace` — monorepo conventions
- `.local/skills/react-vite` — Vite artifact patterns
