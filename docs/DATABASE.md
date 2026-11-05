# Database Design & Schema Documentation: Vedanya Craft Ghar

## 1. Schema Overview

The database is built on **Supabase PostgreSQL 17**. All tables employ UUID primary keys (using `gen_random_uuid()`), strict NOT NULL constraints, sensible CHECK constraints, foreign key referential integrity with appropriate ON DELETE actions, and automatic `updated_at` triggers.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    store_settings ||--o{ settings_history : logs
    admin_users ||--o{ audit_logs : performs
    categories ||--o{ products : categorizes
    products ||--o{ product_images : has
    products ||--o{ product_variants : has
    products ||--o{ inventory_adjustments : logs
    product_variants ||--o{ inventory_adjustments : logs
    orders ||--o{ order_items : contains
    orders ||--o{ order_status_history : tracks
    products ||--o{ order_items : references
    product_variants ||--o{ order_items : references
    custom_order_requests ||--o{ orders : converts_to
    customers ||--o{ orders : places

    store_settings {
        uuid id PK
        text business_name
        text tagline
        text logo_url
        text banner_url
        text about_content
        text address
        text phone
        text whatsapp_number
        text email
        text instagram_url
        jsonb other_social
        text store_mode
        text mode_message
        date vacation_return_date
        numeric default_shipping_charge
        numeric free_shipping_threshold
        numeric min_order_amount
        integer low_stock_threshold
        text processing_time_text
        jsonb policies
        boolean custom_orders_enabled
        boolean is_setup_completed
        timestamptz updated_at
    }

    products {
        uuid id PK
        uuid category_id FK
        text title
        text slug UK
        text description
        numeric base_price
        numeric compare_at_price
        text availability_mode
        integer preparation_days
        integer stock_quantity
        integer reserved_quantity
        boolean track_inventory
        text material
        text dimensions
        boolean is_featured
        boolean is_archived
        boolean is_demo
        timestamptz created_at
        timestamptz updated_at
    }

    product_variants {
        uuid id PK
        uuid product_id FK
        text option_name
        text option_value
        numeric price_modifier
        integer stock_quantity
        integer reserved_quantity
        text sku
        timestamptz created_at
        timestamptz updated_at
    }

    orders {
        uuid id PK
        text order_number UK
        text tracking_hash
        text customer_name
        text customer_phone
        text customer_email
        jsonb shipping_address
        text order_notes
        text owner_notes
        text customer_visible_note
        text status
        text payment_status
        numeric subtotal
        numeric shipping_charge
        numeric adjustment_amount
        text adjustment_reason
        numeric discount_amount
        numeric final_total
        text order_source
        jsonb business_snapshot
        timestamptz created_at
        timestamptz updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid variant_id FK
        text product_title_snapshot
        text variant_snapshot
        integer quantity
        numeric unit_price
        numeric line_total
    }
```

---

## 3. Data Tables & Column Details

### 3.1 `admin_users`
Manages authorized owner and staff profiles linked to Supabase `auth.users`.
- `id` (UUID, PK) -> references `auth.users(id)` ON DELETE CASCADE
- `email` (TEXT, NOT NULL, UNIQUE)
- `full_name` (TEXT)
- `role` (TEXT, NOT NULL CHECK (`role IN ('OWNER', 'STAFF')`))
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 3.2 `store_settings`
Single-row configuration enforcing zero-hardcoded business info.
- Single-row enforced via `CONSTRAINT single_row_check CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)`.
- `store_mode` ENUM/CHECK: `'OPEN'`, `'TEMPORARILY_CLOSED'`, `'VACATION'`, `'CUSTOM_ORDERS_ONLY'`, `'MAINTENANCE'`.
- Default shipping rules: `default_shipping_charge`, `free_shipping_threshold`, `min_order_amount`.
- Policies stored as structured JSONB: `{ return_policy, shipping_policy, privacy_policy, terms_conditions }`.
- `is_setup_completed` (BOOLEAN DEFAULT FALSE).

### 3.3 `settings_history`
Audit log of all configuration adjustments made by administrators.
- `id` (UUID, PK), `changed_by` (UUID FK admin_users), `diff` (JSONB), `created_at`.

### 3.4 `categories`
- `id` (UUID, PK), `name` (TEXT, NOT NULL), `slug` (TEXT, UNIQUE), `description` (TEXT), `display_order` (INT), `is_hidden` (BOOL), `is_demo` (BOOL).

### 3.5 `products` & `product_variants`
- `availability_mode`: `'READY_TO_SHIP'`, `'MADE_TO_ORDER'`, `'PRE_ORDER'`, `'OUT_OF_STOCK'`, `'HIDDEN'`.
- Available stock is calculated as: `(stock_quantity - reserved_quantity)`.
- `is_demo` (BOOL): Allows 1-click purge of initial sample artisan items.

### 3.6 `orders` & `order_items`
- `order_number`: Generated atomically from sequence `order_number_seq` (e.g., `VCG-2026-1001`).
- `status`: `'PENDING_APPROVAL'`, `'CONFIRMED'`, `'PREPARING'`, `'READY_TO_SHIP'`, `'SHIPPED'`, `'DELIVERED'`, `'REJECTED'`, `'CANCELLED'`.
- `payment_status`: `'UNPAID'`, `'PAID'`, `'REFUNDED'`.
- `business_snapshot`: Stores frozen store name, phone, address, and policy snippets at time of order creation.

### 3.7 `order_status_history`
- Logs all transitions with `old_status`, `new_status`, `changed_by` (admin UUID or 'CUSTOMER' / 'SYSTEM'), and `note`.

### 3.8 `custom_order_requests`
- `status`: `'NEW'`, `'QUOTED'`, `'ACCEPTED'`, `'DECLINED'`, `'CONVERTED'`.
- Private reference image path in Supabase Storage.

### 3.9 `inventory_adjustments`
- Logs reasons: `'ORDER_APPROVED_RESERVED'`, `'ORDER_REJECTED_RELEASED'`, `'ORDER_FULFILLED_DEDUCTED'`, `'MANUAL_COUNT'`, `'RESTOCK'`.

### 3.10 `notifications`
- In-app admin alert queue with `is_read` boolean flag.

---

## 4. Key Database Functions (RPC)

1. **`create_order_rpc`**:
   - Accepts order payload, customer details, and item list.
   - Validates that store mode allows ordering.
   - Generates next order number from `order_number_seq`.
   - Freezes current `store_settings` snapshot into `business_snapshot`.
   - Inserts `orders` and `order_items`.
   - Creates a new notification entry.
   - Returns created order details and tracking hash.

2. **`approve_order_rpc`**:
   - Takes `order_id` and `admin_id`.
   - Checks that order is in `PENDING_APPROVAL`.
   - Locks target products and variants using `FOR UPDATE`.
   - Verifies sufficient available stock for each tracked item.
   - Increments `reserved_quantity` on products/variants.
   - Logs adjustment to `inventory_adjustments`.
   - Updates status to `CONFIRMED`.
   - Records transition in `order_status_history`.

3. **`reject_order_rpc`**:
   - Takes `order_id`, `admin_id`, and `reason`.
   - Updates status to `REJECTED`, records reason and status history.

4. **`fulfill_order_rpc`**:
   - On transition to `SHIPPED` or `DELIVERED`, converts reserved quantities into permanent stock deductions (`stock_quantity = stock_quantity - reserved_quantity`, `reserved_quantity = reserved_quantity - requested_quantity`).

