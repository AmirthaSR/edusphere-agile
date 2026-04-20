const sql = require('mssql');

const config = {
  user: 'edusphereadmin',
  password: process.env.DB_PASSWORD,
  server: 'edusphere-db-server.database.windows.net',
  database: 'edusphere-db',
  options: { encrypt: true }
};

module.exports = async function (context, req) {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      context.res = { status: 400, body: { error: 'userId and role are required' } };
      return;
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      context.res = { status: 400, body: { error: 'Role must be student, teacher, or admin' } };
      return;
    }

    await sql.connect(config);

    await sql.query`
      UPDATE Users SET role = ${role} WHERE user_id = ${userId}
    `;

    await sql.close();

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { message: `User role updated to ${role}` }
    };

  } catch (err) {
    await sql.close().catch(() => {});
    context.res = {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: { error: err.message }
    };
  }
};