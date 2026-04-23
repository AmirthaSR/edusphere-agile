const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false }
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
    const pool = await sql.connect(config);

    await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('video_url', sql.NVarChar, video_url || null)
      .query(`INSERT INTO Courses (title, description, video_url)
              VALUES (@title, @description, @video_url)`);

    context.res = {
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: { message: 'Course added successfully' }
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: { error: 'Failed to add course', details: err.message }
    };
  }
};