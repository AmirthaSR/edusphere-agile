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

    const pool = await sql.connect(config);

    // Delete enrollments first to avoid foreign key constraint error
    await pool.request()
      .input('courseId', sql.Int, courseId)
      .query('DELETE FROM Enrollments WHERE course_id = @courseId');

    // Then delete the course
    const result = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query('DELETE FROM Courses WHERE course_id = @courseId');

    if (result.rowsAffected[0] === 0) {
      context.res = { status: 404, body: { error: 'Course not found' } };
      return;
    }

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: { message: 'Course deleted successfully' }
    };
  } catch (err) {
    context.log('deleteCourse error:', err.message);
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};