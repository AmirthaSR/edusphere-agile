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
      SELECT course_id, title, description, category FROM Courses
    `;

    const courses = result.recordset.map((c, i) => {
      const icons = ['🧮','🌐','🤖','☁️','🗄️','📊','🔐','📱'];
      const bgs   = ['#1e3a5f','#1a3d2e','#3b2a1a','#1e2b4a','#2a1e3d','#1a2e3d','#3d1e2a','#2a3d1e'];
      return {
        id: c.course_id,
        name: c.title,
        description: c.description,
        category: c.category,
        icon: icons[i % icons.length],
        bg: bgs[i % bgs.length],
        progress: 0,
        lessons: c.category || 'General'
      };
    });

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: { courses }
    };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};