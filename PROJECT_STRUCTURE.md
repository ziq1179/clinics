# 📁 Project Structure

```
Clinic_M/
│
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 .env                         # Database configuration (DO NOT COMMIT)
├── 📄 .env.example                 # Example environment variables
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Project overview
├── 📄 SETUP_GUIDE.md              # Detailed setup instructions
├── 📄 QUICK_START.md              # 5-minute quick start guide
├── 📄 PHASE_ROADMAP.md            # Phase-wise development plan
├── 📄 PROJECT_STRUCTURE.md        # This file
│
├── 🖥️ server.js                    # Main application entry point
│
├── 📂 database/
│   ├── config.js                  # SQL Server connection configuration
│   └── setup.js                   # Database schema setup script
│
├── 📂 routes/                     # API Routes (Backend Endpoints)
│   ├── patients.js                # Patient CRUD operations
│   ├── doctors.js                 # Doctor CRUD operations
│   ├── appointments.js            # Appointment management
│   ├── prescriptions.js           # Prescription management
│   └── billing.js                 # Billing and payment operations
│
├── 📂 utils/
│   └── pdfGenerator.js            # PDF generation for prescriptions & bills
│
└── 📂 public/                     # Frontend (Client-side)
    ├── index.html                 # Main HTML page
    │
    ├── 📂 css/
    │   └── style.css              # Custom styles and themes
    │
    └── 📂 js/                     # JavaScript modules
        ├── app.js                 # Core functions and utilities
        ├── dashboard.js           # Dashboard functionality
        ├── patients.js            # Patient management UI
        ├── doctors.js             # Doctor management UI
        ├── appointments.js        # Appointment booking UI
        ├── prescriptions.js       # Prescription creation UI
        └── billing.js             # Billing and invoicing UI
```

---

## 📋 File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js project configuration, dependencies, and scripts |
| `.env` | Environment variables (database credentials, port) |
| `.env.example` | Template for environment variables |
| `.gitignore` | Files to exclude from version control |
| `server.js` | Express server initialization and route mounting |

### Database Files

| File | Purpose |
|------|---------|
| `database/config.js` | SQL Server connection pool and configuration |
| `database/setup.js` | Creates tables, indexes, and sample data |

### Backend Routes (API Endpoints)

| File | Endpoints | Purpose |
|------|-----------|---------|
| `routes/patients.js` | `/api/patients/*` | Patient registration, search, update, delete |
| `routes/doctors.js` | `/api/doctors/*` | Doctor management operations |
| `routes/appointments.js` | `/api/appointments/*` | Appointment booking and status updates |
| `routes/prescriptions.js` | `/api/prescriptions/*` | Prescription creation and PDF generation |
| `routes/billing.js` | `/api/billing/*` | Bill generation and payment tracking |

### Utilities

| File | Purpose |
|------|---------|
| `utils/pdfGenerator.js` | Generates PDF documents for prescriptions and bills |

### Frontend Files

| File | Purpose |
|------|---------|
| `public/index.html` | Main HTML structure with navigation |
| `public/css/style.css` | Bootstrap customization and custom styles |
| `public/js/app.js` | Core utilities (API calls, date formatting, toasts) |
| `public/js/dashboard.js` | Dashboard statistics and today's overview |
| `public/js/patients.js` | Patient registration form and table |
| `public/js/doctors.js` | Doctor management interface |
| `public/js/appointments.js` | Appointment booking calendar |
| `public/js/prescriptions.js` | Prescription creation form |
| `public/js/billing.js` | Bill generation with calculations |

---

## 🔄 Data Flow

### Example: Creating a Prescription

```
1. User clicks "Create Prescription" (prescriptions.js)
   ↓
2. Form submission → savePrescription() function
   ↓
3. API call to POST /api/prescriptions (app.js)
   ↓
4. Server receives request (server.js → routes/prescriptions.js)
   ↓
5. Validate data and insert into database
   ↓
6. Update appointment status to "Completed"
   ↓
7. Return prescription ID
   ↓
8. Generate PDF (utils/pdfGenerator.js)
   ↓
9. Download PDF to user's browser
   ↓
10. Refresh prescriptions list
```

---

## 🗄️ Database Tables

### Tables Created by `database/setup.js`:

1. **Patients** - Patient demographics and medical history
2. **Doctors** - Doctor profiles and specializations
3. **Appointments** - Scheduled appointments
4. **Prescriptions** - Medical prescriptions
5. **Billing** - Bills and payment records

### Relationships:
- Appointments → Patients (Many-to-One)
- Appointments → Doctors (Many-to-One)
- Prescriptions → Appointments (One-to-One)
- Prescriptions → Patients (Many-to-One)
- Prescriptions → Doctors (Many-to-One)
- Billing → Appointments (One-to-One, Optional)
- Billing → Patients (Many-to-One)

---

## 🚀 NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server with auto-reload (nodemon) |
| `npm run setup-db` | Create database tables and sample data |

---

## 🎨 Frontend Architecture

### Single Page Application (SPA)
- No page reloads
- Dynamic content loading
- Bootstrap 5 for responsive design
- Font Awesome icons
- jQuery for DOM manipulation

### Key Features:
- **Modular JavaScript**: Each module handles one feature
- **RESTful API**: Clean separation of frontend/backend
- **Real-time Updates**: Toast notifications for actions
- **Responsive Design**: Works on desktop, tablet, mobile
- **PDF Generation**: Server-side PDF creation

---

## 🔐 Security Considerations (Phase 2)

Currently, the system has:
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled
- ❌ No authentication (coming in Phase 2)
- ❌ No authorization (coming in Phase 2)
- ❌ No data encryption (coming in Phase 2)

---

## 📦 Dependencies

### Production Dependencies:
- **express**: Web framework
- **mssql**: SQL Server driver
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **body-parser**: Request body parsing
- **pdfkit**: PDF generation
- **moment**: Date/time formatting

### Development Dependencies:
- **nodemon**: Auto-restart server on file changes

---

## 🎯 Code Organization Principles

1. **Separation of Concerns**: Backend (routes) separate from frontend (public)
2. **Modular Design**: Each feature in its own file
3. **RESTful API**: Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
4. **DRY Principle**: Reusable utilities in app.js
5. **Consistent Naming**: Clear, descriptive names
6. **Error Handling**: Try-catch blocks and user-friendly messages

---

## 📈 Scalability

### Current Architecture Supports:
- ✅ Multiple concurrent users
- ✅ Large datasets (SQL Server indexing)
- ✅ Easy feature addition (modular structure)
- ✅ Cloud deployment ready
- ✅ API versioning possible

### Future Enhancements:
- Microservices architecture
- Redis caching
- Load balancing
- Database replication

---

## 🛠️ Development Workflow

1. **Backend Changes**: Modify routes/*.js files
2. **Frontend Changes**: Modify public/js/*.js files
3. **Database Changes**: Update database/setup.js
4. **Styling**: Edit public/css/style.css
5. **Testing**: Use browser console and network tab
6. **Deployment**: Copy to production server

---

## 📝 Best Practices

- Keep `.env` file secure (never commit to Git)
- Backup database regularly
- Test on sample data first
- Use SQL Server Management Studio for database inspection
- Monitor server logs for errors
- Keep dependencies updated

---

**Last Updated**: Phase 1 Complete
**Version**: 1.0.0
**Status**: Production Ready ✅
