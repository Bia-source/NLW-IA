import { fastify } from "fastify";
import { getAllPrompts } from "./routes/getAllPrompts.routes";

const app = fastify();

app.register(getAllPrompts);

app.listen({
    port: 3333
}).then(()=> {
    console.log("HTTP Server Running")
});