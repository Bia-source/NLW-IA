import { FastifyInstance } from "fastify";
import { prisma } from "../connection/prisma";
import { z } from "zod";
import { createReadStream } from "node:fs";
import { openai } from "../connection/openai";

type VideoProps = {
    path: string;
}

type ReturnOpenai = {
    text: string;
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

        const { text:transcription} = await openai.audio.transcriptions.create({
           file: audioReadStream,
           model: 'whisper-1',
           language: 'pt',
           response_format: 'json',
           temperature: 0,
           prompt
        }) as ReturnOpenai;

        await prisma.video.update({
            where: {
                id: videoId
            },
            data: {
                transcription
            }
        })
        return transcription;
    });
}