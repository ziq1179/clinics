# 🚀 Starting Your Clinic Management System

## ⚠️ **Important: Database Setup Required**

Before starting the application, you need to set up your database.

---

## 🎯 **Choose Your Setup**

### **Option 1: Supabase (Cloud - Recommended)** ☁️

**Best for:** Production use, cloud deployment, no local setup needed

**Steps:**

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free)
   - Create new project: "clinic-management"
   - Wait 2 minutes for setup

2. **Get Database URL**
   - In Supabase Dashboard
   - Click Settings (gear icon) → Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password

3. **Update .env File**
   - Open `.env` file in project root
   - Replace line 3 with your actual connection string:
     ```
     DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres
     ```
   - Save the file

4. **Setup Database Tables**
   - In Supabase Dashboard
   - Click "SQL Editor" → "New query"
   - Open file: `database/setup.js`
   - Copy the SQL part (CREATE TABLE statements)
   - Paste in SQL Editor
   - Click "Run"

5. **Start Application**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   ```
   http://localhost:3000
   ```

---

### **Option 2: Local PostgreSQL** 💻

**Best for:** Development, testing, offline work

**Prerequisites:**
- PostgreSQL installed on your computer
- PostgreSQL service running

**Steps:**

1. **Install PostgreSQL** (if not installed)
   - Download from: https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set for 'postgres' user

2. **Create Database**
   ```bash
   # Open Command Prompt or PowerShell
   psql -U postgres
   # Enter your postgres password
   
   # Create database
   CREATE DATABASE clinic_management;
   
   # Exit
   \q
   ```

3. **Update .env File**
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/clinic_management
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password

4. **Setup Database Tables**
   ```bash
   npm run setup-db
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   ```
   http://localhost:3000
   ```

---

## 🚀 **Quick Start Commands**

Once database is configured:

```bash
# Install dependencies (already done)
npm install

# Setup database tables (first time only)
npm run setup-db

# Start development server
npm run dev

# Or start production server
npm start
```

---

## ✅ **Verification Steps**

After starting the application:

1. **Check Terminal Output**
   ```
   ✅ Connected to PostgreSQL/Supabase
   🏥 Clinic Management System - Phase 1
   ✅ Server running on http://localhost:3000
   ```

2. **Open Browser**
   - Go to: http://localhost:3000
   - You should see the dashboard

3. **Test Features**
   - Click "Doctors" - Should see 3 sample doctors
   - Click "Patients" - Should see 3 sample patients
   - Try adding a new patient
   - Book an appointment

---

## 🆘 **Troubleshooting**

### **Error: "Database connection failed"**

**Check:**
1. DATABASE_URL in `.env` is correct
2. Database server is running
3. Password is correct
4. Network connection (for Supabase)

**Solution:**
```bash
# Test connection
node -e "require('./database/config').getConnection().then(() => console.log('✅ Connected!')).catch(err => console.log('❌ Error:', err.message))"
```

### **Error: "Port 3000 already in use"**

**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### **Error: "Module not found"**

**Solution:**
```bash
npm install
```

### **Error: "Tables don't exist"**

**Solution:**
```bash
npm run setup-db
```

---

## 📊 **What You'll See**

### **Dashboard**
- Today's appointments
- Revenue summary
- Quick actions
- Statistics

### **Patients Module**
- Patient list
- Add new patient
- Search patients
- Edit/Delete

### **Doctors Module**
- Doctor profiles
- Specializations
- Consultation fees
- Availability

### **Appointments**
- Book appointments
- View schedule
- Update status
- Today's appointments

### **Prescriptions**
- Create prescriptions
- Add medicines
- Lab tests
- Download PDF

### **Billing**
- Generate bills
- Multiple charges
- Discounts
- Print receipts

---

## 🎯 **Next Steps After Starting**

1. **Test the System**
   - Register a patient
   - Book an appointment
   - Create a prescription
   - Generate a bill

2. **Customize**
   - Add your clinic's doctors
   - Update consultation fees
   - Add your patients

3. **Deploy to Cloud** (Optional)
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy to Render
   - Get public URL

4. **Add ML Forecasting** (Optional)
   - Follow `ml_forecasting/QUICK_START_SUPABASE.md`
   - Get revenue predictions
   - View forecasts

---

## 💡 **Pro Tips**

1. **First Time Setup**
   - Use Supabase (easier, no local install)
   - Run `npm run setup-db` to create tables
   - Sample data is included

2. **Development**
   - Use `npm run dev` (auto-reload on changes)
   - Keep terminal open to see logs
   - Check browser console for errors

3. **Production**
   - Use `npm start` (stable)
   - Set NODE_ENV=production
   - Deploy to Render for public access

---

## 📞 **Need Help?**

### **Documentation**
- Setup: `SETUP_GUIDE.md`
- Cloud: `CLOUD_SETUP_QUICK.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
- API: `API_DOCUMENTATION.md`

### **Common Issues**
- Database: Check `.env` file
- Port: Change PORT in `.env`
- Dependencies: Run `npm install`
- Tables: Run `npm run setup-db`

---

## ✅ **Setup Checklist**

- [ ] Node.js installed (v16+) ✅ (You have v22)
- [ ] npm installed ✅ (You have v11)
- [ ] Dependencies installed ✅ (npm install done)
- [ ] Database chosen (Supabase or Local)
- [ ] DATABASE_URL configured in .env
- [ ] Database tables created (npm run setup-db)
- [ ] Application started (npm run dev)
- [ ] Browser opened (http://localhost:3000)
- [ ] Dashboard visible
- [ ] Sample data loaded

---

**🎉 Once database is configured, your clinic system will be ready!**

**Choose:** Supabase (recommended) or Local PostgreSQL

**Then run:** `npm run dev`

**Open:** http://localhost:3000
