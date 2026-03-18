# 🚀 Quick Start Guide - 5 Minutes Setup

## Prerequisites Check ✓
- [ ] Node.js installed (v16+)
- [ ] SQL Server running
- [ ] Database credentials ready

## Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

## Step 2: Configure Database (1 minute)
Update `.env` file with your SQL Server credentials:
```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword123
```

## Step 3: Create Database
Open SQL Server and run:
```sql
CREATE DATABASE ClinicManagement;
```

## Step 4: Setup Tables (1 minute)
```bash
npm run setup-db
```

## Step 5: Start Application (30 seconds)
```bash
npm run dev
```

## Step 6: Open Browser
Navigate to: **http://localhost:3000**

---

## 🎉 You're Ready!

### Test the System:

1. **View Dashboard** - See today's overview
2. **Check Doctors** - 3 sample doctors already added
3. **Add a Patient** - Click "Add New Patient"
4. **Book Appointment** - Schedule with a doctor
5. **Create Prescription** - For completed appointment
6. **Generate Bill** - Create and download PDF receipt

---

## 🆘 Common Issues

### "Cannot connect to database"
- Ensure SQL Server is running
- Check credentials in `.env` file
- Verify database exists

### "Port 3000 already in use"
- Change PORT in `.env` to 3001
- Or stop the application using port 3000

### "Module not found"
- Run `npm install` again

---

## 📚 Next Steps

1. Read `SETUP_GUIDE.md` for detailed documentation
2. Check `PHASE_ROADMAP.md` for future features
3. Customize for your clinic needs
4. Start using in production!

---

## 🎯 Default Sample Data

**Doctors** (Already Added):
- Dr. Ahmed Ali - General Physician
- Dr. Fatima Khan - Gynecologist  
- Dr. Hassan Raza - Pediatrician

**Patients** (Already Added):
- Muhammad Usman
- Ayesha Malik
- Ali Hassan

---

## 💡 Pro Tips

- Use Chrome/Edge for best experience
- Keep SQL Server running while using
- Backup database regularly
- Test with sample data first

**Happy Clinic Management! 🏥**
