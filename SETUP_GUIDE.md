# 🏥 Clinic Management System - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **SQL Server** (2016 or higher)
   - SQL Server Express (Free): https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Or use existing SQL Server installation

3. **SQL Server Management Studio (SSMS)** - Optional but recommended
   - Download from: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

## 🚀 Installation Steps

### Step 1: Install Dependencies

Open PowerShell/Command Prompt in the project folder and run:

```bash
npm install
```

This will install all required packages:
- Express (Web framework)
- MSSQL (SQL Server driver)
- PDFKit (PDF generation)
- And other dependencies

### Step 2: Configure Database Connection

1. Create a copy of `.env.example` and name it `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` file and update with your SQL Server credentials:
   ```
   DB_SERVER=localhost
   DB_DATABASE=ClinicManagement
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   DB_PORT=1433
   DB_ENCRYPT=false
   
   PORT=3000
   NODE_ENV=development
   ```

### Step 3: Create Database

Open SQL Server Management Studio (SSMS) and run:

```sql
CREATE DATABASE ClinicManagement;
```

Or use command line:
```bash
sqlcmd -S localhost -U sa -P YourPassword123 -Q "CREATE DATABASE ClinicManagement"
```

### Step 4: Setup Database Tables

Run the setup script to create all tables and insert sample data:

```bash
npm run setup-db
```

This will create:
- Patients table
- Doctors table
- Appointments table
- Prescriptions table
- Billing table
- Sample data (3 doctors, 3 patients)

### Step 5: Start the Application

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## 🎯 Quick Test

1. **Dashboard**: View today's overview
2. **Patients**: Click "Add New Patient" to register a patient
3. **Doctors**: View sample doctors (already added)
4. **Appointments**: Book an appointment
5. **Prescriptions**: Create a prescription for completed appointment
6. **Billing**: Generate a bill and download PDF receipt

## 🔧 Troubleshooting

### Database Connection Issues

**Error: "Login failed for user"**
- Verify SQL Server credentials in `.env` file
- Ensure SQL Server is running
- Check if SQL Server Authentication is enabled

**Error: "Cannot connect to SQL Server"**
- Verify SQL Server service is running
- Check firewall settings
- Ensure TCP/IP is enabled in SQL Server Configuration Manager

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```
PORT=3001
```

### Module Not Found Errors

Run:
```bash
npm install
```

## 📊 Database Schema

### Patients Table
- PatientID (Primary Key)
- PatientCode (Auto-generated: P00001)
- FullName, CNIC, ContactNumber
- Gender, DateOfBirth, Age (Calculated)
- Address, MedicalHistory

### Doctors Table
- DoctorID (Primary Key)
- DoctorCode (Auto-generated: D00001)
- FullName, Specialization, Qualification
- ContactNumber, Email
- ConsultationFee, AvailabilitySchedule

### Appointments Table
- AppointmentID (Primary Key)
- AppointmentCode (Auto-generated: A00001)
- PatientID, DoctorID (Foreign Keys)
- AppointmentDate, AppointmentTime
- AppointmentType (Scheduled/Walk-in/Emergency)
- Status (Scheduled/Completed/Cancelled/No-Show)

### Prescriptions Table
- PrescriptionID (Primary Key)
- PrescriptionCode (Auto-generated: RX00001)
- AppointmentID, PatientID, DoctorID
- Diagnosis, Symptoms, VitalSigns
- Medicines, LabTests, Instructions
- FollowUpDate

### Billing Table
- BillID (Primary Key)
- BillNumber (Auto-generated: BILL00001)
- AppointmentID, PatientID
- ConsultationFee, LabCharges, MedicineCharges
- TotalAmount, Discount, NetAmount (Calculated)
- PaymentMethod, PaymentStatus

## 🎨 Features Overview

### Phase 1 (Current) - MVP Features

✅ **Patient Management**
- Register new patients with auto-generated IDs
- Store demographics and medical history
- Search and edit patient records

✅ **Doctor Management**
- Add doctor profiles
- Set specialization and consultation fees
- Manage availability schedules

✅ **Appointment Booking**
- Schedule appointments with time slots
- Handle walk-ins and emergencies
- Track appointment status
- Prevent double booking

✅ **OPD Prescriptions**
- Create detailed prescriptions
- Record diagnosis and symptoms
- Prescribe medicines and lab tests
- Generate printable PDF prescriptions

✅ **Billing System**
- Generate bills with multiple charge types
- Apply discounts
- Multiple payment methods
- Print PDF receipts
- Track payment status

✅ **Dashboard**
- Today's appointments overview
- Revenue summary
- Quick actions

## 🔮 Future Phases

### Phase 2 - Smart Features (Coming Soon)
- Electronic Medical Records (EMR)
- Pharmacy/Inventory Management
- Lab Management
- Expense Tracking
- Role-Based Access Control

### Phase 3 - Analytics & Intelligence
- Business Intelligence Dashboard
- SMS/WhatsApp Reminders
- Online Appointment Portal
- Insurance Management

## 📝 Default Login (Future)
Currently no authentication. Phase 2 will add:
- Admin login
- Doctor login
- Receptionist login

## 🆘 Support

For issues or questions:
1. Check this guide
2. Review error messages in console
3. Check database connection
4. Verify all services are running

## 📄 License
Proprietary - All Rights Reserved
