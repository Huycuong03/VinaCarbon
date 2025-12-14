"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

import { NavBar } from "@/components/common";
import { Map } from "@/components/map";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page } from "@/constants";


export default function MapPage() {
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    return (
        <div className="min-h-screen flex flex-col">
            <NavBar page={Page.MAP} user={session?.user} />
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white relative">
                <div className="flex-1 relative bg-gray-200 z-0 order-1">
                    <Map />
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="absolute top-4 right-4 z-[400] bg-white rounded-full text-forest p-2 shadow-xl cursor-pointer transition-all transform hover:scale-120"
                            title="Open Tools"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                <div
                    className={`absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md border border-earth/20 rounded-2xl flex flex-col overflow-hidden z-[1000] shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
                >
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="font-serif text-3xl text-forest font-bold mb-2">Land Analysis</h2>
                                <p className="text-charcoal/70 text-sm">Use satellite imagery to estimate biomass and carbon credit potential.</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-forest transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}