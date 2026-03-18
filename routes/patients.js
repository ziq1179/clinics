const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT patient_id, patient_code, full_name, cnic, contact_number, 
                   gender, date_of_birth, age, address, medical_history, 
                   created_date, is_active
            FROM patients 
            WHERE is_active = true
            ORDER BY created_date DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT patient_id, patient_code, full_name, cnic, contact_number, 
                   gender, date_of_birth, age, address, medical_history, 
                   created_date, is_active
            FROM patients 
            WHERE patient_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/search/:query', async (req, res) => {
    try {
        const searchQuery = `%${req.params.query}%`;
        const result = await pool.query(`
            SELECT patient_id, patient_code, full_name, cnic, contact_number, 
                   gender, date_of_birth, age, address
            FROM patients 
            WHERE is_active = true 
            AND (full_name ILIKE $1 
                 OR patient_code ILIKE $1 
                 OR cnic ILIKE $1 
                 OR contact_number ILIKE $1)
            ORDER BY full_name
        `, [searchQuery]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { fullName, cnic, contactNumber, gender, dateOfBirth, address, medicalHistory } = req.body;
        
        if (!fullName || !contactNumber || !gender) {
            return res.status(400).json({ 
                success: false, 
                error: 'Full name, contact number, and gender are required' 
            });
        }
        
        const result = await pool.query(`
            INSERT INTO patients (full_name, cnic, contact_number, gender, date_of_birth, address, medical_history)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING patient_id, patient_code
        `, [fullName, cnic || null, contactNumber, gender, dateOfBirth || null, address || null, medicalHistory || null]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Patient registered successfully',
            data: result.rows[0]
        });
    } catch (err) {
        if (err.message.includes('unique')) {
            return res.status(400).json({ success: false, error: 'CNIC already exists' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { fullName, cnic, contactNumber, gender, dateOfBirth, address, medicalHistory } = req.body;
        
        await pool.query(`
            UPDATE patients 
            SET full_name = $1, 
                cnic = $2, 
                contact_number = $3,
                gender = $4,
                date_of_birth = $5,
                address = $6,
                medical_history = $7,
                updated_date = CURRENT_TIMESTAMP
            WHERE patient_id = $8
        `, [fullName, cnic || null, contactNumber, gender, dateOfBirth || null, address || null, medicalHistory || null, req.params.id]);
        
        res.json({ success: true, message: 'Patient updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('UPDATE patients SET is_active = false WHERE patient_id = $1', [req.params.id]);
        res.json({ success: true, message: 'Patient deactivated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
