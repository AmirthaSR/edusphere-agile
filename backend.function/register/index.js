const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
    server: 'edusphere-db-server.database.windows.net',
    database: 'edusphere-db',
    user: 'edusphereadmin',
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

module.exports = async function (context, req) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        context.res = { status: 400, body: { message: 'Name, email and password are required' } };
        return;
    }

    try {
        await sql.connect(config);
        
        const existingUser = await sql.query`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.recordset.length > 0) {
            context.res = { status: 400, body: { message: 'Email already registered' } };
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await sql.query`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword})`;

        context.res = { status: 201, body: { message: 'Registration successful' } };
    } catch (err) {
        context.res = { status: 500, body: { message: 'Server error', error: err.message } };
    }
};