import { Plus, History } from "lucide-react";

export default function AssistantPage() {
    return (
        <div className="h-[calc(100vh-80px)] flex bg-white overflow-hidden animate-fade-in font-sans">
            <aside className={`h-full bg-sand/30 border-r border-gray-200 transition-all duration-300 flex flex-col w-64`}>
                <div className="p-4 flex flex-col h-full">
                    <button 
                        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer rounded-full text-sm font-medium text-charcoal hover:scale-[1.05] transition-all shadow-sm mb-6"
                    >
                        <Plus size={18} />
                        Hội thoại mới
                    </button>
                    
                    <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Lịch sử</p>
                        <button className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 hover:bg-charcoal/5 rounded-lg text-sm text-left text-charcoal font-medium hover:scale-[1.05] transition-all group">
                            <History size={16} className="text-gray-400 group-hover:text-forest" />
                            <span className="truncate">Sàn giao dịch tín chỉ Carbon</span>
                        </button>
                        <button className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 hover:bg-charcoal/5 rounded-lg text-sm text-left text-charcoal font-medium hover:scale-[1.05] transition-all group">
                            <History size={16} className="text-gray-400 group-hover:text-forest" />
                            <span className="truncate">Tiêu chí VCS</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative h-full">
                <div className="flex-1 overflow-y-auto px-6 py-12">
                  <iframe src={`https://webchat.botframework.com/embed/agent-bot81358?s=${process.env.AZURE_BOT_SECRET}`} style={{height: "100%", width: "100%"}}></iframe>
                </div>
            </main>
        </div>
    );
}