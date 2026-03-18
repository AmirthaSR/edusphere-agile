import { app } from "@azure/functions";

app.http("authTest", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        context.log("Auth test triggered");

        return {
            status: 200,
            jsonBody: {
                message: "EduSphere API working 🚀"
            }
        };
    }
});