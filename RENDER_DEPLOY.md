# 🚀 Deploy to Render – Step by Step

Your app is **ready to go online** on Render using **Neon** as the database.

---

## ✅ Pre-requisites

1. **Code on GitHub** → [github.com/ziq1179/clinics](https://github.com/ziq1179/clinics) ✅  
2. **Neon project** with database and tables (see below if not done)  
3. **Neon connection string** for `DATABASE_URL`  

---

## 1️⃣ Neon (if not done)

1. Go to [neon.tech](https://neon.tech) → Sign up (GitHub or email).  
2. **New Project** → Name: `clinic-management`, choose region, set password.  
3. After creation, open **Connection details** and copy the **Connection string** (URI).  
   Example:  
   `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`  
4. In Neon dashboard, open **SQL Editor**.  
5. Run the schema: copy the SQL from `database/setup.js` (the CREATE TABLE part) and run it.  
6. (Optional) Run `database/forecasting_schema.sql` for ML forecasting.  

Use the connection string as `DATABASE_URL` below.

---

## 2️⃣ Deploy on Render

### Step 1: Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com).  
2. Sign in (e.g. with GitHub).  
3. **New +** → **Web Service**.  
4. Select repo **ziq1179/clinics** → **Connect**.  

### Step 2: Configure

| Field | Value |
|--------|--------|
| **Name** | `clinic-management-system` |
| **Region** | Closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### Step 3: Environment variables

Add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your **Neon** connection string from step 1 |
| `PORT` | `10000` |

Example `DATABASE_URL`:

```text
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Save.

### Step 4: Deploy

Click **Create Web Service**. Wait for the build; when it’s green, open the service URL.

---

## 3️⃣ After deploy

- **App:** `https://your-service-name.onrender.com`  
- **Health:** `https://your-service-name.onrender.com/api/health`  
- **Free tier:** service may sleep after ~15 min; first request can take 30–60 seconds.  

---

## 🆘 If deploy fails

- **Build fails:** Check build logs (e.g. `npm install`).  
- **App crashes:** Confirm `DATABASE_URL` is set and correct (Neon URI with `?sslmode=require`).  
- **DB errors:** Test the same `DATABASE_URL` locally; ensure tables were created in Neon SQL Editor.  

---

## ✅ Summary

- **Repo:** [github.com/ziq1179/clinics](https://github.com/ziq1179/clinics)  
- **Database:** **Neon** (add `DATABASE_URL` on Render).  
- **Hosting:** Render; app is ready once `DATABASE_URL` is set and Neon tables exist.  

See **NEON_SETUP.md** for Neon details and **DEPLOYMENT_GUIDE.md** for more options.
