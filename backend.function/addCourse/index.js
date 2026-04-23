const sql = require('mssql');

const config = {
  user: 'edusphereadmin',
  password: process.env.DB_PASSWORD,
  server: 'edusphere-db-server.database.windows.net',
  database: 'edusphere-db',
  options: { encrypt: true }
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    return;
  }

  const { title, description, video_url } = req.body || {};

  if (!title || !description) {
    context.res = {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: { error: 'title and description are required' }
    };
    return;
  }

  try {
    await sql.connect(config);

    await sql.query`
      INSERT INTO Courses (title, description, video_url)
      VALUES (${title}, ${description}, ${video_url || null})
    `;

    await sql.close();

    context.res = {
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: { message: 'Course added successfully' }
    };
  } catch (err) {
    await sql.close().catch(() => {});
    context.res = {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: { error: 'Failed to add course', details: err.message }
    };
  }
};