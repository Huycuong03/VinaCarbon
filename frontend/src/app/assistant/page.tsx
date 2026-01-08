import { ChatBox } from "@/components/assistant";

export default function AssistantPage() {
    return (
        <div className="h-[calc(100vh-80px)] flex bg-white overflow-hidden animate-fade-in">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="relative z-10 h-full flex flex-col">
                    <ChatBox />
                </div>
            </div>
        </div>
    );
}