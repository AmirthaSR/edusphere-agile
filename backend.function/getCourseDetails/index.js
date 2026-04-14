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
    const courseId = req.query.courseId;
    if (!courseId) {
      context.res = { status: 400, body: { error: 'courseId is required' } };
      return;
    }

    await sql.connect(config);

    const courseResult = await sql.query`
      SELECT course_id, title, description FROM Courses WHERE course_id = ${courseId}
    `;

    if (courseResult.recordset.length === 0) {
      context.res = { status: 404, body: { error: 'Course not found' } };
      return;
    }

    const lessonsResult = await sql.query`
      SELECT lesson_id, title, content, order_num 
      FROM lessons WHERE course_id = ${courseId} 
      ORDER BY order_num
    `;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        course: courseResult.recordset[0],
        lessons: lessonsResult.recordset
      }
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};