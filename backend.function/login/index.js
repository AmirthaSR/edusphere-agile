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
    const { name, password } = req.body;

    if (!name || !password) {
        context.res = { status: 400, body: { message: 'Name and password are required' } };
        return;
    }

    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM users WHERE name = ${name}`;
        const user = result.recordset[0];

        if (!user) {
            context.res = { status: 401, body: { message: 'User not found' } };
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            context.res = { status: 401, body: { message: 'Incorrect password' } };
            return;
        }

        context.res = { status: 200, body: { message: 'Login successful', userId: user.user_id } };
    } catch (err) {
        context.res = { status: 500, body: { message: 'Server error', error: err.message } };
    }
};