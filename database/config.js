const { Pool } = require('pg');
require('dotenv').config();

// Supabase/PostgreSQL connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL/Supabase');
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
