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
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      context.res = {
        status: 400,
        body: { error: 'userId and courseId are required' }
      };
      return;
    }

    const pool = await sql.connect(config);

    // Check if already enrolled
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('courseId', sql.Int, courseId)
      .query('SELECT * FROM Enrollments WHERE user_id = @userId AND course_id = @courseId');

    if (existing.recordset.length > 0) {
      context.res = {
        status: 409,
        body: { message: 'Already enrolled in this course' }
      };
      return;
    }

    // Enroll the user
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('courseId', sql.Int, courseId)
      .query('INSERT INTO Enrollments (user_id, course_id, progress) VALUES (@userId, @courseId, 0)');

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { message: 'Enrolled successfully' }
    };
  } catch (err) {
    context.log('enrollCourse error:', err.message);
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};