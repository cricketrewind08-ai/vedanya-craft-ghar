# Backup and Disaster Recovery Guide: Vedanya Craft Ghar

This document outlines the backup, retention, and disaster recovery procedures for the **Vedanya Craft Ghar** e-commerce platform hosted on **Supabase** (PostgreSQL + Cloud Storage) and **Vercel**.

---

## 1. Architecture Overview

- **Database:** Managed PostgreSQL instance on Supabase (Ref: `ykbaksjevsscpcahiswm`).
- **File Storage:** Supabase Storage S3-compatible buckets:
  - `product-images` (Public: craft photos)
  - `store-assets` (Public: boutique logos and banners)
  - `custom-order-references` (Private: customer reference photos)
- **Application Code & Hosting:** Next.js deployed on Vercel with environment variable secrets.

---

## 2. Automated Backups (Supabase Native)

Supabase provides daily automated backups of your PostgreSQL database:
- **Daily Snapshot:** Automatically taken every 24 hours.
- **Retention:** 7 days on free/pro tiers (expandable to 30 days point-in-time recovery on Pro).
- **Location:** In the Supabase Dashboard, navigate to:
  `Settings` → `Database` → `Backups` → `Daily Backups`.

---

## 3. Manual Database Backup (pg_dump)

Before making major schema adjustments or quarterly archival, the owner or developer can export an offline SQL backup.

### Command Line via `supabase CLI` or `pg_dump`:
```bash
# Using pg_dump with direct database connection string
pg_dump "postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  --clean --if-exists --no-owner --no-privileges -f vedanya_backup_$(date +%F).sql
```

### Table-Specific Export (Orders & Customers):
```bash
pg_dump "postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@..." \
  -t orders -t order_items -t order_status_history -t store_settings \
  -f orders_archive_$(date +%F).sql
```

---

## 4. Storage Bucket Backup

Craft photos and assets can be backed up using the Supabase JavaScript Admin client or AWS S3 CLI:

```bash
# Sync all product images to local directory using AWS CLI or S3 client
aws s3 sync s3://product-images ./backup/product-images/ \
  --endpoint-url https://ykbaksjevsscpcahiswm.supabase.co/storage/v1/s3
```

Alternatively, the Owner Console CSV export feature (`/admin/customers`) provides an offline copy of all customer purchase records and contact numbers.

---

## 5. Disaster Recovery Procedure

### Scenario 1: Accidental Product Deletion
1. Deleted products can be recovered from the latest automated snapshot.
2. Note that `is_archived = true` is used instead of hard deletion in the Owner Console, so check the "Archived" tab in `/admin/products` first before resorting to database restore.

### Scenario 2: Corrupted Settings or Operating Mode
1. The table `settings_history` records diffs of every single settings mutation.
2. Run a query in the Supabase SQL Editor to inspect previous settings:
   ```sql
   SELECT * FROM settings_history ORDER BY created_at DESC LIMIT 5;
   ```
3. Copy the previous JSON snapshot and apply it back to `store_settings`.

### Scenario 3: Complete Database Restore
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/ykbaksjevsscpcahiswm).
2. Go to **Settings** → **Database** → **Backups**.
3. Select the desired restore point and click **Restore**.
4. Test the storefront at `/shop` and `/track-order` to confirm data integrity.

