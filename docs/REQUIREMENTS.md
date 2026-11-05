# Requirements Document: Vedanya Craft Ghar
**Project:** Vedanya Craft Ghar E-Commerce Storefront + Owner Management Platform  
**Target Market:** India (Currency: ₹ INR, Timezone: IST)  
**Primary Users:** 
1. **Store Owner (Teacher):** Non-technical artisan owner managing products, inventory, custom requests, orders, and business settings.
2. **Customers (Shoppers):** Visitors looking for handcrafted crochet products, hair accessories, scrunchies, and custom handmade gifts.

---

## 1. Core Principles & Philosophy
1. **Zero Hardcoded Business Details:** Name, tagline, and Instagram are the only initial defaults. All addresses, phone numbers, WhatsApp, policies, delivery fees, and processing times are stored in Supabase and edited via the owner dashboard.
2. **100% Owner Independence:** The owner must be able to change settings, pause store orders, update stock, approve orders, and manage content with zero developer intervention.
3. **Dual UX Separation:**
   - **Storefront:** Warm Minimalist Artisan Boutique (Warm Ivory `#F8F4EC`, Sand `#E9DCCB`, Terracotta `#B97968`, Sage `#A3AA8C`, Deep Espresso `#453C35`).
   - **Owner Dashboard (`/admin`):** Crisp, ultra-clean, functional, highly readable on mobile and desktop without developer jargon.
4. **Two-Stage Approval Order Pipeline:** There is no automatic online gateway charging. Quick Purchase / Cart checkout submits a *Provisional Order Request*. Stock is never immediately deducted on submission; the owner reviews, can adjust delivery charges, and clicks "Approve" (which reserves stock) or "Reject" (with reason). Payment is arranged directly between customer and owner.
5. **Production-Grade Security:** Row Level Security (RLS) on all tables, Zod validation on client and server, rate limiting, anti-brute force tracking protection, CSRF mitigation, server-only secret isolation, strict CSP and HTTP security headers.

---

## 2. Functional Requirements

### 2.1 Store Settings & Operating Modes
- **Single-row `store_settings` configuration:**
  - Business identity: name, tagline, logo, banner, description / about story.
  - Contact: address, phone, WhatsApp number, email, Instagram handle, social links.
  - Commercial terms: flat shipping charge, free-shipping threshold, minimum order amount, low-stock threshold, estimated processing time.
  - Operating modes:
    - `OPEN`: standard ordering enabled.
    - `TEMPORARILY_CLOSED`: browse-only, Add to Cart / Buy Now disabled with banner.
    - `VACATION`: custom owner return date + message, checkout disabled.
    - `CUSTOM_ORDERS_ONLY`: checkout disabled, custom enquiry form active.
    - `MAINTENANCE`: public site displays warm maintenance notice, `/admin` remains accessible.
  - Policy content: Return & cancellation, shipping & delivery, privacy, terms & conditions.
  - Setup status: `is_setup_completed` flag driving the First-Time Setup Wizard.
- **Graceful Unconfigured States:** If WhatsApp/phone/address are unconfigured, no broken links or `wa.me/undefined` are displayed. Admin dashboard surfaces an action checklist banner.

### 2.2 Storefront Experience
- **Pages:** Home, Shop (with category filters, search, sorting), Category collections, Product Detail, Cart drawer & page, Checkout, Order Confirmation, Track Order, Custom Order Enquiry, About, Contact, and Policy pages.
- **Product Details:** Multi-image gallery with zoom, pricing (and compare-at price), variant selector (size, colour, pack size), availability badge (`READY_TO_SHIP`, `MADE_TO_ORDER`, `PRE_ORDER`, `OUT_OF_STOCK`), stock status, preparation days, Add to Cart, Buy Now ("Quick Purchase"), Web Share API + copy link, related products, and sticky bottom action bar on mobile.
- **Cart & Quick Buy:**
  - Multi-item persistent cart (Zustand client cache, validated server-side on submission).
  - Quick Purchase ("Buy Now") isolates the single selected item without tampering with existing cart items.
  - Both paths share the same order validation, pricing recalculation, and stock reservation RPC logic.

### 2.3 Two-Stage Order Pipeline
- **Stage 1 (Customer Submission):**
  - Guest checkout (no account needed).
  - Validated fields: Indian 10-digit mobile (`^[6-9]\d{9}$`), 6-digit PIN code, state dropdown, address lines, landmark, notes.
  - Atomic sequence-based human-readable order number (`VCG-YYYY-####`).
  - Server recalculates prices and shipping (client prices are discarded).
  - Creates order in `PENDING_APPROVAL`.
  - Captures immutable `business_snapshot`.
  - Generates downloadable "PROVISIONAL ORDER REQUEST SUMMARY" PDF (explicitly noting awaiting confirmation; no tax claims).
  - WhatsApp share button with pre-filled order text (`wa.me` deep link).
- **Stage 2 (Owner Decision):**
  - Appears in owner dashboard with unread badge.
  - Owner reviews items, address, and notes.
  - Can adjust shipping or add custom charges with mandatory justification note.
  - Actions:
    - **Approve:** Stock is reserved in an atomic DB transaction. If insufficient, approval is blocked.
    - **Reject:** Requires reason. Order marked `REJECTED`.
  - Valid status flow: `PENDING_APPROVAL -> CONFIRMED -> PREPARING -> READY_TO_SHIP -> SHIPPED -> DELIVERED` (plus terminal `REJECTED`, `CANCELLED`).
  - Owner can mark manual payment status (`UNPAID`, `PAID`, `REFUNDED`).
  - On `CONFIRMED`, customer can download "CONFIRMED ORDER SUMMARY" PDF.

### 2.4 Secure Order Tracking
- Public route: `/track-order`.
- Authentication: Order ID + 10-digit customer mobile verified strictly server-side.
- Rate limiting: max 5 failed attempts per IP/order per 15 minutes to prevent phone enumeration.
- Generic failure messages without disclosing whether order number or phone was mismatched.
- Displays status milestone timeline, confirmed pricing, owner payment instructions, PDF download, and WhatsApp support link.
- Never leaks customer PII or internal owner notes.

### 2.5 Custom Order Enquiries
- Public enquiry form: concept description, desired colours/materials, quantity, optional reference image upload (stored in private bucket), target date, contact details.
- Captcha and rate limited.
- Owner views enquiry, provides quote, sends quote via WhatsApp link, updates status (`NEW`, `QUOTED`, `ACCEPTED`, `DECLINED`), and can convert accepted enquiry into a pending order.

### 2.6 Owner Administration Modules (`/admin`)
1. **Overview Dashboard:** Revenue (only from `PAID`/`DELIVERED` orders), order breakdown, low-stock warnings, store mode toggle, quick actions, setup wizard checklist.
2. **Product Manager:** Drag-to-reorder images, live storefront preview card, variants (options, pricing deltas, variant stock), availability modes, archive/restore.
3. **Categories:** Manage names, slugs, descriptions, icons, display order.
4. **Order Command Center:** Filter tabs, search, order details, approval actions, price adjustments, status transitions, manual payment toggle, WhatsApp direct contact link.
5. **Manual Order Entry:** Log offline / WhatsApp / Instagram orders with source attribution; optional stock deduction bypass.
6. **Inventory Matrix:** Real-time stock counts, reserved counts, low-stock alerts, adjustment logging.
7. **Custom Enquiries:** Workflow to manage, quote, and convert custom artisan requests.
8. **Customer Directory & Analytics:** Grouped by phone, lifetime order count, CSV export (with formula injection sanitisation).
9. **Settings & Setup Wizard:** Step-by-step onboarding, store modes, delivery rates, policies, audit history, backup guidance.

---

## 3. Non-Functional Requirements
- **Performance:** Sub-second page loads, `next/image` optimisation, mobile Lighthouse score ≥ 90.
- **Accessibility:** WCAG AA compliance, semantic markup, full keyboard navigation, accessible color contrast.
- **Localization:** Indian Rupee formatting (`en-IN`), Indian phone & PIN validation, IST date representations.
- **Reliability:** Concurrency-safe stock reservation using PostgreSQL transactions and `SELECT ... FOR UPDATE`.

