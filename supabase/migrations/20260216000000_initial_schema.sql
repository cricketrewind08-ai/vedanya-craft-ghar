-- ====================================================================
-- VEDANYA CRAFT GHAR: INITIAL PRODUCTION SCHEMA MIGRATION
-- Migration Version: 20260216000000
-- ====================================================================

-- 1. EXTENSIONS & SEQUENCES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS custom_request_seq START WITH 101 INCREMENT BY 1;

-- 2. TRIGGER FUNCTION FOR TIMESTAMPTZ UPDATES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES

-- 3.1 ADMIN USERS (links to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('OWNER', 'STAFF')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check if calling session is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND role = 'OWNER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 STORE SETTINGS (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    business_name TEXT NOT NULL DEFAULT 'Vedanya Craft Ghar',
    tagline TEXT NOT NULL DEFAULT 'Handmade with love',
    logo_url TEXT,
    banner_url TEXT,
    about_content TEXT DEFAULT 'Welcome to Vedanya Craft Ghar. Every single creation here is handcrafted with patience, artistry, and love.',
    address TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    email TEXT,
    instagram_url TEXT DEFAULT 'https://instagram.com/vedanyacraftghar',
    other_social JSONB DEFAULT '[]'::jsonb,
    store_mode TEXT NOT NULL DEFAULT 'OPEN' CHECK (store_mode IN ('OPEN', 'TEMPORARILY_CLOSED', 'VACATION', 'CUSTOM_ORDERS_ONLY', 'MAINTENANCE')),
    mode_message TEXT,
    vacation_return_date DATE,
    default_shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 80.00 CHECK (default_shipping_charge >= 0),
    free_shipping_threshold NUMERIC(10,2) DEFAULT 999.00 CHECK (free_shipping_threshold IS NULL OR free_shipping_threshold >= 0),
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (min_order_amount >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
    processing_time_text TEXT DEFAULT '2-4 business days for in-stock items, 5-7 days for made-to-order',
    policies JSONB NOT NULL DEFAULT '{
        "return_policy": "Because our items are handmade with love, returns are accepted within 3 days of delivery only in cases of verified transit damage. Please record an unboxing video upon receipt.",
        "shipping_policy": "We ship all across India using trusted courier partners. Dispatch is within 2-4 business days of order confirmation.",
        "privacy_policy": "Your personal phone number and shipping address are strictly used to process your order and coordinate delivery. We never share or sell customer data.",
        "terms_conditions": "All pieces are unique and handmade; subtle variations in weave, texture and shade are the hallmark of authentic artisan crafts."
    }'::jsonb,
    custom_orders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_setup_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_enforced CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial default row if missing
INSERT INTO public.store_settings (id, business_name, tagline, instagram_url)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Vedanya Craft Ghar', 'Handmade with love', 'https://instagram.com/vedanyacraftghar')
ON CONFLICT (id) DO NOTHING;

-- 3.3 SETTINGS HISTORY
CREATE TABLE IF NOT EXISTS public.settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    changed_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    diff JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.5 PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    compare_at_price NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= base_price),
    availability_mode TEXT NOT NULL DEFAULT 'READY_TO_SHIP' CHECK (availability_mode IN ('READY_TO_SHIP', 'MADE_TO_ORDER', 'PRE_ORDER', 'OUT_OF_STOCK', 'HIDDEN')),
    preparation_days INTEGER NOT NULL DEFAULT 2 CHECK (preparation_days >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
    material TEXT,
    dimensions TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT reserved_not_exceed_stock_check CHECK (reserved_quantity <= stock_quantity OR NOT track_inventory)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON public.products(availability_mode, is_archived, is_featured);

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.6 PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 3.7 PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    option_name TEXT NOT NULL, -- e.g., 'Color', 'Pack Size', 'Dimension'
    option_value TEXT NOT NULL, -- e.g., 'Pastel Pink', 'Pack of 3', 'Medium'
    price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    sku TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT variant_reserved_not_exceed_stock_check CHECK (reserved_quantity <= stock_quantity)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.8 ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    tracking_hash TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address JSONB NOT NULL,
    order_notes TEXT,
    owner_notes TEXT, -- strictly internal
    customer_visible_note TEXT, -- payment instructions, delivery updates
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'PENDING_APPROVAL',
        'CONFIRMED',
        'PREPARING',
        'READY_TO_SHIP',
        'SHIPPED',
        'DELIVERED',
        'REJECTED',
        'CANCELLED'
    )),
    payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_charge >= 0),
    adjustment_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    adjustment_reason TEXT,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    final_total NUMERIC(10,2) NOT NULL CHECK (final_total >= 0),
    order_source TEXT NOT NULL DEFAULT 'WEBSITE' CHECK (order_source IN ('WEBSITE', 'MANUAL_WHATSAPP', 'MANUAL_INSTAGRAM', 'MANUAL_OTHER')),
    business_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.9 ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_title_snapshot TEXT NOT NULL,
    variant_snapshot TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 3.10 ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL, -- Admin user email or 'SYSTEM' / 'CUSTOMER'
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);

-- 3.11 CUSTOM ORDER REQUESTS
CREATE TABLE IF NOT EXISTS public.custom_order_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    description TEXT NOT NULL,
    preferred_colors TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    target_date DATE,
    reference_image_path TEXT,
    quoted_amount NUMERIC(10,2) CHECK (quoted_amount IS NULL OR quoted_amount >= 0),
    owner_notes TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'QUOTED', 'ACCEPTED', 'DECLINED', 'CONVERTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_custom_order_requests_updated_at
BEFORE UPDATE ON public.custom_order_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.12 INVENTORY ADJUSTMENTS AUDIT
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    previous_reserved INTEGER NOT NULL,
    new_reserved INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product ON public.inventory_adjustments(product_id);

-- 3.13 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'ORDER' CHECK (type IN ('ORDER', 'CUSTOM_ENQUIRY', 'LOW_STOCK', 'SYSTEM')),
    reference_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read, created_at DESC);

-- 3.14 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- 4. PUBLIC VIEWS (Clean & Secure Projections)
CREATE OR REPLACE VIEW public.public_store_settings AS
SELECT 
    business_name,
    tagline,
    logo_url,
    banner_url,
    about_content,
    address,
    phone,
    whatsapp_number,
    email,
    instagram_url,
    other_social,
    store_mode,
    mode_message,
    vacation_return_date,
    default_shipping_charge,
    free_shipping_threshold,
    min_order_amount,
    processing_time_text,
    policies,
    custom_orders_enabled,
    is_setup_completed
FROM public.store_settings
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 5. ROW LEVEL SECURITY (RLS) ON ALL TABLES

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES:

-- admin_users
CREATE POLICY "Admins can view admin_users" ON public.admin_users
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Owners can manage admin_users" ON public.admin_users
    FOR ALL USING (public.is_owner());

-- store_settings
CREATE POLICY "Public can view store settings" ON public.store_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can update store settings" ON public.store_settings
    FOR UPDATE USING (public.is_admin());

-- settings_history
CREATE POLICY "Admins can view settings history" ON public.settings_history
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert settings history" ON public.settings_history
    FOR INSERT WITH CHECK (public.is_admin());

-- categories
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_hidden = FALSE OR public.is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- products
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (
        (is_archived = FALSE AND availability_mode != 'HIDDEN') 
        OR public.is_admin()
    );
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- product_images
CREATE POLICY "Public can view images for viewable products" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND ((p.is_archived = FALSE AND p.availability_mode != 'HIDDEN') OR public.is_admin())
        )
    );
CREATE POLICY "Admins can manage product images" ON public.product_images
    FOR ALL USING (public.is_admin());

-- product_variants
CREATE POLICY "Public can view variants for viewable products" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND ((p.is_archived = FALSE AND p.availability_mode != 'HIDDEN') OR public.is_admin())
        )
    );
CREATE POLICY "Admins can manage product variants" ON public.product_variants
    FOR ALL USING (public.is_admin());

-- orders (Public NEVER accesses directly; mutations go through server RPC/service-role)
CREATE POLICY "Admins can view and manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- order_items
CREATE POLICY "Admins can view and manage order items" ON public.order_items
    FOR ALL USING (public.is_admin());

-- order_status_history
CREATE POLICY "Admins can view order status history" ON public.order_status_history
    FOR SELECT USING (public.is_admin());

-- custom_order_requests
CREATE POLICY "Admins can manage custom order requests" ON public.custom_order_requests
    FOR ALL USING (public.is_admin());

-- inventory_adjustments
CREATE POLICY "Admins can view inventory adjustments" ON public.inventory_adjustments
    FOR SELECT USING (public.is_admin());

-- notifications
CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL USING (public.is_admin());

-- audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- 6. CONCURRENCY-SAFE TRANSACTIONAL RPC FUNCTIONS

-- 6.1 CREATE ORDER RPC
CREATE OR REPLACE FUNCTION public.create_order_rpc(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_shipping_address JSONB,
    p_order_notes TEXT,
    p_order_source TEXT,
    p_items JSONB -- Array of {product_id, variant_id, quantity}
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_tracking_hash TEXT;
    v_subtotal NUMERIC(10,2) := 0.00;
    v_shipping_charge NUMERIC(10,2) := 0.00;
    v_final_total NUMERIC(10,2) := 0.00;
    v_settings RECORD;
    v_item RECORD;
    v_prod RECORD;
    v_var RECORD;
    v_unit_price NUMERIC(10,2);
    v_line_total NUMERIC(10,2);
    v_title_snap TEXT;
    v_var_snap TEXT;
BEGIN
    -- Check store mode
    SELECT * INTO v_settings FROM public.store_settings WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
    IF v_settings.store_mode IN ('TEMPORARILY_CLOSED', 'VACATION', 'MAINTENANCE') THEN
        RAISE EXCEPTION 'Store is currently not accepting new orders (Mode: %)', v_settings.store_mode;
    END IF;

    -- Generate order number
    v_order_number := 'VCG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    -- Create random tracking lookup hash
    v_tracking_hash := ENCODE(GEN_RANDOM_BYTES(16), 'hex');

    -- Calculate prices server-side by iterating over json items
    FOR v_item IN SELECT * FROM JSONB_TO_RECORDSET(p_items) AS x(product_id UUID, variant_id UUID, quantity INT)
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Item quantity must be greater than zero';
        END IF;

        SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id AND is_archived = FALSE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found or unavailable';
        END IF;

        v_unit_price := v_prod.base_price;
        v_title_snap := v_prod.title;
        v_var_snap := NULL;

        IF v_item.variant_id IS NOT NULL THEN
            SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id AND product_id = v_prod.id;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product variant not found';
            END IF;
            v_unit_price := v_unit_price + v_var.price_modifier;
            v_var_snap := v_var.option_name || ': ' || v_var.option_value;
        END IF;

        v_line_total := v_unit_price * v_item.quantity;
        v_subtotal := v_subtotal + v_line_total;
    END LOOP;

    -- Compute shipping
    IF v_settings.free_shipping_threshold IS NOT NULL AND v_subtotal >= v_settings.free_shipping_threshold THEN
        v_shipping_charge := 0.00;
    ELSE
        v_shipping_charge := v_settings.default_shipping_charge;
    END IF;

    v_final_total := v_subtotal + v_shipping_charge;

    -- Insert order
    INSERT INTO public.orders (
        order_number,
        tracking_hash,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        order_notes,
        status,
        payment_status,
        subtotal,
        shipping_charge,
        final_total,
        order_source,
        business_snapshot
    ) VALUES (
        v_order_number,
        v_tracking_hash,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_shipping_address,
        p_order_notes,
        'PENDING_APPROVAL',
        'UNPAID',
        v_subtotal,
        v_shipping_charge,
        v_final_total,
        COALESCE(p_order_source, 'WEBSITE'),
        ROW_TO_JSON(v_settings)::jsonb
    ) RETURNING id INTO v_order_id;

    -- Insert order items
    FOR v_item IN SELECT * FROM JSONB_TO_RECORDSET(p_items) AS x(product_id UUID, variant_id UUID, quantity INT)
    LOOP
        SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;
        v_unit_price := v_prod.base_price;
        v_title_snap := v_prod.title;
        v_var_snap := NULL;

        IF v_item.variant_id IS NOT NULL THEN
            SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id;
            v_unit_price := v_unit_price + v_var.price_modifier;
            v_var_snap := v_var.option_name || ': ' || v_var.option_value;
        END IF;

        v_line_total := v_unit_price * v_item.quantity;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            variant_id,
            product_title_snapshot,
            variant_snapshot,
            quantity,
            unit_price,
            line_total
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_item.variant_id,
            v_title_snap,
            v_var_snap,
            v_item.quantity,
            v_unit_price,
            v_line_total
        );
    END LOOP;

    -- Log status history
    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        v_order_id,
        NULL,
        'PENDING_APPROVAL',
        'CUSTOMER',
        'Order requested by customer via website'
    );

    -- Log admin notification
    INSERT INTO public.notifications (
        title,
        message,
        type,
        reference_id
    ) VALUES (
        'New Order Request: ' || v_order_number,
        'Customer ' || p_customer_name || ' submitted order for ₹' || v_final_total::TEXT || '.',
        'ORDER',
        v_order_number
    );

    RETURN JSONB_BUILD_OBJECT(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'tracking_hash', v_tracking_hash,
        'final_total', v_final_total,
        'subtotal', v_subtotal,
        'shipping_charge', v_shipping_charge
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 APPROVE ORDER RPC (Concurrently Safe Stock Reservation)
CREATE OR REPLACE FUNCTION public.approve_order_rpc(
    p_order_id UUID,
    p_admin_email TEXT,
    p_adjustment_amount NUMERIC(10,2) DEFAULT 0.00,
    p_adjustment_reason TEXT DEFAULT NULL,
    p_owner_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prod RECORD;
    v_var RECORD;
    v_new_total NUMERIC(10,2);
BEGIN
    -- Lock order for update
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status != 'PENDING_APPROVAL' THEN
        RAISE EXCEPTION 'Only orders in PENDING_APPROVAL can be approved. Current status: %', v_order.status;
    END IF;

    -- Concurrently lock and reserve inventory for tracked products/variants
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
            SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
            IF (v_var.stock_quantity - v_var.reserved_quantity) < v_item.quantity THEN
                RAISE EXCEPTION 'Insufficient stock for % (%). Available: %, Requested: %',
                    v_item.product_title_snapshot, v_item.variant_snapshot,
                    (v_var.stock_quantity - v_var.reserved_quantity), v_item.quantity;
            END IF;

            -- Reserve variant stock
            UPDATE public.product_variants
            SET reserved_quantity = reserved_quantity + v_item.quantity
            WHERE id = v_item.variant_id;

            -- Audit log
            INSERT INTO public.inventory_adjustments (
                product_id,
                variant_id,
                previous_stock,
                new_stock,
                previous_reserved,
                new_reserved,
                reason,
                reference_id
            ) VALUES (
                v_item.product_id,
                v_item.variant_id,
                v_var.stock_quantity,
                v_var.stock_quantity,
                v_var.reserved_quantity,
                v_var.reserved_quantity + v_item.quantity,
                'ORDER_APPROVED_RESERVED',
                v_order.order_number
            );
        ELSE
            SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
            IF v_prod.track_inventory THEN
                IF (v_prod.stock_quantity - v_prod.reserved_quantity) < v_item.quantity THEN
                    RAISE EXCEPTION 'Insufficient stock for %. Available: %, Requested: %',
                        v_prod.title, (v_prod.stock_quantity - v_prod.reserved_quantity), v_item.quantity;
                END IF;

                -- Reserve product stock
                UPDATE public.products
                SET reserved_quantity = reserved_quantity + v_item.quantity
                WHERE id = v_item.product_id;

                -- Audit log
                INSERT INTO public.inventory_adjustments (
                    product_id,
                    variant_id,
                    previous_stock,
                    new_stock,
                    previous_reserved,
                    new_reserved,
                    reason,
                    reference_id
                ) VALUES (
                    v_item.product_id,
                    NULL,
                    v_prod.stock_quantity,
                    v_prod.stock_quantity,
                    v_prod.reserved_quantity,
                    v_prod.reserved_quantity + v_item.quantity,
                    'ORDER_APPROVED_RESERVED',
                    v_order.order_number
                );
            END IF;
        END IF;
    END LOOP;

    -- Apply adjustments if any
    v_new_total := v_order.subtotal + v_order.shipping_charge + COALESCE(p_adjustment_amount, 0.00) - v_order.discount_amount;
    IF v_new_total < 0 THEN
        v_new_total := 0.00;
    END IF;

    -- Update order to CONFIRMED
    UPDATE public.orders
    SET 
        status = 'CONFIRMED',
        adjustment_amount = COALESCE(p_adjustment_amount, 0.00),
        adjustment_reason = p_adjustment_reason,
        customer_visible_note = p_owner_note,
        final_total = v_new_total
    WHERE id = p_order_id;

    -- Log history
    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        p_order_id,
        'PENDING_APPROVAL',
        'CONFIRMED',
        p_admin_email,
        COALESCE(p_adjustment_reason, 'Order approved by owner.')
    );

    RETURN JSONB_BUILD_OBJECT('success', true, 'status', 'CONFIRMED', 'final_total', v_new_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 REJECT / CANCEL ORDER RPC (Releases Reserved Stock)
CREATE OR REPLACE FUNCTION public.reject_or_cancel_order_rpc(
    p_order_id UUID,
    p_new_status TEXT, -- 'REJECTED' or 'CANCELLED'
    p_admin_email TEXT,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prod RECORD;
    v_var RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF p_new_status NOT IN ('REJECTED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status for cancellation/rejection';
    END IF;

    -- If order had previously reserved stock (e.g., CONFIRMED, PREPARING, READY_TO_SHIP), release it
    IF v_order.status IN ('CONFIRMED', 'PREPARING', 'READY_TO_SHIP') THEN
        FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
        LOOP
            IF v_item.variant_id IS NOT NULL THEN
                SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
                UPDATE public.product_variants
                SET reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
                WHERE id = v_item.variant_id;

                INSERT INTO public.inventory_adjustments (
                    product_id,
                    variant_id,
                    previous_stock,
                    new_stock,
                    previous_reserved,
                    new_reserved,
                    reason,
                    reference_id
                ) VALUES (
                    v_item.product_id,
                    v_item.variant_id,
                    v_var.stock_quantity,
                    v_var.stock_quantity,
                    v_var.reserved_quantity,
                    GREATEST(0, v_var.reserved_quantity - v_item.quantity),
                    'ORDER_CANCELLED_RELEASED',
                    v_order.order_number
                );
            ELSE
                SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
                IF v_prod.track_inventory THEN
                    UPDATE public.products
                    SET reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
                    WHERE id = v_item.product_id;

                    INSERT INTO public.inventory_adjustments (
                        product_id,
                        variant_id,
                        previous_stock,
                        new_stock,
                        previous_reserved,
                        new_reserved,
                        reason,
                        reference_id
                    ) VALUES (
                        v_item.product_id,
                        NULL,
                        v_prod.stock_quantity,
                        v_prod.stock_quantity,
                        v_prod.reserved_quantity,
                        GREATEST(0, v_prod.reserved_quantity - v_item.quantity),
                        'ORDER_CANCELLED_RELEASED',
                        v_order.order_number
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;

    UPDATE public.orders
    SET 
        status = p_new_status,
        customer_visible_note = p_reason
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        p_order_id,
        v_order.status,
        p_new_status,
        p_admin_email,
        p_reason
    );

    RETURN JSONB_BUILD_OBJECT('success', true, 'status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.4 FULFILL ORDER RPC (Converts Reservations to Permanent Deductions on Shipped/Delivered)
CREATE OR REPLACE FUNCTION public.fulfill_order_rpc(
    p_order_id UUID,
    p_new_status TEXT, -- 'SHIPPED' or 'DELIVERED'
    p_admin_email TEXT,
    p_tracking_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prod RECORD;
    v_var RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF p_new_status NOT IN ('SHIPPED', 'DELIVERED') THEN
        RAISE EXCEPTION 'Invalid target status for fulfillment';
    END IF;

    -- Only deduct permanent stock once (when moving from PREPARING/READY_TO_SHIP -> SHIPPED or DELIVERED)
    IF v_order.status IN ('CONFIRMED', 'PREPARING', 'READY_TO_SHIP') THEN
        FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
        LOOP
            IF v_item.variant_id IS NOT NULL THEN
                SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
                UPDATE public.product_variants
                SET 
                    stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
                    reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
                WHERE id = v_item.variant_id;

                INSERT INTO public.inventory_adjustments (
                    product_id,
                    variant_id,
                    previous_stock,
                    new_stock,
                    previous_reserved,
                    new_reserved,
                    reason,
                    reference_id
                ) VALUES (
                    v_item.product_id,
                    v_item.variant_id,
                    v_var.stock_quantity,
                    GREATEST(0, v_var.stock_quantity - v_item.quantity),
                    v_var.reserved_quantity,
                    GREATEST(0, v_var.reserved_quantity - v_item.quantity),
                    'ORDER_FULFILLED_DEDUCTED',
                    v_order.order_number
                );
            ELSE
                SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
                IF v_prod.track_inventory THEN
                    UPDATE public.products
                    SET 
                        stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
                        reserved_quantity = GREATEST(0, reserved_quantity - v_item.quantity)
                    WHERE id = v_item.product_id;

                    INSERT INTO public.inventory_adjustments (
                        product_id,
                        variant_id,
                        previous_stock,
                        new_stock,
                        previous_reserved,
                        new_reserved,
                        reason,
                        reference_id
                    ) VALUES (
                        v_item.product_id,
                        NULL,
                        v_prod.stock_quantity,
                        GREATEST(0, v_prod.stock_quantity - v_item.quantity),
                        v_prod.reserved_quantity,
                        GREATEST(0, v_prod.reserved_quantity - v_item.quantity),
                        'ORDER_FULFILLED_DEDUCTED',
                        v_order.order_number
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;

    UPDATE public.orders
    SET 
        status = p_new_status,
        customer_visible_note = COALESCE(p_tracking_note, customer_visible_note)
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        p_order_id,
        v_order.status,
        p_new_status,
        p_admin_email,
        COALESCE(p_tracking_note, 'Order status updated to ' || p_new_status)
    );

    RETURN JSONB_BUILD_OBJECT('success', true, 'status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. STORAGE BUCKETS SETUP (Executed safely via storage schema if available)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('store-assets', 'store-assets', true),
    ('custom-order-references', 'custom-order-references', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Read product-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin All product-images" ON storage.objects
    FOR ALL USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Public Read store-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Admin All store-assets" ON storage.objects
    FOR ALL USING (bucket_id = 'store-assets' AND public.is_admin());

CREATE POLICY "Admin Read custom-order-references" ON storage.objects
    FOR SELECT USING (bucket_id = 'custom-order-references' AND public.is_admin());

