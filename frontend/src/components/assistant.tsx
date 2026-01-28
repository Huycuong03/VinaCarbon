"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

import { Message } from "@/types/assistant";
import { ASSISTANT, BACKEND_API_ENDPOINT, BACKEND_URL } from "@/constants";

import { BotMessageSquare, SendHorizontal, MessageCirclePlus } from "lucide-react"

export function ChatBox() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            window.location.href = '/signin'
        },
    })
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadMessages() {
            const headers: HeadersInit = {
                ...(session?.user?.email && { 'X-Credential': session.user.email, }),
                ...(session?.apiKey && { 'X-Api-Key': session.apiKey, }),
            }
            const response = await fetch(`${BACKEND_URL}${BACKEND_API_ENDPOINT.ASSISTANT}`, { headers });
            const prevMessages: Message[] = await response.json();
            if (response.ok) {
                setMessages([...prevMessages].reverse());

            } else {
                alert(prevMessages.detail);
            }
        }

        if (status === "authenticated") {
            loadMessages();
        }
    }, [status]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const id = messages.length;

        const userMessage: Message = {
            id: (id + 1).toString(),
            role: 'user',
            content: [{
                type: "input_text",
                text: inputValue,
            }]
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(session?.user?.email && { 'X-Credential': session.user.email, }),
            ...(session?.apiKey && { 'X-Api-Key': session.apiKey, }),
        }
        const response = await fetch(`${BACKEND_URL}${BACKEND_API_ENDPOINT.ASSISTANT}`,
            {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    content: inputValue
                })
            }
        );

        const reply: Message[] = await response.json();

        if (response.ok) {
            setMessages(prev => [...prev, ...reply]);
            setIsLoading(false);
        } else {
            alert(reply.detail);
        }
    };

    const handleRenewConversation = async () => {
        setMessages([]);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(session?.user?.email && { 'X-Credential': session.user.email, }),
            ...(session?.apiKey && { 'X-Api-Key': session.apiKey, }),
        }
        const response = await fetch(`${BACKEND_URL}${BACKEND_API_ENDPOINT.ASSISTANT}`,
            {
                method: "DELETE",
                headers: headers
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(error.detail);
        }
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden ">
            <div className="px-6 py-4 flex justify-end items-center">
                <button
                    onClick={handleRenewConversation}
                    className="cursor-pointer text-xs text-gray-400 px-3 py-1.5 rounded-md"
                >
                    <MessageCirclePlus />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center w-[calc(100wh-80px)] mx-auto w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 pb-10 flex items-center">
                                <img src="/logo.png"/>
                            </div>
                            <h1 className="text-3xl font-bold text-forest mb-2">{ASSISTANT.name}</h1>
                            <p className="text-gray-400 text-lg">{ASSISTANT.subtitle}</p>
                            <p className="mt-4 text-sm text-gray-500 italic max-w-md mx-auto">{ASSISTANT.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[60%] pt-4">
                            {ASSISTANT.starterPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInputValue(prompt)}
                                    className="cursor-pointer text-left px-4 py-3 rounded-xl border border-gray-400 text-sm transition-all group"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 w-[calc(100wh-80px)] mx-auto w-full [&_p]:mb-4 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 [&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:p-2 [&_td]:p-2">
                        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="border border-gray-400 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 pt-0">
                <div className="max-w-4xl mx-auto relative">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full border border-gray-400 rounded-full py-4 pl-4 pr-12 focus:outline-none"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <SendHorizontal />
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-2">
                    Trợ lý AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
                </p>
            </div>
        </div>
    );
};

export function MessageBubble({ message }: { message: Message }) {
    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`w-fit max-w-[60%] break-words rounded-2xl px-5 py-1.5 ${message.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'border border-gray-400 rounded-tl-none'
                }`}>
                <div className={`text-[15px] leading-relaxed prose max-w-none ${message.role === "user" && "text-white"}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{stringifyMessageWithFootnotes(message)}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export function stringifyMessageWithFootnotes(message: Message): string {
    let footnoteCounter = 1;
    const footnotes: string[] = [];
    const output: string[] = [];

    for (const content of message.content) {
        let text = content.text ?? '';

        if (content.annotations?.length) {
            const markers: string[] = [];

            for (const annotation of content.annotations) {
                const index = footnoteCounter++;
                const filename = annotation.filename.split(".")[0];
                markers.push(`[${index}]`);
                footnotes.push(
                    `[${index}]: https://google.com (${filename})`
                );
            }

            text += markers.join('');
        }

        output.push(text);
    }

    if (footnotes.length) {
        output.push('\n\n' + footnotes.join('\n\n'));
    }

    return output.join('');
}
