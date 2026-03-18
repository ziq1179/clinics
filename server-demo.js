const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('\n🎨 ========================================');
console.log('   DEMO MODE - UI Preview Only');
console.log('   No Database Required!');
console.log('========================================\n');

// Mock data for demo
const mockPatients = [
    { patient_id: 1, patient_code: 'P00001', full_name: 'Muhammad Usman', cnic: '42101-1234567-1', contact_number: '0300-1111111', gender: 'Male', date_of_birth: '1990-05-15', age: 33, address: 'Lahore, Pakistan', medical_history: 'No known allergies', created_date: new Date(), is_active: true },
    { patient_id: 2, patient_code: 'P00002', full_name: 'Ayesha Malik', cnic: '42201-9876543-2', contact_number: '0321-2222222', gender: 'Female', date_of_birth: '1985-08-22', age: 38, address: 'Karachi, Pakistan', medical_history: 'Diabetic', created_date: new Date(), is_active: true },
    { patient_id: 3, patient_code: 'P00003', full_name: 'Ali Hassan', cnic: '42301-5555555-3', contact_number: '0333-3333333', gender: 'Male', date_of_birth: '2015-12-10', age: 8, address: 'Islamabad, Pakistan', medical_history: 'Asthma', created_date: new Date(), is_active: true }
];

const mockDoctors = [
    { doctor_id: 1, doctor_code: 'D00001', full_name: 'Dr. Ahmed Ali', specialization: 'General Physician', qualification: 'MBBS, FCPS', contact_number: '0300-1234567', email: 'ahmed.ali@clinic.com', consultation_fee: 1500, availability_schedule: 'Mon-Sat: 9AM-5PM', is_active: true },
    { doctor_id: 2, doctor_code: 'D00002', full_name: 'Dr. Fatima Khan', specialization: 'Gynecologist', qualification: 'MBBS, FCPS (Gynae)', contact_number: '0321-9876543', email: 'fatima.khan@clinic.com', consultation_fee: 2000, availability_schedule: 'Mon-Fri: 10AM-4PM', is_active: true },
    { doctor_id: 3, doctor_code: 'D00003', full_name: 'Dr. Hassan Raza', specialization: 'Pediatrician', qualification: 'MBBS, DCH', contact_number: '0333-5555555', email: 'hassan.raza@clinic.com', consultation_fee: 1800, availability_schedule: 'Mon-Sat: 8AM-2PM', is_active: true }
];

const mockAppointments = [
    { appointment_id: 1, appointment_code: 'A00001', patient_id: 1, doctor_id: 1, appointment_date: new Date().toISOString().split('T')[0], appointment_time: '10:00', appointment_type: 'Scheduled', status: 'Scheduled', reason: 'Regular checkup', patient_name: 'Muhammad Usman', patient_code: 'P00001', patient_contact: '0300-1111111', doctor_name: 'Dr. Ahmed Ali', doctor_code: 'D00001', specialization: 'General Physician', consultation_fee: 1500 },
    { appointment_id: 2, appointment_code: 'A00002', patient_id: 2, doctor_id: 2, appointment_date: new Date().toISOString().split('T')[0], appointment_time: '11:30', appointment_type: 'Scheduled', status: 'Scheduled', reason: 'Follow-up', patient_name: 'Ayesha Malik', patient_code: 'P00002', patient_contact: '0321-2222222', doctor_name: 'Dr. Fatima Khan', doctor_code: 'D00002', specialization: 'Gynecologist', consultation_fee: 2000 }
];

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Demo Mode - UI Preview',
        mode: 'DEMO',
        timestamp: new Date().toISOString()
    });
});

// Patients API
app.get('/api/patients', (req, res) => {
    res.json({ success: true, data: mockPatients });
});

app.get('/api/patients/:id', (req, res) => {
    const patient = mockPatients.find(p => p.patient_id == req.params.id);
    res.json({ success: true, data: patient || {} });
});

app.post('/api/patients', (req, res) => {
    const newPatient = {
        patient_id: mockPatients.length + 1,
        patient_code: `P${String(mockPatients.length + 1).padStart(5, '0')}`,
        ...req.body,
        created_date: new Date(),
        is_active: true
    };
    mockPatients.push(newPatient);
    res.status(201).json({ success: true, message: 'Patient registered (DEMO)', data: newPatient });
});

// Doctors API
app.get('/api/doctors', (req, res) => {
    res.json({ success: true, data: mockDoctors });
});

app.get('/api/doctors/:id', (req, res) => {
    const doctor = mockDoctors.find(d => d.doctor_id == req.params.id);
    res.json({ success: true, data: doctor || {} });
});

// Appointments API
app.get('/api/appointments', (req, res) => {
    res.json({ success: true, data: mockAppointments });
});

app.get('/api/appointments/today', (req, res) => {
    res.json({ success: true, data: mockAppointments });
});

app.get('/api/appointments/:id', (req, res) => {
    const appointment = mockAppointments.find(a => a.appointment_id == req.params.id);
    res.json({ success: true, data: appointment || {} });
});

app.post('/api/appointments', (req, res) => {
    const newAppointment = {
        appointment_id: mockAppointments.length + 1,
        appointment_code: `A${String(mockAppointments.length + 1).padStart(5, '0')}`,
        ...req.body,
        created_date: new Date()
    };
    mockAppointments.push(newAppointment);
    res.status(201).json({ success: true, message: 'Appointment booked (DEMO)', data: newAppointment });
});

app.patch('/api/appointments/:id/status', (req, res) => {
    res.json({ success: true, message: 'Status updated (DEMO)' });
});

// Prescriptions API
app.get('/api/prescriptions', (req, res) => {
    res.json({ success: true, data: [] });
});

app.post('/api/prescriptions', (req, res) => {
    res.status(201).json({ 
        success: true, 
        message: 'Prescription created (DEMO)', 
        data: { prescription_id: 1, prescription_code: 'RX00001' }
    });
});

// Billing API
app.get('/api/billing', (req, res) => {
    res.json({ success: true, data: [] });
});

app.get('/api/billing/today', (req, res) => {
    res.json({ 
        success: true, 
        data: { 
            total_bills: 5, 
            total_revenue: 45000, 
            paid_amount: 40000, 
            pending_amount: 5000 
        } 
    });
});

app.post('/api/billing', (req, res) => {
    res.status(201).json({ 
        success: true, 
        message: 'Bill generated (DEMO)', 
        data: { bill_id: 1, bill_number: 'BILL00001', net_amount: req.body.consultationFee || 1500 }
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log('✅ Demo server running!');
    console.log(`📊 Open: http://localhost:${PORT}`);
    console.log('\n💡 This is DEMO MODE:');
    console.log('   - UI is fully functional');
    console.log('   - Data is NOT saved (mock data only)');
    console.log('   - Perfect for testing the interface');
    console.log('   - Setup database later for real use\n');
    console.log('========================================\n');
});
