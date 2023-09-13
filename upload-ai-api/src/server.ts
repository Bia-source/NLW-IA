import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/getAllPrompts.routes";
import { uploadVideoRoute } from "./routes/uploadVideo.routes";

const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);

app.listen({
    port: 3333
}).then(()=> {
    console.log("HTTP Server Running")
});