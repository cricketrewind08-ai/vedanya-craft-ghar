# Pre-Launch Security Checklist: Vedanya Craft Ghar

| Category | Control / Verification | Status | Details |
| :--- | :--- | :---: | :--- |
| **Row Level Security (RLS)** | Enabled on all public tables | PASS | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` executed on `orders`, `order_items`, `products`, `store_settings`, `categories`, `custom_order_requests`. |
| **Key Isolation** | Service Role Key isolated | PASS | `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly inside `lib/supabase/admin.ts` which imports `server-only`. It is never bundled into client JS. |
| **Customer Order Privacy** | Guest orders not publicly enumerable | PASS | Public anonymous clients cannot `SELECT * FROM orders`. Orders can only be queried through the rate-limited `get_order_by_tracking_hash` function with phone number verification. |
| **Formula Injection** | CSV Export Sanitization | PASS | In `/admin/customers`, all exported cells are tested for leading formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) and escaped with a leading single quote before CSV generation. |
| **Stock Race Conditions** | Atomic inventory locking | PASS | Stock checks and reservations use PostgreSQL stored procedures with `FOR UPDATE` row locks (`create_order_rpc`, `approve_order_rpc`, `reject_or_cancel_order_rpc`). Concurrent orders cannot oversell stock. |
| **Input Validation** | Schema validation with Zod | PASS | Indian 10-digit mobile phone numbers (`^[6-9]\d{9}$`), 6-digit PIN codes (`^\d{6}$`), and prices are strictly validated on both client and server before database write. |
| **HTTP Security Headers** | Modern defensive headers | PASS | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=63072000`, `Referrer-Policy: strict-origin-when-cross-origin` configured in Next.js headers and middleware. |
| **Revenue Integrity** | Non-provisional revenue reporting | PASS | Dashboard analytics calculate realized revenue strictly from orders marked `PAID` or `DELIVERED`. Unconfirmed order requests do not inflate metrics. |
| **Authentication Guard** | Owner route protection | PASS | Middleware intercepts all `/admin/*` routes and redirects unauthorized visitors to `/admin/login`. |
| **Fallback Handling** | Graceful partial configuration | PASS | Missing contact numbers (e.g. unconfigured WhatsApp or phone) are omitted from public UI rather than displaying placeholder `null` or broken links. |
| **Payment Integrity** | Zero false payment gateway claims | PASS | Clear communication that orders are requests confirmed by the artisan with offline UPI/QR code payment instructions after stock reservation. |

