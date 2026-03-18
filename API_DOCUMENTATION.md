# 📡 API Documentation

Base URL: `http://localhost:3000/api`

---

## 🏥 Patients API

### Get All Patients
```http
GET /api/patients
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "PatientID": 1,
      "PatientCode": "P00001",
      "FullName": "Muhammad Usman",
      "CNIC": "42101-1234567-1",
      "ContactNumber": "0300-1111111",
      "Gender": "Male",
      "DateOfBirth": "1990-05-15",
      "Age": 33,
      "Address": "Lahore, Pakistan",
      "MedicalHistory": "No known allergies",
      "CreatedDate": "2024-01-15T10:30:00",
      "IsActive": true
    }
  ]
}
```

### Get Patient by ID
```http
GET /api/patients/:id
```

### Search Patients
```http
GET /api/patients/search/:query
```
Searches by: Name, PatientCode, CNIC, or ContactNumber

### Create New Patient
```http
POST /api/patients
Content-Type: application/json

{
  "fullName": "John Doe",
  "cnic": "42101-1234567-1",
  "contactNumber": "0300-1234567",
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "address": "Lahore, Pakistan",
  "medicalHistory": "Diabetic"
}
```

**Required Fields:** `fullName`, `contactNumber`, `gender`

### Update Patient
```http
PUT /api/patients/:id
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "contactNumber": "0300-9999999"
}
```

### Delete Patient (Soft Delete)
```http
DELETE /api/patients/:id
```

---

## 👨‍⚕️ Doctors API

### Get All Doctors
```http
GET /api/doctors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "DoctorID": 1,
      "DoctorCode": "D00001",
      "FullName": "Dr. Ahmed Ali",
      "Specialization": "General Physician",
      "Qualification": "MBBS, FCPS",
      "ContactNumber": "0300-1234567",
      "Email": "ahmed.ali@clinic.com",
      "ConsultationFee": 1500.00,
      "AvailabilitySchedule": "Mon-Sat: 9AM-5PM",
      "IsActive": true
    }
  ]
}
```

### Get Doctor by ID
```http
GET /api/doctors/:id
```

### Create New Doctor
```http
POST /api/doctors
Content-Type: application/json

{
  "fullName": "Dr. Sarah Khan",
  "specialization": "Cardiologist",
  "qualification": "MBBS, MD",
  "contactNumber": "0321-9876543",
  "email": "sarah@clinic.com",
  "consultationFee": 2000,
  "availabilitySchedule": "Mon-Fri: 10AM-4PM"
}
```

**Required Fields:** `fullName`, `specialization`, `contactNumber`

### Update Doctor
```http
PUT /api/doctors/:id
```

### Delete Doctor (Soft Delete)
```http
DELETE /api/doctors/:id
```

---

## 📅 Appointments API

### Get All Appointments
```http
GET /api/appointments
```

**Query Parameters:**
- `date` - Filter by date (YYYY-MM-DD)
- `doctorId` - Filter by doctor
- `status` - Filter by status (Scheduled/Completed/Cancelled/No-Show)

**Example:**
```http
GET /api/appointments?date=2024-01-15&status=Scheduled
```

### Get Today's Appointments
```http
GET /api/appointments/today
```

### Get Appointment by ID
```http
GET /api/appointments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "AppointmentID": 1,
    "AppointmentCode": "A00001",
    "AppointmentDate": "2024-01-15",
    "AppointmentTime": "10:30:00",
    "AppointmentType": "Scheduled",
    "Status": "Scheduled",
    "Reason": "Regular checkup",
    "PatientID": 1,
    "PatientName": "Muhammad Usman",
    "DoctorID": 1,
    "DoctorName": "Dr. Ahmed Ali",
    "ConsultationFee": 1500.00
  }
}
```

### Book New Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2024-01-20",
  "appointmentTime": "10:30",
  "appointmentType": "Scheduled",
  "reason": "Follow-up visit",
  "notes": "Patient requested morning slot"
}
```

**Required Fields:** `patientId`, `doctorId`, `appointmentDate`, `appointmentTime`

**Appointment Types:** `Scheduled`, `Walk-in`, `Emergency`

### Update Appointment
```http
PUT /api/appointments/:id
```

### Update Appointment Status
```http
PATCH /api/appointments/:id/status
Content-Type: application/json

{
  "status": "Completed"
}
```

**Valid Statuses:** `Scheduled`, `Completed`, `Cancelled`, `No-Show`

---

## 💊 Prescriptions API

### Get All Prescriptions
```http
GET /api/prescriptions
```

**Query Parameters:**
- `patientId` - Filter by patient

### Get Prescription by ID
```http
GET /api/prescriptions/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "PrescriptionID": 1,
    "PrescriptionCode": "RX00001",
    "AppointmentID": 1,
    "PatientID": 1,
    "PatientName": "Muhammad Usman",
    "DoctorID": 1,
    "DoctorName": "Dr. Ahmed Ali",
    "Diagnosis": "Common Cold",
    "Symptoms": "Fever, Cough, Sore throat",
    "VitalSigns": "BP: 120/80, Temp: 99°F",
    "Medicines": "1. Paracetamol 500mg - 1 tablet 3 times daily - 5 days",
    "LabTests": "CBC, Chest X-Ray",
    "Instructions": "Take rest, drink plenty of water",
    "FollowUpDate": "2024-01-25",
    "CreatedDate": "2024-01-15T11:00:00"
  }
}
```

### Create New Prescription
```http
POST /api/prescriptions
Content-Type: application/json

{
  "appointmentId": 1,
  "patientId": 1,
  "doctorId": 1,
  "vitalSigns": "BP: 120/80, Temp: 98.6°F, Pulse: 72",
  "symptoms": "Fever, headache",
  "diagnosis": "Viral Fever",
  "medicines": "1. Paracetamol 500mg - 3 times daily - 5 days\n2. Vitamin C - Once daily - 7 days",
  "labTests": "CBC, Blood Sugar",
  "instructions": "Take medicines after meals, rest for 2 days",
  "followUpDate": "2024-01-25"
}
```

**Required Fields:** `appointmentId`, `patientId`, `doctorId`

**Note:** Creating a prescription automatically marks the appointment as "Completed"

### Download Prescription PDF
```http
GET /api/prescriptions/:id/pdf
```

Returns PDF file for download.

---

## 💰 Billing API

### Get All Bills
```http
GET /api/billing
```

**Query Parameters:**
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `paymentStatus` - Filter by status (Paid/Pending/Partial)

**Example:**
```http
GET /api/billing?startDate=2024-01-01&endDate=2024-01-31&paymentStatus=Paid
```

### Get Today's Billing Summary
```http
GET /api/billing/today
```

**Response:**
```json
{
  "success": true,
  "data": {
    "TotalBills": 15,
    "TotalRevenue": 45000.00,
    "PaidAmount": 40000.00,
    "PendingAmount": 5000.00
  }
}
```

### Get Bill by ID
```http
GET /api/billing/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "BillID": 1,
    "BillNumber": "BILL00001",
    "BillDate": "2024-01-15T12:00:00",
    "PatientID": 1,
    "PatientName": "Muhammad Usman",
    "AppointmentID": 1,
    "ConsultationFee": 1500.00,
    "LabCharges": 2000.00,
    "MedicineCharges": 1500.00,
    "OtherCharges": 0.00,
    "TotalAmount": 5000.00,
    "Discount": 500.00,
    "NetAmount": 4500.00,
    "PaymentMethod": "Cash",
    "PaymentStatus": "Paid",
    "Notes": "Regular patient discount applied"
  }
}
```

### Generate New Bill
```http
POST /api/billing
Content-Type: application/json

{
  "appointmentId": 1,
  "patientId": 1,
  "consultationFee": 1500,
  "labCharges": 2000,
  "medicineCharges": 1500,
  "otherCharges": 0,
  "discount": 500,
  "paymentMethod": "Cash",
  "paymentStatus": "Paid",
  "notes": "Regular patient discount",
  "createdBy": "Admin"
}
```

**Required Fields:** `patientId`, `paymentMethod`

**Payment Methods:** `Cash`, `Card`, `Online`, `Insurance`

**Payment Statuses:** `Paid`, `Pending`, `Partial`

**Note:** `TotalAmount` and `NetAmount` are calculated automatically

### Update Payment Status
```http
PATCH /api/billing/:id/payment-status
Content-Type: application/json

{
  "paymentStatus": "Paid"
}
```

### Download Bill PDF
```http
GET /api/billing/:id/pdf
```

Returns PDF receipt for download.

---

## 🏥 Health Check API

### Server Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Clinic Management System API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## 🔒 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 💡 Usage Examples

### Example 1: Complete Patient Journey

```javascript
// 1. Register Patient
const patient = await fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: "Ali Hassan",
    contactNumber: "0300-1234567",
    gender: "Male"
  })
});

// 2. Book Appointment
const appointment = await fetch('/api/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: 1,
    doctorId: 1,
    appointmentDate: "2024-01-20",
    appointmentTime: "10:30"
  })
});

// 3. Create Prescription
const prescription = await fetch('/api/prescriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointmentId: 1,
    patientId: 1,
    doctorId: 1,
    diagnosis: "Fever",
    medicines: "Paracetamol 500mg"
  })
});

// 4. Generate Bill
const bill = await fetch('/api/billing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointmentId: 1,
    patientId: 1,
    consultationFee: 1500,
    paymentMethod: "Cash"
  })
});
```

---

## 🔧 Testing with cURL

### Create Patient
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Patient","contactNumber":"0300-1234567","gender":"Male"}'
```

### Get All Doctors
```bash
curl http://localhost:3000/api/doctors
```

### Download Prescription PDF
```bash
curl http://localhost:3000/api/prescriptions/1/pdf -o prescription.pdf
```

---

## 📝 Notes

- All dates should be in `YYYY-MM-DD` format
- All times should be in `HH:MM` format (24-hour)
- Monetary values are in Pakistani Rupees (PKR)
- Soft delete is used (records marked inactive, not deleted)
- Auto-generated codes use format: P00001, D00001, A00001, RX00001, BILL00001

---

**API Version:** 1.0  
**Last Updated:** Phase 1 Complete  
**Authentication:** Not implemented (Coming in Phase 2)
