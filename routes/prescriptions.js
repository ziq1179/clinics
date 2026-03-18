const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');

router.get('/', async (req, res) => {
    try {
        const { patientId } = req.query;
        
        let query = `
            SELECT 
                pr.prescription_id, pr.prescription_code, pr.diagnosis, pr.symptoms,
                pr.vital_signs, pr.medicines, pr.lab_tests, pr.instructions, 
                pr.follow_up_date, pr.created_date,
                p.patient_code, p.full_name AS patient_name, p.age, p.gender,
                d.doctor_code, d.full_name AS doctor_name, d.specialization,
                a.appointment_code, a.appointment_date
            FROM prescriptions pr
            INNER JOIN patients p ON pr.patient_id = p.patient_id
            INNER JOIN doctors d ON pr.doctor_id = d.doctor_id
            INNER JOIN appointments a ON pr.appointment_id = a.appointment_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (patientId) {
            query += ' AND pr.patient_id = $1';
            params.push(patientId);
        }
        
        query += ' ORDER BY pr.created_date DESC';
        
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pr.prescription_id, pr.prescription_code, pr.diagnosis, pr.symptoms,
                pr.vital_signs, pr.medicines, pr.lab_tests, pr.instructions, 
                pr.follow_up_date, pr.created_date,
                pr.patient_id, p.patient_code, p.full_name AS patient_name, p.age, p.gender, p.contact_number,
                pr.doctor_id, d.doctor_code, d.full_name AS doctor_name, d.specialization, d.qualification,
                pr.appointment_id, a.appointment_code, a.appointment_date
            FROM prescriptions pr
            INNER JOIN patients p ON pr.patient_id = p.patient_id
            INNER JOIN doctors d ON pr.doctor_id = d.doctor_id
            INNER JOIN appointments a ON pr.appointment_id = a.appointment_id
            WHERE pr.prescription_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Prescription not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { 
            appointmentId, patientId, doctorId, diagnosis, symptoms, 
            vitalSigns, medicines, labTests, instructions, followUpDate 
        } = req.body;
        
        if (!appointmentId || !patientId || !doctorId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Appointment, patient, and doctor are required' 
            });
        }
        
        const result = await pool.query(`
            INSERT INTO prescriptions (
                appointment_id, patient_id, doctor_id, diagnosis, symptoms, 
                vital_signs, medicines, lab_tests, instructions, follow_up_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING prescription_id, prescription_code
        `, [appointmentId, patientId, doctorId, diagnosis || null, symptoms || null, vitalSigns || null, medicines || null, labTests || null, instructions || null, followUpDate || null]);
        
        await pool.query('UPDATE appointments SET status = $1 WHERE appointment_id = $2', ['Completed', appointmentId]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Prescription created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id/pdf', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pr.prescription_code, pr.diagnosis, pr.symptoms,
                pr.vital_signs, pr.medicines, pr.lab_tests, pr.instructions, 
                pr.follow_up_date, pr.created_date,
                p.patient_code, p.full_name AS patient_name, p.age, p.gender, p.contact_number,
                d.full_name AS doctor_name, d.specialization, d.qualification, d.contact_number AS doctor_contact
            FROM prescriptions pr
            INNER JOIN patients p ON pr.patient_id = p.patient_id
            INNER JOIN doctors d ON pr.doctor_id = d.doctor_id
            WHERE pr.prescription_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Prescription not found' });
        }
        
        const prescription = result.rows[0];
        const pdfBuffer = await generatePrescriptionPDF(prescription);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription.prescription_code}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
