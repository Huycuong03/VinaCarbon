"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

import { MessageBubble } from "@/components/assistant";

import { Message } from "@/types/assistant";
import { ASSISTANT, BACKEND_API_ENDPOINT } from "@/constants";

import { Loader2, SendHorizontal, MessageCirclePlus } from "lucide-react";

export default function AssistantPage() {
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            signIn("google");
        },
    })
    const [messages, setMessages] = useState<Message[]>([]);
    const [assistantResponseText, setAssistantResponseText] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    async function loadMessages() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/backend${BACKEND_API_ENDPOINT.ASSISTANT}`);
            const { data, detail }: { data: Message[], detail?: string } = await response.json();
            if (response.ok) {
                setMessages([...data].reverse());
            } else {
                alert(detail);
            }
        }
        catch (error) {
            alert("Something went wrong.");
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        if (status === "authenticated") {
            loadMessages();
        }
    }, [status]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isSending]);

    async function handleSendMessage() {
        if (!inputValue.trim() || isSending) return;

        try {
            const now = Date.now();
            const userMessage: Message = {
                id: `user-${now}`,
                role: 'user',
                content: [{
                    type: "input_text",
                    text: inputValue,
                }]
            };

            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsSending(true);

            const response = await fetch(`/api/backend${BACKEND_API_ENDPOINT.ASSISTANT}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userMessage)
                }
            );

            setIsSending(false);

            if (!response.ok) {
                const { detail } = await response.json();
                alert(detail);
                return;
            }

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (value) {
                    const chunk = decoder.decode(value);
                    fullText += chunk;
                    setAssistantResponseText(fullText);
                }
                if (done) {
                    break;
                }
            }

            setMessages(prev => [...prev, {
                id: `assistant-${now}`,
                role: 'assistant',
                content: [{
                    type: "output_text",
                    text: fullText,
                }]
            }]);

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setAssistantResponseText("");
        }
    }

    async function handleRenewConversation() {
        try {
            if (messages.length === 0) return;

            setIsLoading(true);
            const response = await fetch(`/api/backend${BACKEND_API_ENDPOINT.ASSISTANT}`, { method: "DELETE" });

            if (response.ok) {
                setMessages([]);
            } else {
                const { detail } = await response.json();
                alert(detail);
            }

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-[calc(100vh-80px)] flex bg-white overflow-hidden animate-fade-in">
            <div className="flex flex-1 flex-col overflow-hidden ">
                <div className="px-6 py-4 flex justify-end items-center">
                    <button
                        onClick={handleRenewConversation}
                        className="cursor-pointer text-xs text-gray-400 px-3 py-1.5 rounded-md"
                    >
                        <MessageCirclePlus />
                    </button>
                </div>
                {isLoading && (
                    <div className="flex flex-1 flex-col items-center justify-center h-full animate-fade-in">
                        <Loader2 size={48} className="text-charcoal animate-spin mb-4" />
                        <p className="text-charcoal font-medium font-serif text-xl">Đang tải ...</p>
                    </div>
                )}
                {!isLoading && (<div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center w-[calc(100wh-80px)] mx-auto w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-16 h-16 pb-10 flex items-center">
                                    <img src="/logo.png" />
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
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
                            {assistantResponseText && (
                                <div className={`flex justify-start`}>
                                    <div className={`rounded-2xl px-5 py-1.5 w-full`}>
                                        <div className={`text-[15px] leading-relaxed prose max-w-none`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{assistantResponseText}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {isSending && (
                        <div className="flex justify-start max-w-4xl mx-auto">
                            <div className="px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>)}

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
                            placeholder="Nhập câu hỏi của bản ..."
                            rows={1}
                            className="w-full border border-gray-400 rounded-full py-4 pl-4 pr-12 focus:outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isSending}
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
        </div>
    );
}