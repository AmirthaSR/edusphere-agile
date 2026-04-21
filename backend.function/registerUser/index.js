const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
  user: 'edusphereadmin',
  password: process.env.DB_PASSWORD,
  server: 'edusphere-db-server.database.windows.net',
  database: 'edusphere-db',
  options: { encrypt: true }
};

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS, body: '' };
    return;
  }

  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      context.res = { status: 400, headers: CORS, body: { error: 'name, email and password are required' } };
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      context.res = { status: 400, headers: CORS, body: { error: 'Invalid email format' } };
      return;
    }

    if (password.length < 6) {
      context.res = { status: 400, headers: CORS, body: { error: 'Password must be at least 6 characters' } };
      return;
    }

    const pool = await sql.connect(config);

    const existing = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .query('SELECT user_id FROM Users WHERE email = @email');

    if (existing.recordset.length > 0) {
      context.res = { status: 409, headers: CORS, body: { error: 'Email already registered' } };
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const insertResult = await pool.request()
      .input('name',     sql.NVarChar, name.trim())
      .input('email',    sql.NVarChar, email.toLowerCase().trim())
      .input('password', sql.NVarChar, hashed)
      .query(`
        INSERT INTO Users (name, email, password, role)
        OUTPUT INSERTED.user_id, INSERTED.name, INSERTED.email, INSERTED.role
        VALUES (@name, @email, @password, 'student')
      `);

    const newUser = insertResult.recordset[0];

    context.res = {
      status: 201,
      headers: CORS,
      body: {
        success: true,
        message: 'Account created successfully',
        user: { user_id: newUser.user_id, name: newUser.name, email: newUser.email, role: newUser.role }
      }
    };
  } catch (err) {
    context.log('registerUser error:', err.message);
    context.res = { status: 500, headers: CORS, body: { error: 'Server error. Please try again.' } };
  }
};