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
      SELECT course_id, title, description FROM Courses
    `;
    await sql.close();

    const courses = result.recordset.map((c, i) => ({
    id:          c.course_id,
    name:        c.title,
    description: c.description,
    icon:        'book',
    bg:          '#1e3a5f',
    progress:    0,
    lessons:     'General'
  }));

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { courses }
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