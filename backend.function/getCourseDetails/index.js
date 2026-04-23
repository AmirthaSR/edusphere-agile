const sql = require('mssql');

const config = {
  user: 'edusphereadmin',
  password: process.env.DB_PASSWORD,
  server: 'edusphere-db-server.database.windows.net',
  database: 'edusphere-db',
  options: { encrypt: true }
};

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS, body: '' };
    return;
  }

  try {
    const courseId = req.query.courseId;
    if (!courseId) {
      context.res = { status: 400, headers: CORS, body: { error: 'courseId is required' } };
      return;
    }

    const pool = await sql.connect(config);

    const courseResult = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query('SELECT course_id, title, description,video_url FROM Courses WHERE course_id = @courseId');

    if (courseResult.recordset.length === 0) {
      context.res = { status: 404, headers: CORS, body: { error: 'Course not found' } };
      return;
    }

    // Fetch lessons — video_url column: use TRY_CONVERT so it doesn't crash
    // if the column doesn't exist yet on older deployments
    const lessonsResult = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT
          lesson_id,
          title,
          content,
          order_num,
          -- video_url column: add it to your lessons table via:
          -- ALTER TABLE lessons ADD video_url NVARCHAR(500) NULL;
          ISNULL(video_url, '') AS video_url
        FROM lessons
        WHERE course_id = @courseId
        ORDER BY order_num
      `);

    context.res = {
      status: 200,
      headers: CORS,
      body: {
        course: courseResult.recordset[0],
        lessons: lessonsResult.recordset
      }
    };
  } catch (err) {
    context.log('getCourseDetails error:', err.message);
    context.res = { status: 500, headers: CORS, body: { error: err.message } };
  }
};