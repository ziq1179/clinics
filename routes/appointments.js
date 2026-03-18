const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');

router.get('/', async (req, res) => {
    try {
        const { date, doctorId, status } = req.query;
        
        let query = `
            SELECT 
                a.appointment_id, a.appointment_code, a.appointment_date, a.appointment_time,
                a.appointment_type, a.status, a.reason, a.notes,
                p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                d.doctor_code, d.full_name AS doctor_name, d.specialization
            FROM appointments a
            INNER JOIN patients p ON a.patient_id = p.patient_id
            INNER JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (date) {
            query += ` AND a.appointment_date = $${paramCount}`;
            params.push(date);
            paramCount++;
        }
        
        if (doctorId) {
            query += ` AND a.doctor_id = $${paramCount}`;
            params.push(doctorId);
            paramCount++;
        }
        
        if (status) {
            query += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        
        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
        
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/today', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.appointment_id, a.appointment_code, a.appointment_time,
                a.appointment_type, a.status, a.reason,
                p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                d.doctor_code, d.full_name AS doctor_name, d.specialization
            FROM appointments a
            INNER JOIN patients p ON a.patient_id = p.patient_id
            INNER JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.appointment_date = CURRENT_DATE
            ORDER BY a.appointment_time
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.appointment_id, a.appointment_code, a.appointment_date, a.appointment_time,
                a.appointment_type, a.status, a.reason, a.notes,
                a.patient_id, p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                a.doctor_id, d.doctor_code, d.full_name AS doctor_name, d.specialization, d.consultation_fee
            FROM appointments a
            INNER JOIN patients p ON a.patient_id = p.patient_id
            INNER JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.appointment_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, appointmentTime, appointmentType, reason, notes } = req.body;
        
        if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ 
                success: false, 
                error: 'Patient, doctor, date, and time are required' 
            });
        }
        
        const conflictCheck = await pool.query(`
            SELECT COUNT(*) AS count 
            FROM appointments 
            WHERE doctor_id = $1 
            AND appointment_date = $2 
            AND appointment_time = $3
            AND status NOT IN ('Cancelled', 'No-Show')
        `, [doctorId, appointmentDate, appointmentTime]);
        
        if (parseInt(conflictCheck.rows[0].count) > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'This time slot is already booked for this doctor' 
            });
        }
        
        const result = await pool.query(`
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, reason, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING appointment_id, appointment_code
        `, [patientId, doctorId, appointmentDate, appointmentTime, appointmentType || 'Scheduled', reason || null, notes || null]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Appointment booked successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, status, reason, notes } = req.body;
        
        await pool.query(`
            UPDATE appointments 
            SET appointment_date = $1,
                appointment_time = $2,
                status = $3,
                reason = $4,
                notes = $5,
                updated_date = CURRENT_TIMESTAMP
            WHERE appointment_id = $6
        `, [appointmentDate, appointmentTime, status, reason || null, notes || null, req.params.id]);
        
        res.json({ success: true, message: 'Appointment updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Scheduled', 'Completed', 'Cancelled', 'No-Show'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        
        await pool.query('UPDATE appointments SET status = $1, updated_date = CURRENT_TIMESTAMP WHERE appointment_id = $2', [status, req.params.id]);
        
        res.json({ success: true, message: 'Appointment status updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
