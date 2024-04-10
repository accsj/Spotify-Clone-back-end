// Database connection

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.connection_string
})

module.exports = pool;