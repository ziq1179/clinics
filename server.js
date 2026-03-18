const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { getConnection } = require('./database/config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Avoid 404 for browser's default favicon request (icon is set in index.html)
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Clinic Management System API is running',
        timestamp: new Date().toISOString()
    });
});

const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const prescriptionsRouter = require('./routes/prescriptions');
const billingRouter = require('./routes/billing');
const forecastingRouter = require('./routes/forecasting');

app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/forecasting', forecastingRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: err.message 
    });
});

async function startServer() {
    try {
        await getConnection();
        
        app.listen(PORT, () => {
            console.log('\n🏥 ========================================');
            console.log('   Clinic Management System - Phase 1');
            console.log('========================================');
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
            console.log('========================================\n');
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();

process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down gracefully...');
    process.exit(0);
});
