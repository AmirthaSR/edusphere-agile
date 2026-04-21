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
    const userId = req.query.userId;
    if (!userId) {
      context.res = { status: 400, headers: CORS, body: { error: 'userId is required' } };
      return;
    }

    const pool = await sql.connect(config);

    // 1. All enrolled courses with their current progress %
    const enrolledResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          c.course_id,
          c.title        AS course_title,
          c.description,
          ISNULL(e.progress, 0) AS progress_pct
        FROM Enrollments e
        JOIN Courses c ON e.course_id = c.course_id
        WHERE e.user_id = @userId
        ORDER BY c.course_id
      `);

    const enrolledCourses = enrolledResult.recordset;

    // 2. For each enrolled course, get per-lesson completion status
    const courseDetails = await Promise.all(enrolledCourses.map(async (course) => {
      const lessonsResult = await pool.request()
        .input('userId',   sql.Int, userId)
        .input('courseId', sql.Int, course.course_id)
        .query(`
          SELECT
            l.lesson_id,
            l.title        AS lesson_title,
            l.order_num,
            CASE WHEN p.completed = 1 THEN 1 ELSE 0 END AS is_completed,
            p.updated_at
          FROM lessons l
          LEFT JOIN progress p
            ON l.lesson_id = p.lesson_id
            AND p.user_id = @userId
            AND p.course_id = @courseId
          WHERE l.course_id = @courseId
          ORDER BY l.order_num
        `);

      const lessons       = lessonsResult.recordset;
      const totalLessons  = lessons.length;
      const doneLessons   = lessons.filter(l => l.is_completed).length;

      return {
        course_id:    course.course_id,
        course_title: course.course_title,
        description:  course.description,
        progress_pct: course.progress_pct,
        total_lessons: totalLessons,
        completed_lessons: doneLessons,
        lessons: lessons.map(l => ({
          lesson_id:    l.lesson_id,
          title:        l.lesson_title,
          order_num:    l.order_num,
          is_completed: l.is_completed === 1,
          completed_at: l.updated_at || null
        }))
      };
    }));

    // 3. Summary stats
    const totalLessonsAll    = courseDetails.reduce((s, c) => s + c.total_lessons, 0);
    const completedLessonsAll = courseDetails.reduce((s, c) => s + c.completed_lessons, 0);
    const completedCourses   = courseDetails.filter(c => c.progress_pct === 100).length;
    const overallProgress    = totalLessonsAll > 0
      ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0;

    context.res = {
      status: 200,
      headers: CORS,
      body: {
        summary: {
          total_enrolled:   enrolledCourses.length,
          completed_courses: completedCourses,
          total_lessons:    totalLessonsAll,
          completed_lessons: completedLessonsAll,
          overall_progress: overallProgress
        },
        courses: courseDetails
      }
    };
  } catch (err) {
    context.log('getStudentAnalytics error:', err.message);
    context.res = { status: 500, headers: CORS, body: { error: err.message } };
  }
};