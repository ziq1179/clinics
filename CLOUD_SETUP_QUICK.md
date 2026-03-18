# ☁️ Cloud Setup - Quick Reference

## 🎯 Stack: GitHub + Neon + Render (100% FREE)

---

## ⚡ Super Quick Setup (15 Minutes)

### 1️⃣ Neon (5 minutes)

```
1. Go to neon.tech → Sign up with GitHub
2. New Project → Name: clinic-management, set password
3. Copy connection string from Connection details (URI)
4. SQL Editor → Paste SQL from database/setup.js → Run
```

**Get this:** `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

---

### 2️⃣ GitHub (3 minutes)

```bash
# Already done if you followed earlier steps
git add .
git commit -m "Switch to Neon database"
git push origin main
```

---

### 3️⃣ Render (7 minutes)

```
1. Go to render.com → Sign in with GitHub
2. New + → Web Service → Connect repo ziq1179/clinics
3. Settings:
   - Name: clinic-management-system
   - Build: npm install
   - Start: npm start
4. Environment Variables:
   - DATABASE_URL = (paste Neon connection string)
   - NODE_ENV = production
   - PORT = 10000
5. Create Web Service
```

**Wait 2-5 minutes → Your app is live!** 🎉

---

## 🔗 Your URLs

After deployment:

| Service | URL |
|---------|-----|
| **Your App** | `https://your-app-name.onrender.com` |
| **GitHub Repo** | `https://github.com/ziq1179/clinics` |
| **Neon Dashboard** | `https://console.neon.tech` |
| **Render Dashboard** | `https://dashboard.render.com` |

---

## 🧪 Test Your Deployment

1. Open your Render URL
2. You should see the dashboard
3. Check sample doctors (3 should be there after setup-db)
4. Register a new patient
5. Book an appointment
6. Create prescription → Download PDF
7. Generate bill → Download PDF

**All working?** ✅ You're done!

---

## 🔄 Making Updates

```bash
git add .
git commit -m "Description of changes"
git push origin main

# Render auto-deploys in 2-5 minutes
```

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render:**
- Spins down after 15 min inactivity
- First load after inactivity: 30-60 sec
- 750 hours/month free

**Neon:**
- Serverless Postgres, generous free tier
- Connection string must include `?sslmode=require`

### Keep Service Active

Use **UptimeRobot** (free): add a monitor for your Render URL, interval 5 min.

---

## 🆘 Quick Troubleshooting

### App won't load
- Check Render logs
- Verify DATABASE_URL is Neon URI with `?sslmode=require`

### Database connection error
- Copy connection string again from Neon
- Ensure password is correct and tables were created in SQL Editor

---

## 📚 More detail

- **Neon:** `NEON_SETUP.md`
- **Render:** `RENDER_DEPLOY.md`
- **Full deployment:** `DEPLOYMENT_GUIDE.md`
