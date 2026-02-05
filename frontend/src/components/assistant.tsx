"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

import { Message } from "@/types/assistant";
import { Page } from "@/constants";


export function MessageBubble({ message }: { message: Message }) {
    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-5 py-1.5 ${message.role === 'user'
                ? 'w-fit break-words max-w-[60%] bg-blue-600 text-white rounded-tr-none'
                : 'w-full'
                }`}>
                <div className={`text-[15px] leading-relaxed prose max-w-none ${message.role === "user" && "text-white"}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{stringifyMessage(message)}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export function stringifyMessage(message: Message): string {
    let footnoteCounter = 1;
    const footnotes: string[] = [];
    const output: string[] = [];
    const seen = new Set<string>();

    for (const content of message.content) {
        let text = content.text ?? '';

        if (content.annotations?.length) {
            const markers: string[] = [];

            for (const annotation of content.annotations) {
                if (seen.has(annotation.file_id)) continue;
                seen.add(annotation.file_id);
                const index = footnoteCounter++;
                const filename = annotation.filename.split(".")[0];
                markers.push(` ([${filename}][${index}])`);
                footnotes.push(`[${index}]: ${Page.DOCUMENTS}/${annotation.file_id}?source=assistant&filename=${encodeURIComponent(annotation.filename)} (${filename})`);
            }

            text += markers.join('');
        }

        output.push(text);
    }

    if (footnotes.length) {
        output.push('\n\n' + footnotes.join('\n\n'));
    }

    console.log(output.join(''));
    return output.join('');
}
