import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/getAllPrompts.routes";
import { uploadVideoRoute } from "./routes/uploadVideo.routes";
import { createTranscriptionRoute } from "./routes/createTranscription.routes";
import { generationAIcompletionRoute } from "./routes/generateAIcompletion.routes";

const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generationAIcompletionRoute);

app.listen({
    port: 3333
}).then(()=> {
    console.log("HTTP Server Running")
});