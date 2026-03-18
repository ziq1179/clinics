# 🐘 Neon Database Setup – Clinic Management System

This project uses **[Neon](https://neon.tech)** (serverless PostgreSQL) as the database.

---

## 1. Create a Neon account and project

1. Go to **[neon.tech](https://neon.tech)** and sign up (GitHub or email).
2. Click **New Project**.
3. Set:
   - **Project name:** `clinic-management`
   - **Region:** closest to you
   - **PostgreSQL version:** 16 (or latest)
4. Set a **database password** and save it.
5. Click **Create project**.

---

## 2. Get your connection string

1. In the Neon dashboard, open your project.
2. Click **Connection details** (or **Dashboard** → connection string).
3. Choose **Connection string** and copy the URI. It looks like:
   ```text
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. If you use the **pooled** connection (recommended for serverless), the host may contain `-pooler`, e.g.:
   ```text
   postgresql://username:password@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

Use this value as `DATABASE_URL` in your app.

---

## 3. Create tables in Neon

1. In Neon dashboard, open **SQL Editor**.
2. Create the main schema:
   - Open `database/setup.js` in your repo.
   - Copy the **SQL part only** (all `CREATE TABLE` and related statements).
   - Paste into the Neon SQL Editor and run it.
3. (Optional) For ML forecasting:
   - Open `database/forecasting_schema.sql`.
   - Run its contents in the Neon SQL Editor.

You can also run the setup script locally (see below) if you prefer.

---

## 4. Configure the app

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   Use the exact connection string from step 2.

---

## 5. Run the app locally

```bash
npm install
npm run setup-db   # if you didn’t run the SQL in the dashboard
npm run dev
```

Open **http://localhost:3000**.

---

## 6. Deploy to Render (or other host)

- Add **one environment variable**:
  - **Key:** `DATABASE_URL`
  - **Value:** your Neon connection string (from step 2).
- Do **not** commit `.env` or your real connection string to Git.

See **RENDER_DEPLOY.md** for full Render steps.

---

## Neon vs Supabase (for this project)

- **Neon:** Serverless Postgres, connection string + SSL, no Supabase-specific APIs.
- This app uses standard PostgreSQL and the `pg` driver, so it works with Neon without code changes beyond config and docs.

---

## Troubleshooting

- **Connection timeout:** Check region; use a pooled connection string if on serverless (e.g. Render).
- **SSL errors:** Ensure the connection string includes `?sslmode=require`.
- **“Relation does not exist”:** Run the schema SQL (from `database/setup.js` and optionally `forecasting_schema.sql`) in the Neon SQL Editor.

---

## Links

- [Neon Docs](https://neon.tech/docs)
- [Neon Connection Guide](https://neon.tech/docs/connect/connection-string)
