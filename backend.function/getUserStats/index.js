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

    await sql.connect(config);

    const enrollResult = await sql.query`
      SELECT COUNT(*) AS totalCourses FROM Enrollments WHERE user_id = ${userId}
    `;

    const progressResult = await sql.query`
      SELECT AVG(CAST(progress AS FLOAT)) AS avgProgress 
      FROM Enrollments WHERE user_id = ${userId}
    `;

    const lessonsResult = await sql.query`
      SELECT COUNT(*) AS completedLessons 
      FROM progress WHERE user_id = ${userId} AND completed = 1
    `;

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        totalCourses: enrollResult.recordset[0].totalCourses,
        avgProgress: Math.round(progressResult.recordset[0].avgProgress || 0),
        completedLessons: lessonsResult.recordset[0].completedLessons
      }
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};