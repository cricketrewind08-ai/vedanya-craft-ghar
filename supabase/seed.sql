-- ====================================================================
-- VEDANYA CRAFT GHAR: DEVELOPMENT & DEMO SEED DATA
-- Flags: is_demo = true on all categories and products
-- Safe 1-click purge via: DELETE FROM categories WHERE is_demo = true;
-- ====================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, display_order, is_hidden, is_demo)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Crochet', 'crochet', 'Hand-stitched cozy crochet warmers, coasters, and bags.', 1, false, true),
    ('11111111-1111-1111-1111-111111111102', 'Scrunchies', 'scrunchies', 'Pure silk, satin, and soft cotton handcrafted hair scrunchies.', 2, false, true),
    ('11111111-1111-1111-1111-111111111103', 'Hair Accessories', 'hair-accessories', 'Artisan hairpins, headbands, and decorative clips.', 3, false, true),
    ('11111111-1111-1111-1111-111111111104', 'Handmade Gifts', 'handmade-gifts', 'Personalized artisanal keepsake gifts crafted with care.', 4, false, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED SAMPLE ARTISAN PRODUCTS (Clearly flagged with is_demo = true)
INSERT INTO public.products (
    id,
    category_id,
    title,
    slug,
    description,
    base_price,
    compare_at_price,
    availability_mode,
    preparation_days,
    stock_quantity,
    reserved_quantity,
    track_inventory,
    material,
    dimensions,
    is_featured,
    is_archived,
    is_demo
) VALUES 
    (
        '22222222-2222-2222-2222-222222222201',
        '11111111-1111-1111-1111-111111111101',
        '[Demo] Handcrafted Daisy Crochet Tote Bag',
        'demo-daisy-crochet-tote-bag',
        'Carefully woven with 100% breathable organic cotton yarn. Features vintage daisy motif patches and sturdy reinforced straps. Perfect for weekend markets and daily essentials.',
        899.00,
        1199.00,
        'READY_TO_SHIP',
        2,
        6,
        0,
        true,
        '100% Organic Cotton Yarn',
        '14" x 15" with 10" strap drop',
        true,
        false,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222202',
        '11111111-1111-1111-1111-111111111102',
        '[Demo] Mulberry Silk Cloud Scrunchie (Pack of 3)',
        'demo-mulberry-silk-cloud-scrunchie-pack',
        'Hand-cut and stitched from ultra-soft mulberry silk to eliminate hair friction and breakage. Includes three calming earthy tones.',
        349.00,
        450.00,
        'READY_TO_SHIP',
        1,
        15,
        0,
        true,
        'Pure Mulberry Silk & Durable Elastic',
        'Extra fluffy 4.5" diameter',
        true,
        false,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222203',
        '11111111-1111-1111-1111-111111111103',
        '[Demo] Terracotta Embroidered Headband',
        'demo-terracotta-embroidered-headband',
        'Structured flexible band wrapped in woven linen with delicate hand-embroidered floral vine detailing.',
        420.00,
        NULL,
        'MADE_TO_ORDER',
        4,
        8,
        0,
        true,
        'Natural Linen, Cotton Thread, Comfort Flex Base',
        'Standard Adult Fit (1.5" width)',
        false,
        false,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222204',
        '11111111-1111-1111-1111-111111111104',
        '[Demo] Custom Artisan Crochet Bouquet of Tulips',
        'demo-custom-artisan-crochet-tulips',
        'Everlasting bouquet of 5 handcrafted crochet tulips in a rustic jute wrap. An enduring symbol of appreciation and warmth.',
        750.00,
        900.00,
        'READY_TO_SHIP',
        3,
        4,
        0,
        true,
        'Premium Acrylic Cotton Blend Yarn & Floral Wire',
        'Approx 11" stem length',
        true,
        false,
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED PRODUCT VARIANTS
INSERT INTO public.product_variants (
    id,
    product_id,
    option_name,
    option_value,
    price_modifier,
    stock_quantity,
    reserved_quantity,
    sku
) VALUES 
    ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Color', 'Warm Terracotta & Cream', 0.00, 3, 0, 'DEMO-TOTE-TERRA'),
    ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'Color', 'Sage Green & Cream', 0.00, 3, 0, 'DEMO-TOTE-SAGE'),
    ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', 'Palette', 'Earth Tones (Sage, Sand, Terracotta)', 0.00, 10, 0, 'DEMO-SCR-EARTH'),
    ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222202', 'Palette', 'Pastel Tones (Rose, Cream, Mint)', 30.00, 5, 0, 'DEMO-SCR-PASTEL')
ON CONFLICT DO NOTHING;

-- 4. SEED SAMPLE PLACEHOLDER IMAGES
INSERT INTO public.product_images (
    product_id,
    image_url,
    alt_text,
    display_order,
    is_primary
) VALUES 
    ('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', 'Handcrafted Daisy Crochet Tote Bag - Warm Artisan Display', 1, true),
    ('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Mulberry Silk Cloud Scrunchie Pack', 1, true),
    ('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80', 'Terracotta Embroidered Headband Detail', 1, true),
    ('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', 'Handcrafted Crochet Bouquet of Tulips', 1, true)
ON CONFLICT DO NOTHING;

