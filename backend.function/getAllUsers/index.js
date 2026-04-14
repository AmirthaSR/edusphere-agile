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
    await sql.connect(config);

    const result = await sql.query`
      SELECT user_id, name, email, role FROM Users
    `;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        users: result.recordset
      }
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};