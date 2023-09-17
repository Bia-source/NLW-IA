import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";

type PromptType = {
    id: string;
    title: string;
    template: string;
}

type PromptSelectProps = {
    onPromptSelected: (template: string) => void;
}

export function PromptSelect({onPromptSelected}: PromptSelectProps) {
    const [prompts, setPrompts] = useState<PromptType[] | null>(null);

    useEffect(() => {
        api.get("/prompts").then(res => {
            setPrompts(res.data)
        })
    }, [prompts]);

    function handlePromptSelected(promptId: string){
       const selectedPrompt = prompts?.find(prompt => prompt.id === promptId);

       if(!selectedPrompt){
            return
       }

       onPromptSelected(selectedPrompt.template);
    }

    return (
        <Select onValueChange={handlePromptSelected}>
            <SelectTrigger>
                <SelectValue placeholder="Selecione um prompt..." />
            </SelectTrigger>
            <SelectContent>
                {prompts?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}