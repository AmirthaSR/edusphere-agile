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
    const { email, password } = req.body;

    if (!email || !password) {
      context.res = { status: 400, body: { error: 'email and password are required' } };
      return;
    }

    await sql.connect(config);

    const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;

    if (result.recordset.length === 0) {
      context.res = { status: 401, body: { success: false, message: 'Invalid email or password' } };
      return;
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      context.res = { status: 401, body: { success: false, message: 'Invalid email or password' } };
      return;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: {
        success: true,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};