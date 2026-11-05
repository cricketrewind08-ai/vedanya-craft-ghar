# Technical Architecture Document: Vedanya Craft Ghar

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +-------------------------------------+   +------------------------------------+ |
|  |     Storefront (Artisan Theme)      |   |       Admin Workspace (/admin)     | |
|  | - Next.js App Router (React Server  |   | - Responsive Admin Console         | |
|  |   Components + Client Islands)      |   | - Supabase Session Auth Guard      | |
|  | - Tailwind CSS + Lucide Icons       |   | - Setup Wizard & Status Command Ctr| |
|  | - Zustand (Cart / Quick Buy / Wish) |   | - Live Product Card Preview        | |
|  +-------------------------------------+   +------------------------------------+ |
+------------------------------------------+----------------------------------------+
                                           |
                                  HTTPS Requests
                                           v
+-----------------------------------------------------------------------------------+
|                             NEXT.JS APPLICATION LAYER                             |
|                                                                                   |
|  [ Middleware / Route Guards ]                                                    |
|  - Security Headers (CSP, FrameGuard, HSTS, Permissions Policy)                    |
|  - Rate Limiting (In-Memory / Storage Leaky Bucket for Checkout & Track)          |
|  - Admin Session Authentication Verification                                      |
|                                                                                   |
|  [ Public Server Actions & Route Handlers ]                                       |
|  - Guest Order Submission (Price / Stock / Mode Recalculation)                    |
|  - Track Order Server Endpoint (Brute-Force Protected)                            |
|  - Custom Enquiry Form (MIME / Size Verification, Private Upload)                 |
|                                                                                   |
|  [ Admin Server Actions ]                                                         |
|  - Order Approval / Rejection / Status Transitions                                |
|  - Product & Variant CRUD with Stock Audit                                        |
|  - Store Settings & Mode Mutation Engine                                          |
|                                                                                   |
|  [ Client Separation ]                                                            |
|  - lib/supabase/client.ts : Browser Anon Client (Cookie Auth)                     |
|  - lib/supabase/server.ts : Server Action Session Client (Cookie-based RLS)       |
|  - lib/supabase/admin.ts  : Service Role Client (server-only, Internal mutations) |
+------------------------------------------+----------------------------------------+
                                           |
                              Postgres Connection / RPC
                                           v
+-----------------------------------------------------------------------------------+
|                           SUPABASE BACKEND PLATFORM                               |
|                                                                                   |
|  [ Supabase Auth ]                                                                |
|  - Owner & Staff Email/Password Sessions (Public Sign-ups Disabled)               |
|                                                                                   |
|  [ PostgreSQL 17 Database ]                                                       |
|  - Row Level Security (RLS) enabled on all 16 tables                              |
|  - Atomic Order Numbering Sequence (`VCG-YYYY-####`)                              |
|  - Transactional Stored Procedures (RPC):                                         |
|    * `create_order(...)`                                                          |
|    * `approve_order(...)` (FOR UPDATE locking on inventory)                       |
|    * `reject_order(...)` / `cancel_order(...)` (Release reservation)              |
|    * `update_order_status(...)` (State machine enforcement)                       |
|  - Snapshot Archiving (`business_snapshot` in orders)                             |
|                                                                                   |
|  [ Supabase Storage ]                                                             |
|  - `product-images`: Public Read, Admin Write/Delete                              |
|  - `store-assets`: Public Read, Admin Write (Logo / Hero Banner)                  |
|  - `custom-order-references`: Strictly Private, Signed URL generation only        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Key Libraries

| Component | Choice | Reason / Specification |
|---|---|---|
| **Framework** | Next.js (App Router, React 19) | Server-first rendering, streaming SSR, built-in API route handlers, strict TypeScript. |
| **Styling** | Tailwind CSS v3 | Custom artisanal token mapping (Warm Ivory, Sand, Terracotta, Sage, Espresso). |
| **Icons** | Lucide React | Consistent, lightweight SVG icon set. |
| **State Management** | Zustand | Ephemeral client storage with `localStorage` hydration for Cart & Quick Purchase. |
| **Form Handling** | React Hook Form + Zod | Reusable schema validation on both client browser and Next.js server actions. |
| **Database & Auth** | Supabase (PostgreSQL 17) | RLS security, transactional RPCs, secure Storage buckets, Cookie auth. |
| **PDF Generation** | jsPDF + AutoTable | Reliable cross-platform client and server PDF generation with custom ₹ symbol rendering. |
| **Testing** | Vitest | Lightning-fast unit & integration testing for calculations, validators, and state machines. |

---

## 3. Security Architecture & Boundary Isolation

### 3.1 Client Boundaries
- `lib/supabase/client.ts`: Exposes public anonymous client for non-sensitive reads (products, active categories, public settings).
- `lib/supabase/server.ts`: Uses `@supabase/ssr` with Next.js cookie store for authenticated admin sessions.
- `lib/supabase/admin.ts`: Uses `SUPABASE_SERVICE_ROLE_KEY`. Enforced with `import "server-only"`. Any inadvertent import into client bundles causes an immediate build-time compilation failure.

### 3.2 Dual Validation Strategy
Every mutation (order request, product save, setting update) is validated using identical Zod schemas in two passes:
1. **Client Pass:** Immediate inline feedback on field formats, Indian phone regex, and PIN codes.
2. **Server Pass:** Authoritative re-validation. Client-submitted prices, discounts, and shipping amounts are systematically dropped. The server queries the database for active prices and computes taxes/totals independently.

### 3.3 Concurrency & Stock Safety
To prevent race conditions where two simultaneous approvals oversell limited handcrafted stock:
- Stock approval executes via the PostgreSQL function `approve_order(p_order_id, p_admin_id)`.
- It executes `SELECT stock_quantity, reserved_quantity FROM products/variants WHERE id = ... FOR UPDATE`.
- If `(stock_quantity - reserved_quantity) < requested_quantity`, the transaction rolls back with a clear SQL exception.
- Approved quantities increment `reserved_quantity` atomically.

---

## 4. Directory & Module Structure

```
vedanya-craft-ghar/
├── docs/
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── CHECKLIST.md
│   ├── OWNER_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── SECURITY_CHECKLIST.md
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Cookie server client
│   │   └── admin.ts         # Service-role client (server-only)
│   ├── validators/         # Zod schemas (order, product, settings)
│   ├── utils/              # Currency formatting, date formatters, sanitizers
│   ├── pdf/                # Order summary PDF generators
│   └── whatsapp/           # Deep-link formatter & API provider stub
├── components/
│   ├── storefront/         # Warm boutique components (Hero, ProductCard, QuickBuy)
│   ├── admin/              # Management modules, live preview, data tables
│   ├── shared/             # Reusable UI primitives, badges, inputs
│   └── pdf/                # PDF templates
├── app/
│   ├── (storefront)/       # Public boutique pages
│   │   ├── page.tsx        # Homepage
│   │   ├── shop/           # Catalog
│   │   ├── product/[slug]/ # Product details
│   │   ├── cart/           # Cart view
│   │   ├── checkout/       # 3-step guest checkout
│   │   ├── order/[id]/     # Confirmation & tracking redirect
│   │   ├── track-order/    # Rate-limited lookup
│   │   ├── custom-order/   # Custom enquiry form
│   │   └── policy/[type]/  # Editable policy viewer
│   ├── admin/              # Owner administration workspace
│   │   ├── login/
│   │   ├── setup/          # First-time onboarding wizard
│   │   ├── orders/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── categories/
│   │   ├── custom/
│   │   ├── customers/
│   │   └── settings/
│   └── api/                # Protected webhook and tracking endpoints
├── supabase/
│   ├── migrations/         # Versioned SQL migrations
│   └── seed.sql            # Demo artisan data with is_demo flag
└── tests/
    └── unit/               # Vitest unit tests for pricing, validation, state
```

