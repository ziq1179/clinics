const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT doctor_id, doctor_code, full_name, specialization, qualification,
                   contact_number, email, consultation_fee, availability_schedule, is_active
            FROM doctors 
            WHERE is_active = true
            ORDER BY full_name
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT doctor_id, doctor_code, full_name, specialization, qualification,
                   contact_number, email, consultation_fee, availability_schedule, is_active
            FROM doctors 
            WHERE doctor_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { fullName, specialization, qualification, contactNumber, email, consultationFee, availabilitySchedule } = req.body;
        
        if (!fullName || !specialization || !contactNumber) {
            return res.status(400).json({ 
                success: false, 
                error: 'Full name, specialization, and contact number are required' 
            });
        }
        
        const result = await pool.query(`
            INSERT INTO doctors (full_name, specialization, qualification, contact_number, email, consultation_fee, availability_schedule)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING doctor_id, doctor_code
        `, [fullName, specialization, qualification || null, contactNumber, email || null, consultationFee || 0, availabilitySchedule || null]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Doctor added successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { fullName, specialization, qualification, contactNumber, email, consultationFee, availabilitySchedule } = req.body;
        
        await pool.query(`
            UPDATE doctors 
            SET full_name = $1,
                specialization = $2,
                qualification = $3,
                contact_number = $4,
                email = $5,
                consultation_fee = $6,
                availability_schedule = $7
            WHERE doctor_id = $8
        `, [fullName, specialization, qualification || null, contactNumber, email || null, consultationFee, availabilitySchedule || null, req.params.id]);
        
        res.json({ success: true, message: 'Doctor updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('UPDATE doctors SET is_active = false WHERE doctor_id = $1', [req.params.id]);
        res.json({ success: true, message: 'Doctor deactivated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
