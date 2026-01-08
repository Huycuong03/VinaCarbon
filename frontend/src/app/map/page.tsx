"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Map = dynamic(
    () => import("@/components/map"),
    { ssr: false }
);


export default function MapPage() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
    const [statistics, setStatistics] = useState<any | null>(null);
    const result = {
        biomass: Math.floor(1200 + Math.random() * 500),
        carbonStock: Math.floor(600 + Math.random() * 250),
        estimatedCredits: Math.floor(100 + Math.random() * 50),
        potentialRevenue: Math.floor(2000 + Math.random() * 1000),
        canopyHeight: Math.floor(15 + Math.random() * 10)
    }
    const chartData = [
        { name: 'Year 1', credits: result ? result.estimatedCredits : 0 },
        { name: 'Year 3', credits: result ? Math.floor(result.estimatedCredits * 1.1) : 0 },
        { name: 'Year 5', credits: result ? Math.floor(result.estimatedCredits * 1.3) : 0 },
        { name: 'Year 10', credits: result ? Math.floor(result.estimatedCredits * 1.8) : 0 },
    ];

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
                                    <div className="bg-white/45 p-3 rounded-lg">
                                        <div className="text-xs uppercase">Tổng sinh khối</div>
                                        <div className="text-lg font-bold text-charcoal">{statistics.total_biomass.value.toFixed(3)} {statistics.total_biomass.unit}</div>
                                    </div>
                                    <div className="bg-white/45 p-3 rounded-lg">
                                        <div className="text-xs uppercase">Diện tích</div>
                                        <div className="text-lg font-bold text-forest">{statistics.area.value.toFixed(3)} {statistics.area.unit}</div>
                                    </div>
                                    <div className="bg-white/45 p-3 rounded-lg">
                                        <div className="text-xs uppercase">Mật độ sinh khối</div>
                                        <div className="text-lg font-bold text-forest">{statistics.mean_biomass.value.toFixed(3)} {statistics.mean_biomass.unit}</div>
                                    </div>
                                    <div className="bg-white/45 p-3 rounded-lg">
                                        <div className="text-xs uppercase">Trữ lượng Carbon</div>
                                        <div className="text-lg font-bold text-forest">{statistics.carbon_stock.value.toFixed(3)} {statistics.carbon_stock.unit}</div>
                                    </div>
                                </div>

                                {/* <div className="h-48 w-full">
                                    <p className="text-xs text-center text-white-400 mb-2">Projected Credit Yield (10 Years)</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis hide />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="credits" fill="#A7D99B" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div> */}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}