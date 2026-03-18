const { app } = require('@azure/functions');

app.http('login', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        let body = {};
        try {
            body = await request.json();
        } catch (e) {}

        const { phone, password } = body;

        if (!phone || !password) {
            return {
                status: 400,
                jsonBody: { message: "Missing phone or password" }
            };
        }

        if (phone === "1234567890" && password === "admin") {
            return {
                status: 200,
                jsonBody: { message: "Login successful 🎉" }
            };
        }

        return {
            status: 401,
            jsonBody: { message: "Invalid credentials ❌" }
        };
    }
});