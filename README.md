# 🏥 Clinic Management System

A comprehensive clinic management solution built with Node.js and SQL Server.

## 📋 Phase 1 - MVP Features

### Core Modules
- ✅ **Patient Registration** - Auto-generated IDs, demographics, medical history
- ✅ **Doctor Management** - Profiles, specializations, availability
- ✅ **Appointment Booking** - Time slots, walk-ins, scheduling
- ✅ **OPD Prescription** - Diagnosis, medicines, lab tests, printable prescriptions
- ✅ **Basic Billing** - Consultation, lab, medicine charges with receipt printing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (Supabase recommended)

### Local Development

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Configure Database**
- Copy `.env.example` to `.env`
- Update `DATABASE_URL` with your PostgreSQL/Supabase connection string

3. **Setup Database**
```bash
npm run setup-db
```

4. **Start Server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

5. **Access Application**
- Open browser: `http://localhost:3000`

### Cloud Deployment

**Deploy to GitHub + Supabase + Render (FREE)**

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

Quick steps:
1. Create Supabase project → Get DATABASE_URL
2. Push code to GitHub
3. Deploy on Render → Add DATABASE_URL
4. Done! Your app is live 🎉

## 📁 Project Structure

```
Clinic_M/
├── database/
│   ├── config.js          # Database connection
│   ├── setup.js           # Database schema setup
│   └── queries/           # SQL queries
├── routes/
│   ├── patients.js        # Patient endpoints
│   ├── doctors.js         # Doctor endpoints
│   ├── appointments.js    # Appointment endpoints
│   ├── prescriptions.js   # Prescription endpoints
│   └── billing.js         # Billing endpoints
├── controllers/           # Business logic
├── utils/
│   └── pdfGenerator.js    # PDF generation utilities
├── public/                # Frontend files
│   ├── index.html
│   ├── css/
│   └── js/
└── server.js              # Main application
```

## 🔮 Future Phases

### Phase 2 - Smart Features
- Electronic Medical Records (EMR)
- Inventory/Pharmacy Management
- Lab Management
- Expense Tracking
- Role-Based Access Control

### Phase 3 - Analytics & Intelligence
- Business Intelligence Dashboard
- SMS/WhatsApp Integration
- Online Appointment Portal
- Insurance Management

## 📝 License
Proprietary - All Rights Reserved
