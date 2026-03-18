const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');
const { generateBillPDF } = require('../utils/pdfGenerator');

router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, paymentStatus } = req.query;
        
        let query = `
            SELECT 
                b.bill_id, b.bill_number, b.bill_date, b.consultation_fee, b.lab_charges,
                b.medicine_charges, b.other_charges, b.total_amount, b.discount, b.net_amount,
                b.payment_method, b.payment_status, b.notes,
                p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                a.appointment_code, d.full_name AS doctor_name
            FROM billing b
            INNER JOIN patients p ON b.patient_id = p.patient_id
            LEFT JOIN appointments a ON b.appointment_id = a.appointment_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (startDate) {
            query += ` AND DATE(b.bill_date) >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }
        
        if (endDate) {
            query += ` AND DATE(b.bill_date) <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }
        
        if (paymentStatus) {
            query += ` AND b.payment_status = $${paramCount}`;
            params.push(paymentStatus);
            paramCount++;
        }
        
        query += ' ORDER BY b.bill_date DESC';
        
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
                COUNT(*) AS total_bills,
                COALESCE(SUM(net_amount), 0) AS total_revenue,
                COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN net_amount ELSE 0 END), 0) AS paid_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN net_amount ELSE 0 END), 0) AS pending_amount
            FROM billing
            WHERE DATE(bill_date) = CURRENT_DATE
        `);
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.bill_id, b.bill_number, b.bill_date, b.consultation_fee, b.lab_charges,
                b.medicine_charges, b.other_charges, b.total_amount, b.discount, b.net_amount,
                b.payment_method, b.payment_status, b.notes, b.created_by,
                b.patient_id, p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                b.appointment_id, a.appointment_code, 
                d.full_name AS doctor_name, d.specialization
            FROM billing b
            INNER JOIN patients p ON b.patient_id = p.patient_id
            LEFT JOIN appointments a ON b.appointment_id = a.appointment_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE b.bill_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { 
            appointmentId, patientId, consultationFee, labCharges, 
            medicineCharges, otherCharges, discount, paymentMethod, 
            paymentStatus, notes, createdBy 
        } = req.body;
        
        if (!patientId || !paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                error: 'Patient and payment method are required' 
            });
        }
        
        const result = await pool.query(`
            INSERT INTO billing (
                appointment_id, patient_id, consultation_fee, lab_charges, 
                medicine_charges, other_charges, discount, payment_method, 
                payment_status, notes, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING bill_id, bill_number, net_amount
        `, [appointmentId || null, patientId, consultationFee || 0, labCharges || 0, medicineCharges || 0, otherCharges || 0, discount || 0, paymentMethod, paymentStatus || 'Paid', notes || null, createdBy || 'Admin']);
        
        res.status(201).json({ 
            success: true, 
            message: 'Bill created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch('/:id/payment-status', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        
        if (!['Paid', 'Pending', 'Partial'].includes(paymentStatus)) {
            return res.status(400).json({ success: false, error: 'Invalid payment status' });
        }
        
        await pool.query('UPDATE billing SET payment_status = $1 WHERE bill_id = $2', [paymentStatus, req.params.id]);
        
        res.json({ success: true, message: 'Payment status updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id/pdf', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.bill_number, b.bill_date, b.consultation_fee, b.lab_charges,
                b.medicine_charges, b.other_charges, b.total_amount, b.discount, b.net_amount,
                b.payment_method, b.payment_status, b.notes,
                p.patient_code, p.full_name AS patient_name, p.contact_number AS patient_contact,
                a.appointment_code, d.full_name AS doctor_name, d.specialization
            FROM billing b
            INNER JOIN patients p ON b.patient_id = p.patient_id
            LEFT JOIN appointments a ON b.appointment_id = a.appointment_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE b.bill_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }
        
        const bill = result.rows[0];
        const pdfBuffer = await generateBillPDF(bill);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill-${bill.bill_number}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
