# Vedanya Craft Ghar
> **Handmade with love** · Public E-Commerce Storefront & Independent Owner Management Platform

Built with Next.js 15 (App Router, React 19), Tailwind CSS, TypeScript, and Supabase PostgreSQL.

---

## Brand Identity & Design System
- **Background Primary:** Warm Ivory `#F8F4EC`
- **Cards & Surfaces:** Sand `#E9DCCB`
- **Primary Accent:** Terracotta `#B97968`
- **Secondary Accent:** Sage `#A3AA8C`
- **Headings & Body:** Deep Espresso `#453C35`
- **Typography:** Playfair Display (Serif Headings) + Inter / Plus Jakarta Sans (UI & Body)

---

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the Supabase URL, anon key, and service role key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-server-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_BOOTSTRAP_EMAIL=teacher@example.com
```
> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` is strictly marked `server-only`. Never prefix it with `NEXT_PUBLIC_` and never import it into client bundles.

### 2. Apply Database Migrations to Supabase
You can apply the schema directly using the Supabase SQL Editor:
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project and navigate to **SQL Editor** -> **New Query**.
3. Copy the contents of `supabase/migrations/20260216000000_initial_schema.sql` and run the script.
4. *(Optional for local/demo)*: Run `supabase/seed.sql` to populate sample categories and demo products (tagged with `is_demo = true`).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npm test
```
All unit tests validate Indian Rupee currency formatting, 10-digit mobile regex (`^[6-9]\d{9}$`), 6-digit PIN validation, and CSV formula sanitization.

---

## Architectural Documentation
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) - Complete functional & non-functional requirements.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture, boundary isolation, and security model.
- [docs/DATABASE.md](docs/DATABASE.md) - Supabase schema, ERD, tables, constraints, and RPC functions.
- [docs/CHECKLIST.md](docs/CHECKLIST.md) - Live phase-by-phase implementation tracker.

