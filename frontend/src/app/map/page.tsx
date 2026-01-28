"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { Statistic } from "@/types/biomass";
import { formatNumber } from "@/lib/formatters";

const Map = dynamic(
    () => import("@/components/map"),
    { ssr: false }
);


export default function MapPage() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const [statistics, setStatistics] = useState<Statistic[]>([]);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            <div className="animate-fade-in flex-1 flex flex-col lg:flex-row overflow-hidden bg-white relative">
                <div className="flex-1 relative bg-gray-200 z-0 order-1">
                    <Map setStatistics={setStatistics} />
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
                    className={`absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-white/40 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden z-[1000] shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
                >
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="font-serif text-3xl text-forest font-bold mb-2">Ước Tính</h2>
                                <p className="text-charcoal/70 text-sm">Sử dụng kỹ thuật vệ tinh để ước tính sinh khối và tiềm năng tín dụng carbon.</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-full bg-white/60 cursor-pointer text-forest transition-all transform hover:scale-120"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        {statistics &&
                            <div className="animate-fade-in space-y-6">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {statistics.slice(0, 4).map((stat, i) => (
                                        <div key={i} className="bg-white/45 p-3 rounded-lg">
                                            <div className="text-xs uppercase">{stat.name}</div>
                                            <div className="text-lg font-bold text-charcoal">{formatNumber(stat.value)} {stat.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}