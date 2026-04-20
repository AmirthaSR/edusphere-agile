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
    const userId = req.query.userId;
    if (!userId) {
      context.res = { status: 400, body: { error: 'userId is required' } };
      return;
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          c.course_id AS id,
          c.title AS name,
          c.description,
          e.progress
        FROM Enrollments e
        JOIN Courses c ON e.course_id = c.course_id
        WHERE e.user_id = @userId
      `);

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { courses: result.recordset }
    };
  } catch (err) {
    context.log('getEnrolledCourses error:', err.message);
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};