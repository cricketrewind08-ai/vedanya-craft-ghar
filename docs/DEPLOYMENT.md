# Production Deployment Guide: Vedanya Craft Ghar

This guide walks through deploying **Vedanya Craft Ghar** to production using **Vercel** and your live **Supabase** project.

---

## 1. Prerequisites

1. **GitHub Repository:** Push your local repository to GitHub.
2. **Supabase Live Project:** Already configured!
   - Project URL: `https://ykbaksjevsscpcahiswm.supabase.co`
   - Database migrated and ready.
3. **Vercel Account:** Free or Pro account on [vercel.com](https://vercel.com).

---

## 2. Environment Variables Checklist

Configure the following environment variables in your Vercel Project Settings (`Settings` → `Environment Variables`):

| Variable Name | Required | Description | Example / Value |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **YES** | Supabase REST URL | `https://ykbaksjevsscpcahiswm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **YES** | Public publishable key | *(Copy from your local .env.local)* |
| `SUPABASE_SERVICE_ROLE_KEY` | **YES** | Private service-role key | *(Copy from your local .env.local)* |
| `NEXT_PUBLIC_SITE_URL` | **YES** | Canonical production domain | `https://vedanyacraft.in` (or your `.vercel.app` domain) |
| `ADMIN_BOOTSTRAP_EMAIL` | Optional | Initial owner fallback email | `artisan@vedanyacraft.in` |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | Official Cloud API Phone ID | *(Leave blank to use free WhatsApp deep links)* |
| `WHATSAPP_ACCESS_TOKEN` | Optional | Official Cloud API Token | *(Leave blank to use free WhatsApp deep links)* |

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` to any client-facing prefix (do NOT prefix with `NEXT_PUBLIC_`). The application code strictly isolates it in `lib/supabase/admin.ts`.

---

## 3. Step-by-Step Vercel Deployment

1. **Log in to Vercel** and click **"Add New Project"**.
2. **Import Git Repository:** Select your `Vedayan craft` repository.
3. **Framework Preset:** Vercel will automatically detect **Next.js**.
4. **Root Directory:** Leave as `./` (workspace root).
5. **Environment Variables:**
   - Expand the **Environment Variables** section.
   - Paste the values from the checklist above for `Production`, `Preview`, and `Development`.
6. **Click "Deploy"**.
   - Build completes in approximately 60-90 seconds.
7. Vercel will assign a production URL (e.g. `https://vedanya-craft-ghar.vercel.app`).

---

## 4. Custom Domain Configuration (e.g., `vedanyacraft.in`)

1. In the Vercel Project Dashboard, navigate to **Settings** → **Domains**.
2. Enter your custom domain (e.g., `vedanyacraft.in` or `www.vedanyacraft.in`).
3. Add the DNS records provided by Vercel into your domain registrar (GoDaddy, Namecheap, Google Domains):
   - **Type A:** `@` → `76.76.21.21`
   - **Type CNAME:** `www` → `cname.vercel-dns.com`
4. SSL certificates are provisioned automatically by Vercel Let's Encrypt within 5 minutes.

---

## 5. Post-Deployment Verification Checklist

Once the production deployment is live, verify the following 5 user journeys:

1. **Storefront Browsing (`/` and `/shop`):**
   - Check that categories and products load smoothly.
   - Test category tabs and search filters.
2. **Product Detail & Responsive View (`/product/[slug]`):**
   - Verify image zoom and thumbnails.
   - Verify variant selection updates price.
   - Verify sticky bottom action bar appears on mobile screens.
3. **Guest Checkout Request (`/checkout`):**
   - Add an item to cart or click "Buy Now".
   - Enter Indian contact details and delivery address.
   - Confirm order creation: verify redirection to `/order/[orderNumber]`.
   - Download the **A4 Provisional Order Summary PDF** to verify rupee symbols (₹) and snapshots.
   - Click "Send Order to Owner on WhatsApp" to verify pre-filled text.
4. **Order Tracking (`/track-order`):**
   - Enter the generated order number and customer phone.
   - Verify that order status and masked phone number appear correctly.
5. **Owner Management Console (`/admin`):**
   - Navigate to `/admin` and log in.
   - Review pending order in Command Center.
   - Click "Approve & Lock Stock".
   - Update Store Operating Mode in `/admin/settings` and verify the announcement banner appears on the public storefront.

