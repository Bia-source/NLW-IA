import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { FormEvent } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type VideoType = {
    id: string;
}

type StatusType = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'

const statusMessage = {
    converting: 'Convertendo...',
    generating: 'Transcrevendo...',
    uploading: 'Carregando...',
    success: 'Sucesso!',
}

type VideoInputFormProps = {
    onVideoUploaded: (id: string) => void;
}

export function VideoInputForm({ onVideoUploaded }: VideoInputFormProps) {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [status, setStatus] = useState<StatusType>('waiting');
    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget;

        if (!files) {
            return
        }

        const selectedFile = files[0];

        setVideoFile(selectedFile);
    }

    async function convertVideoToAudio(video: File) {
        const ffmpeg = await getFFmpeg();
        await ffmpeg.writeFile('input.mp4', await fetchFile(video));

        //    ffmpeg.on('log', log => {
        //     console.log(log);
        //    })

        ffmpeg.on('progress', res => {
            console.log('Convert progress: ' + Math.round(res.progress * 100));
        });

        await ffmpeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3'
        ]);

        const data = await ffmpeg.readFile('output.mp3');

        const audioFileBlob = new Blob([data], { type: 'audio/mpeg' });
        const audioFile = new File([audioFileBlob], 'audio.mp3', { type: 'audio/mpeg' });

        return audioFile;
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const prompt = promptInputRef.current?.value;

        if (!videoFile) {
            return
        }

        setStatus('converting');
        const audioFile = await convertVideoToAudio(videoFile);

        const data = new FormData();

        data.append('file', audioFile);

        setStatus('uploading');
        const response = await api.post('/videos', data);
        const { id } = response.data.video as VideoType;

        setStatus('generating')
        await api.post(`/videos/${id}/transcription`, {
            prompt
        });

        setStatus('success');
        onVideoUploaded(id);
    }

    const previewUrl = useMemo(() => {
        if (!videoFile) {
            return null;
        }

        return URL.createObjectURL(videoFile);

    }, [videoFile]);

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label
                htmlFor="video"
                className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-white/5"
            >
                {previewUrl ? (
                    <video src={previewUrl} controls={false} className="pointer-events-none absolute inset-0" />
                ) : (
                    <>
                        <FileVideo className="w-4 h-4" />
                        Selecione um vídeo
                    </>
                )}
            </label>

            <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

            <Separator />

            <div className="space-y-2">
                <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
                <Textarea disabled={status !== 'waiting'} ref={promptInputRef} id="transcription_prompt" className="h-20 leading-relaxed resize-none" placeholder="Inclua palavras-chave mencionadas no vídeo separadas por virgula (,)" />
            </div>

            <Button 
             disabled={status !== 'waiting'} 
             type="submit" 
             className="w-full data-[success=true]: bg-green-500"
             data-success={status === 'success'}
             >
                {status === 'waiting' ?
                   <>
                    Carregar vídeo
                    <Upload className="w-4 h-4 ml-2" />    
                   </>
                   :
                   statusMessage[status]
            }
            </Button>


        </form>
    )
}
