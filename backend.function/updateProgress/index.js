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
    const { userId, courseId, lessonId } = req.body;

    if (!userId || !courseId || !lessonId) {
      context.res = { status: 400, body: { error: 'userId, courseId and lessonId are required' } };
      return;
    }

    await sql.connect(config);

    // Check if progress record already exists
    const existing = await sql.query`
      SELECT progress_id FROM progress 
      WHERE user_id = ${userId} AND course_id = ${courseId} AND lesson_id = ${lessonId}
    `;

    if (existing.recordset.length > 0) {
      // Update existing record
      await sql.query`
        UPDATE progress SET completed = 1 
        WHERE user_id = ${userId} AND course_id = ${courseId} AND lesson_id = ${lessonId}
      `;
    } else {
      // Insert new record
      await sql.query`
        INSERT INTO progress (user_id, course_id, lesson_id, completed) 
        VALUES (${userId}, ${courseId}, ${lessonId}, 1)
      `;
    }

    // Update overall course progress in Enrollments
    const totalLessons = await sql.query`
      SELECT COUNT(*) AS total FROM lessons WHERE course_id = ${courseId}
    `;

    const completedLessons = await sql.query`
      SELECT COUNT(*) AS completed FROM progress 
      WHERE user_id = ${userId} AND course_id = ${courseId} AND completed = 1
    `;

    const total = totalLessons.recordset[0].total;
    const completed = completedLessons.recordset[0].completed;
    const progressPercent = Math.round((completed / total) * 100);

    await sql.query`
      UPDATE Enrollments SET progress = ${progressPercent}
      WHERE user_id = ${userId} AND course_id = ${courseId}
    `;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        message: 'Progress updated successfully',
        progress: progressPercent
      }
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};