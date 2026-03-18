const express = require('express');
const router = express.Router();
const { pool } = require('../database/config');
const { spawn } = require('child_process');
const path = require('path');

// Get next 7 days forecast
router.get('/next-week', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                forecast_date,
                predicted_revenue,
                lower_bound,
                upper_bound,
                TO_CHAR(forecast_date, 'Day') as day_name,
                TO_CHAR(forecast_date, 'DD-Mon-YYYY') as formatted_date
            FROM revenue_forecasts
            WHERE forecast_date >= CURRENT_DATE
            AND forecast_date < CURRENT_DATE + INTERVAL '7 days'
            ORDER BY forecast_date
        `);
        
        res.json({ 
            success: true, 
            data: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get next 30 days forecast
router.get('/next-month', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                forecast_date,
                predicted_revenue,
                lower_bound,
                upper_bound
            FROM revenue_forecasts
            WHERE forecast_date >= CURRENT_DATE
            AND forecast_date < CURRENT_DATE + INTERVAL '30 days'
            ORDER BY forecast_date
        `);
        
        res.json({ 
            success: true, 
            data: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get monthly forecast summary
router.get('/monthly-summary', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(predicted_revenue) as total_predicted,
                SUM(lower_bound) as total_lower,
                SUM(upper_bound) as total_upper,
                AVG(predicted_revenue) as avg_daily,
                COUNT(*) as days_count
            FROM revenue_forecasts
            WHERE forecast_date >= CURRENT_DATE
            AND forecast_date < CURRENT_DATE + INTERVAL '30 days'
        `);
        
        res.json({ 
            success: true, 
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get latest model metrics
router.get('/metrics', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                metric_date,
                model_version,
                mae,
                mape,
                rmse,
                accuracy,
                data_points_used,
                training_date
            FROM forecast_metrics
            ORDER BY training_date DESC
            LIMIT 1
        `);
        
        res.json({ 
            success: true, 
            data: result.rows[0] || null
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get forecast accuracy history
router.get('/accuracy', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const result = await pool.query(`
            SELECT 
                date,
                predicted_revenue,
                actual_revenue,
                error_amount,
                error_percentage,
                model_version
            FROM forecast_accuracy
            WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY date DESC
        `);
        
        res.json({ 
            success: true, 
            data: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Trigger forecast generation (admin only)
router.post('/generate', async (req, res) => {
    try {
        const { months_back = 12 } = req.body;
        
        // Run Python forecasting script
        const pythonScript = path.join(__dirname, '..', 'ml_forecasting', 'supabase_forecaster.py');
        
        const pythonProcess = spawn('python', [pythonScript]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                res.json({ 
                    success: true, 
                    message: 'Forecast generated successfully',
                    output: output
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    error: 'Forecast generation failed',
                    details: errorOutput
                });
            }
        });
        
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update daily revenue summary (run daily via cron)
router.post('/update-summary', async (req, res) => {
    try {
        await pool.query('SELECT update_daily_revenue_summary()');
        
        res.json({ 
            success: true, 
            message: 'Daily revenue summary updated successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get historical data for charts
router.get('/historical', async (req, res) => {
    try {
        const { months = 12 } = req.query;
        
        const result = await pool.query(`
            SELECT 
                date,
                total_revenue,
                consultation_revenue,
                lab_revenue,
                pharmacy_revenue,
                num_patients,
                avg_revenue_per_patient
            FROM daily_revenue_summary
            WHERE date >= CURRENT_DATE - INTERVAL '${months} months'
            ORDER BY date
        `);
        
        res.json({ 
            success: true, 
            data: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Compare forecast vs actual for a specific date
router.get('/compare/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        const forecast = await pool.query(`
            SELECT predicted_revenue, lower_bound, upper_bound
            FROM revenue_forecasts
            WHERE forecast_date = $1
        `, [date]);
        
        const actual = await pool.query(`
            SELECT total_revenue
            FROM daily_revenue_summary
            WHERE date = $1
        `, [date]);
        
        res.json({ 
            success: true, 
            data: {
                date: date,
                forecast: forecast.rows[0] || null,
                actual: actual.rows[0] || null,
                has_actual: actual.rows.length > 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
