import { FastifyInstance } from "fastify";
import { prisma } from "../connection/prisma";
import { z } from "zod";
import { createReadStream } from "node:fs";

type VideoProps = {
    path: string;
}

export async function createTranscriptionRoute(app: FastifyInstance){
    app.post('/videos/:videoId/transcription', async (req)=> {
        const paramsSchema = z.object({
            videoId: z.string().uuid()
        });

        const bodySchema = z.object({
            prompt: z.string()
        });

        const { videoId } = paramsSchema.parse(req.params);
        const { prompt } = bodySchema.parse(req.body);

        const { path } = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        }) as VideoProps;

        const audioReadStream = createReadStream(path);
        

        return {
            videoId,
            prompt,
            videoPath: path
        }
    });
}