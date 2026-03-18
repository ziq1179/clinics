const { Pool } = require('pg');
require('dotenv').config();

// Neon / PostgreSQL connection configuration
// Neon requires SSL - use ?sslmode=require in DATABASE_URL or we enable it for production
const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString && connectionString.includes('neon.tech');

const pool = new Pool({
    connectionString,
    ssl: isNeon || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL' + (isNeon ? ' (Neon)' : ''));
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

async function getConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connection established');
        client.release();
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
}

async function closeConnection() {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database connection:', err);
    }
}

module.exports = {
    pool,
    query,
    getConnection,
    closeConnection
};
