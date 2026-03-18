const { pool } = require('./config');
require('dotenv').config();

const createTablesSQL = `
-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    patient_code VARCHAR(10) GENERATED ALWAYS AS ('P' || LPAD(patient_id::TEXT, 5, '0')) STORED,
    full_name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15) UNIQUE,
    contact_number VARCHAR(15) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED,
    address VARCHAR(200),
    medical_history TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    doctor_code VARCHAR(10) GENERATED ALWAYS AS ('D' || LPAD(doctor_id::TEXT, 5, '0')) STORED,
    full_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200),
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    availability_schedule TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    appointment_code VARCHAR(10) GENERATED ALWAYS AS ('A' || LPAD(appointment_id::TEXT, 5, '0')) STORED,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(20) DEFAULT 'Scheduled' CHECK (appointment_type IN ('Scheduled', 'Walk-in', 'Emergency')),
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')),
    reason VARCHAR(200),
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    prescription_code VARCHAR(10) GENERATED ALWAYS AS ('RX' || LPAD(prescription_id::TEXT, 5, '0')) STORED,
    appointment_id INTEGER NOT NULL REFERENCES appointments(appointment_id),
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    diagnosis TEXT,
    symptoms TEXT,
    vital_signs VARCHAR(500),
    medicines TEXT,
    lab_tests TEXT,
    instructions TEXT,
    follow_up_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Table
CREATE TABLE IF NOT EXISTS billing (
    bill_id SERIAL PRIMARY KEY,
    bill_number VARCHAR(12) GENERATED ALWAYS AS ('BILL' || LPAD(bill_id::TEXT, 5, '0')) STORED,
    appointment_id INTEGER REFERENCES appointments(appointment_id),
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    lab_charges DECIMAL(10,2) DEFAULT 0,
    medicine_charges DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (consultation_fee + lab_charges + medicine_charges + other_charges) STORED,
    discount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) GENERATED ALWAYS AS (consultation_fee + lab_charges + medicine_charges + other_charges - discount) STORED,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Card', 'Online', 'Insurance')),
    payment_status VARCHAR(20) DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Partial')),
    notes VARCHAR(500),
    created_by VARCHAR(100)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_patients_cnic ON patients(cnic);
CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(contact_number);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_billing_date ON billing(bill_date);

-- Create trigger for updated_date
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_date
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();

CREATE TRIGGER update_appointments_updated_date
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date();
`;

const insertSampleData = `
-- Sample Doctors
INSERT INTO doctors (full_name, specialization, qualification, contact_number, email, consultation_fee, availability_schedule)
VALUES 
    ('Dr. Ahmed Ali', 'General Physician', 'MBBS, FCPS', '0300-1234567', 'ahmed.ali@clinic.com', 1500, 'Mon-Sat: 9AM-5PM'),
    ('Dr. Fatima Khan', 'Gynecologist', 'MBBS, FCPS (Gynae)', '0321-9876543', 'fatima.khan@clinic.com', 2000, 'Mon-Fri: 10AM-4PM'),
    ('Dr. Hassan Raza', 'Pediatrician', 'MBBS, DCH', '0333-5555555', 'hassan.raza@clinic.com', 1800, 'Mon-Sat: 8AM-2PM')
ON CONFLICT DO NOTHING;

-- Sample Patients
INSERT INTO patients (full_name, cnic, contact_number, gender, date_of_birth, address, medical_history)
VALUES 
    ('Muhammad Usman', '42101-1234567-1', '0300-1111111', 'Male', '1990-05-15', 'Lahore, Pakistan', 'No known allergies'),
    ('Ayesha Malik', '42201-9876543-2', '0321-2222222', 'Female', '1985-08-22', 'Karachi, Pakistan', 'Diabetic'),
    ('Ali Hassan', '42301-5555555-3', '0333-3333333', 'Male', '2015-12-10', 'Islamabad, Pakistan', 'Asthma')
ON CONFLICT DO NOTHING;
`;

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Clinic Management Database (PostgreSQL/Supabase)...\n');
        
        console.log('📋 Creating tables...');
        await pool.query(createTablesSQL);
        console.log('✅ Tables created successfully\n');
        
        console.log('📝 Inserting sample data...');
        await pool.query(insertSampleData);
        console.log('✅ Sample data inserted successfully\n');
        
        console.log('🎉 Database setup completed successfully!');
        console.log('\n📊 Database Structure:');
        console.log('   - patients');
        console.log('   - doctors');
        console.log('   - appointments');
        console.log('   - prescriptions');
        console.log('   - billing');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Database setup failed:', err.message);
        console.error('\n💡 Make sure:');
        console.error('   1. Supabase project is created');
        console.error('   2. DATABASE_URL in .env is correct');
        console.error('   3. Database is accessible');
        process.exit(1);
    }
}

setupDatabase();
