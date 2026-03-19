# Councillors Data — Supabase Setup Guide

This folder contains everything needed to load all **9,473 elected councillors** from the 2021 South African Local Government Elections into your Supabase database.

---

## Files

| File | Purpose |
|---|---|
| `migrations/20260319_councillors_table.sql` | Creates the `councillors` table, indexes, and RLS policies |
| `councillors_seed.csv` | All 9,473 councillor records ready to import |
| `../lib/councillors.ts` | TypeScript helper functions for querying the table |

---

## Step 1 — Run the Migration

Go to your **Supabase Dashboard → SQL Editor** and run the contents of:

```
supabase/migrations/20260319_councillors_table.sql
```

This creates the table with the following columns:

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `province` | TEXT | e.g. `Eastern Cape` |
| `municipality` | TEXT | e.g. `EC101 - Dr. Beyers Naude` |
| `party` | TEXT | e.g. `AFRICAN NATIONAL CONGRESS` |
| `ward_list_order` | TEXT | Ward number or `PR(1)` etc. |
| `seat_category` | TEXT | `Ward`, `PR`, or `DC 40%` |
| `surname` | TEXT | Councillor surname |
| `full_name` | TEXT | Councillor full name |
| `seat_type` | TEXT | `LC ward`, `LC PR`, `DC "40%"` |

---

## Step 2 — Import the CSV

### Option A: Supabase Dashboard (Easiest)
1. Go to **Table Editor → councillors**
2. Click **Import CSV**
3. Upload `supabase/councillors_seed.csv`
4. Map columns (they match exactly) and click **Import**

### Option B: Supabase CLI / psql
```bash
psql "$DATABASE_URL" -c "\copy public.councillors(province,municipality,party,ward_list_order,seat_category,surname,full_name,seat_type) FROM 'supabase/councillors_seed.csv' CSV HEADER;"
```

### Option C: Node.js seed script (for CI/CD)
```js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parse/sync')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const rows = csv.parse(fs.readFileSync('supabase/councillors_seed.csv'), { columns: true })

// Insert in batches of 500
for (let i = 0; i < rows.length; i += 500) {
  const batch = rows.slice(i, i + 500)
  const { error } = await supabase.from('councillors').insert(batch)
  if (error) console.error(error)
  else console.log(`Inserted rows ${i}–${i + batch.length}`)
}
```

---

## Step 3 — Use in Your App

Import the helper functions from `lib/councillors.ts`:

```ts
import { searchCouncillors, getCouncillorsByMunicipality, filterCouncillors } from '@/lib/councillors'

// Search by name
const results = await searchCouncillors('Dlamini')

// Get all councillors in a municipality
const local = await getCouncillorsByMunicipality('Makana')

// Combined filter with pagination
const { data, count } = await filterCouncillors({
  province: 'Gauteng',
  party: 'ANC',
  seat_category: 'Ward',
  limit: 20,
  offset: 0,
})
```

---

## Data Source

> Electoral Commission of South Africa — **Notice 653 of 2021**
> Government Gazette No. 45447, 9 November 2021
> 2021 General Elections of Municipal Councils
