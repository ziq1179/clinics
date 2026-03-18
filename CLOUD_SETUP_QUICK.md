# ☁️ Cloud Setup - Quick Reference

## 🎯 Stack: GitHub + Supabase + Render (100% FREE)

---

## ⚡ Super Quick Setup (15 Minutes)

### 1️⃣ Supabase (5 minutes)

```
1. Go to supabase.com → Sign up with GitHub
2. New Project → Name: clinic-management
3. Copy connection string from Settings → Database
4. SQL Editor → Paste content from database/setup.js → Run
```

**Get this:** `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres`

---

### 2️⃣ GitHub (3 minutes)

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"

# Create repo on github.com/new
# Then:
git remote add origin https://github.com/YOUR-USERNAME/clinic-management-system.git
git push -u origin main
```

---

### 3️⃣ Render (7 minutes)

```
1. Go to render.com → Sign in with GitHub
2. New + → Web Service → Connect your repo
3. Settings:
   - Name: clinic-management-system
   - Build: npm install
   - Start: npm start
4. Environment Variables:
   - DATABASE_URL = (paste Supabase connection string)
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
| **GitHub Repo** | `https://github.com/YOUR-USERNAME/clinic-management-system` |
| **Supabase Dashboard** | `https://app.supabase.com` |
| **Render Dashboard** | `https://dashboard.render.com` |

---

## 🧪 Test Your Deployment

1. Open your Render URL
2. You should see the dashboard
3. Check sample doctors (3 should be there)
4. Register a new patient
5. Book an appointment
6. Create prescription → Download PDF
7. Generate bill → Download PDF

**All working?** ✅ You're done!

---

## 🔄 Making Updates

```bash
# Make changes to code
git add .
git commit -m "Description of changes"
git push origin main

# Render auto-deploys in 2-5 minutes
```

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render:**
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First load after inactivity: 30-60 sec
- ✅ 750 hours/month free

**Supabase:**
- ⚠️ Pauses after 1 week inactivity
- ✅ 500 MB database
- ✅ Unlimited API requests

### Keep Service Active

Use **UptimeRobot** (free):
1. Go to uptimerobot.com
2. Add monitor → HTTP(s)
3. URL: Your Render URL
4. Interval: 5 minutes
5. Done! Service stays active

---

## 🆘 Quick Troubleshooting

### App won't load
- Check Render logs
- Verify DATABASE_URL is correct
- Check Supabase project is active

### Database connection error
- Copy connection string again from Supabase
- Make sure password is correct
- Check SSL is enabled

### Slow first load
- Normal! Free tier spins down
- Use UptimeRobot to keep active
- Or wait 30-60 seconds

---

## 💰 Cost

**Current Setup:** $0/month (100% FREE!)

**Upgrade Options:**
- Render Starter: $7/month (no spin down)
- Supabase Pro: $25/month (8GB, no pause)

---

## 📚 Need More Details?

Read the complete guide: `DEPLOYMENT_GUIDE.md`

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Connection string copied
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added
- [ ] App deployed and tested
- [ ] Sample data verified

---

**🎉 That's it! Your clinic system is now on the cloud!**

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
