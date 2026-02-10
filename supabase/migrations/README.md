# Database Migrations - IMPORTANT

## ⚠️ WHICH MIGRATIONS TO RUN?

**RUN THESE IN ORDER**:
1. `02_convert_userId_to_uuid.sql` ✅ (FIRST - converts userId from integer to UUID)
2. `01_fixed_master_migration.sql` ✅ (SECOND - adds other features)

**DO NOT RUN**: `00_master_fix_all_issues.sql` ❌ (has wrong column names)

---

## Quick Start

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. **FIRST**: Run `02_convert_userId_to_uuid.sql` (converts userId type)
4. **THEN**: Run `01_fixed_master_migration.sql` (adds other features)
5. Copy and paste each SQL file and click **Run**

### Option 2: Supabase CLI
```bash
# Make sure you're in the project root
cd /path/to/studentKonnect

# Push all migrations
supabase db push
```

---

## What Does It Fix?

### 1. POPIA Consent Fields ✅
- Adds `popia_consent` column to profiles
- Adds `popia_consent_date` column to profiles
- Creates index for performance

### 2. Foreign Key Relationships ✅
- **marketplaceItems** → profiles (`userId` column)
- **accommodations** → profiles (`userId` column)
- **podcasts** → profiles (`user_id` column)
- **podcast_comments** → profiles (`user_id` column)
- **podcast_comments** → podcasts (`podcast_id` column)
- All with CASCADE delete

### 3. RLS Policies ✅
- **marketplaceItems**: SELECT, INSERT, UPDATE, DELETE
- **accommodations**: SELECT, INSERT, UPDATE, DELETE
- **podcasts**: SELECT, INSERT, UPDATE, DELETE
- **podcast_comments**: SELECT, INSERT, UPDATE, DELETE
- All enforce user ownership

### 4. Performance Indexes ✅
- All foreign key columns
- Category columns
- Date columns for sorting

### 5. Gazoo AI Conversations ✅
- New table: `gazoo_conversations`
- Stores chat history
- RLS policies for privacy
- Indexes for performance

---

## Migration Files Explained

### ✅ Use These (IN ORDER)

| Order | File | Purpose |
|-------|------|---------|
| 1 | `02_convert_userId_to_uuid.sql` | **RUN FIRST** - Converts userId from integer to UUID |
| 2 | `01_fixed_master_migration.sql` | **RUN SECOND** - Adds POPIA, foreign keys, RLS policies, Gazoo conversations |

### ❌ Ignore These (Old/Deprecated)

| File | Issue |
|------|-------|
| `00_master_fix_all_issues.sql` | Wrong column names (user_id vs userId) |
| `add_podcast_comments_fk.sql` | Included in 01_fixed_master_migration.sql |
| `add_popia_consent.sql` | Included in 01_fixed_master_migration.sql |
| `create_all_foreign_keys.sql` | Wrong column names |
| `fix_rls_policies.sql` | Included in 01_fixed_master_migration.sql |
| `inspect_schema.sql` | Just for inspection, not a migration |

### ℹ️ Existing Migrations (Already Applied)

These are your original migrations that are already applied:
- `20260122_fix_wallets_table.sql`
- `20260124_chat_*.sql`
- `20260131_wallet_sessions.sql`
- `20260203_*.sql`
- `complete_schema.sql`
- `drop_and_recreate.sql`
- `fixed_order_setup.sql`
- `separate_wallet_tables.sql`
- `simple_setup.sql`

---

## Column Names Reference

### marketplaceItems Table
```sql
-- CORRECT ✅
"userId" (camelCase)

-- WRONG ❌
user_id (snake_case)
```

### accommodations Table
```sql
-- CORRECT ✅
"userId" (camelCase)

-- WRONG ❌
user_id (snake_case)
```

### podcasts Table
```sql
-- CORRECT ✅
user_id (snake_case)

-- WRONG ❌
userId (camelCase)
```

### podcast_comments Table
```sql
-- CORRECT ✅
user_id (snake_case)
podcast_id (snake_case)

-- WRONG ❌
userId (camelCase)
podcastId (camelCase)
```

---

## Troubleshooting

### Error: "column user_id does not exist"
**Cause**: You're running the wrong migration file  
**Solution**: Run `01_fixed_master_migration.sql` instead

### Error: "constraint already exists"
**Cause**: Migration was partially applied  
**Solution**: The migration uses `IF NOT EXISTS` checks, just run it again

### Error: "relation does not exist"
**Cause**: Base tables haven't been created  
**Solution**: Run your base schema migrations first, then run this

---

## Verification

After running the migration, verify it worked:

```sql
-- Check POPIA consent columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE 'popia%';

-- Check foreign keys exist
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('marketplaceItems', 'accommodations', 'podcasts', 'podcast_comments');

-- Check RLS policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('marketplaceItems', 'accommodations', 'podcasts', 'podcast_comments');

-- Check Gazoo conversations table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'gazoo_conversations'
);
```

---

## Support

If you encounter any issues:

1. Check you're running `01_fixed_master_migration.sql`
2. Verify your base schema is set up correctly
3. Check the Supabase logs for detailed error messages
4. Ensure you have proper permissions on the database

---

## Summary

**✅ DO THIS**:
```bash
# In Supabase Dashboard SQL Editor
# Run: 01_fixed_master_migration.sql
```

**❌ DON'T DO THIS**:
```bash
# Don't run: 00_master_fix_all_issues.sql
# It has wrong column names!
```

That's it! Run the correct migration and all your errors will be fixed! 🎉
