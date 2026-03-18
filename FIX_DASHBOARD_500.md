# Fix "relation does not exist" / Dashboard 500 errors

The console errors happen because **Neon is missing the core tables** that Render’s app uses. Create them in the **same Neon project** that Render’s `DATABASE_URL` uses.

## 1. Use the right Neon project

- In **Render** → your service → **Environment** → copy `DATABASE_URL`.
- The host in that URL (e.g. `ep-xxx.region.aws.neon.tech`) must be from the Neon project where you will run the SQL below.

## 2. Create the missing tables in Neon

1. Open [Neon Console](https://console.neon.tech) and select the **Clinicplus** (or same) project.
2. Go to **SQL Editor**.
3. Open **`database/neon-setup-missing-tables.sql`** in your project and copy **all** of its contents.
4. Paste into the Neon SQL Editor and click **Run**.
5. If you see any error, copy it and fix (e.g. “relation patients does not exist” means run **`database/neon-setup.sql`** instead, which creates all tables including `patients`).

## 3. Confirm tables exist

In Neon → **Tables**: you should see **patients**, **doctors**, **appointments**, **prescriptions**, **billing**. If any are missing, run the script again or run **`database/neon-setup.sql`** once (it uses `CREATE TABLE IF NOT EXISTS`).

## 4. Reload the app

- Reload **clinics-u3bz.onrender.com** (hard refresh: Ctrl+F5).
- The “Failed to load dashboard data” and `relation "billing" does not exist` / `relation "appointments" does not exist` errors should stop once those tables exist in the database pointed to by Render’s `DATABASE_URL`.
