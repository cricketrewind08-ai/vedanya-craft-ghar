# Master Project Progress Checklist: Vedanya Craft Ghar

## Phase 1: Foundation & Architecture Setup
- [x] Inspect workspace and initialize project structure
- [x] Configure TypeScript, Next.js, and core dependencies
- [x] Write architectural documentation: `REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATABASE.md`
- [x] Design brand design tokens & Tailwind theme (Warm Ivory, Sand, Terracotta, Sage, Deep Espresso)
- [x] Implement Supabase client triad:
  - [x] `lib/supabase/client.ts` (Browser anonymous client)
  - [x] `lib/supabase/server.ts` (Server cookie-based client)
  - [x] `lib/supabase/admin.ts` (Isolated service-role client with `server-only`)
- [x] Author comprehensive SQL migrations:
  - [x] Complete table schema with foreign keys, constraints & sequences
  - [x] Row Level Security (RLS) policies on all tables
  - [x] Storage buckets configuration (`product-images`, `store-assets`, `custom-order-references`)
  - [x] Concurrency-safe PostgreSQL RPC functions (`create_order_rpc`, `approve_order_rpc`, `reject_order_rpc`, `fulfill_order_rpc`)
- [x] Author initial seed data script (`supabase/seed.sql`) with `is_demo = true` flags
- [x] Validate build & configuration integrity (`npm run test` or check)
- [x] Provide Supabase project migration instructions to user and request keys
- [x] Live database migrated and verified (tables created, seeded with demo categories & products)

## Phase 2: Settings Engine & Store Operating Modes
- [x] Implement unified settings service (`lib/services/settings.ts`) with fallback handling
- [x] Implement React SettingsProvider & hook (`components/providers/settings-provider.tsx`)
- [x] Server-side enforcement of store operating modes (`OPEN`, `TEMPORARILY_CLOSED`, `VACATION`, `CUSTOM_ORDERS_ONLY`, `MAINTENANCE`)
- [x] Client-facing operating mode banner (`StoreModeBanner`)
- [x] Server actions for settings & 1-click mode switching with audit diffs (`app/actions/settings.ts`)
- [x] Dynamic storefront navbar and footer with graceful unconfigured contact omission
- [x] Comprehensive unit tests for operating modes and settings validation (100% pass)

## Phase 3: Storefront Boutique UI
- [x] Responsive navigation and footer wired to store settings (`StorefrontNavbar`, `StorefrontFooter`)
- [x] Homepage with Artisan Hero, Featured Collections, Brand intro, and Craftsmanship section
- [x] Product catalog page (`/shop`) with category filtering, search query, and price/newest sorting
- [x] Rich product detail page (`/product/[slug]`):
  - [x] Multi-image zoom gallery with thumbnail selector
  - [x] Dynamic variant selector with price modifier & live stock display
  - [x] Preparation days and availability mode badge (`READY_TO_SHIP`, `MADE_TO_ORDER`, etc.)
  - [x] Material & dimensions specifications
  - [x] Web Share API & Copy Link
  - [x] Sticky mobile bottom action bar (`Add to Basket` + `Buy Now`)
  - [x] Related products recommendation grid
- [x] Quick Purchase ("Buy Now") modal on product cards & detail page (`QuickBuyModal`)
- [x] Global Cart Drawer with free-shipping milestone progress bar (`CartDrawer`)
- [x] Custom Order Enquiry page (`/custom-order`) with sequence request ID & WhatsApp link
- [x] About page (`/about`), Contact page (`/contact`), and dynamic Policy viewer (`/policy/[type]`)

## Phase 4: Cart, Checkout & Two-Stage Order Pipeline
- [x] Zustand persistent cart with slide-over drawer and full cart view (`/cart`)
- [x] Isolated Quick Purchase ("Buy Now") session state (bypasses cart without tampering)
- [x] 3-step guest checkout: Contact -> Delivery Address -> Review (`/checkout`)
- [x] Indian phone (`^[6-9]\d{9}$`) and 6-digit PIN code validation
- [x] Concurrency-safe atomic order creation RPC (`create_order_rpc`) with sequence order number (`VCG-YYYY-####`)
- [x] PDF Order Summary generator (`generateOrderSummaryPDF` via jsPDF + autoTable):
  - [x] "PROVISIONAL ORDER REQUEST SUMMARY" (for pending status)
  - [x] "CONFIRMED ORDER SUMMARY" (for approved status with payment instructions)
  - [x] Strictly uses `business_snapshot` and avoids false tax/GST claims
- [x] Order Confirmation page (`/order/[orderNumber]`) with PDF download and "Send to Owner on WhatsApp" deep-link
- [x] Secure rate-limited order tracking portal (`/track-order`) with 6-stage milestone progress stepper and phone masking

## Phase 5: Owner Management Platform (`/admin`)
- [ ] Supabase authentication & route protection middleware
- [ ] First-Time Setup Wizard for unconfigured stores
- [ ] Overview dashboard with real revenue metric and low-stock alerts
- [ ] Product management with multi-photo upload and live storefront card preview
- [ ] Category manager (reorder, toggle visibility)
- [ ] Order Command Center (filter tabs, stock-safe approval, rejection, adjustments, WhatsApp link)
- [ ] Manual order logger with source attribution
- [ ] Inventory matrix & low-stock monitor
- [ ] Custom order enquiry management & conversion to order
- [ ] Customer directory & formula-sanitized CSV export
- [ ] In-app notification center

## Phase 6: Hardening, Security & Provider Integrations
- [ ] WhatsApp Business Cloud API notification boundary / stub
- [ ] Full audit logging for administrative mutations
- [ ] Security headers (CSP, FrameGuard, HSTS, Permissions Policy)
- [ ] Backup & recovery documentation (`docs/BACKUP_RECOVERY.md`)
- [ ] Pre-launch security checklist (`docs/SECURITY_CHECKLIST.md`)

## Phase 7: Verification, QA & Public Deployment Preparation
- [ ] Unit & integration test suites (pricing, validation, transitions, concurrency)
- [ ] Owner handover guide (`docs/OWNER_GUIDE.md`)
- [ ] Production deployment guide (`docs/DEPLOYMENT.md`)
- [ ] Final lint, typecheck, and build verification

