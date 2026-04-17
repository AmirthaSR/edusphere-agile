const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
  user: 'edusphereadmin',
  password: process.env.DB_PASSWORD,
  server: 'edusphere-db-server.database.windows.net',
  database: 'edusphere-db',
  options: { encrypt: true }
};

module.exports = async function (context, req) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      context.res = { status: 400, body: { error: 'name, email and password are required' } };
      return;
    }

    await sql.connect(config);

    // Check if email already exists
    const existing = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (existing.recordset.length > 0) {
      context.res = { status: 409, body: { error: 'Email already registered' } };
      return;
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    await sql.query`
      INSERT INTO Users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashed}, 'student')
    `;

    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: { success: true, message: 'Account created successfully' }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};