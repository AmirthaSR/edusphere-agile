import { app } from "@azure/functions";

app.http("login", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { email, password } = body;

            if (!email || !password) {
                return {
                    status: 400,
                    jsonBody: { message: "Email and password required" }
                };
            }

            // TEMP: fake user (we replace with DB later)
            if (email === "test@gmail.com" && password === "1234") {
                return {
                    status: 200,
                    jsonBody: {
                        message: "Login successful",
                        user: { email }
                    }
                };
            }

            return {
                status: 401,
                jsonBody: { message: "Invalid credentials" }
            };

        } catch (err) {
            return {
                status: 500,
                jsonBody: { message: "Server error" }
            };
        }
    }
});