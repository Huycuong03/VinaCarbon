import { ChatBox } from "@/components/assistant";

export default function AssistantPage() {
    return (
        <div className="h-[calc(100vh-80px)] flex bg-white overflow-hidden animate-fade-in">
            <ChatBox />
        </div>
    );
}