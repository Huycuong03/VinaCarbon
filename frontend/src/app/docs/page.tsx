"use client";

import { FileText, Download } from "lucide-react";
import { MOCK_DOCUMENTS } from "@/constants";
import SearchBar from "@/components/common/SearchBar";
import { useSearchParams } from 'next/navigation';
import NavBar from "@/components/common/NavBar";
import { Page } from "@/types";

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q')

    return (
        <div className="animate-fade-in min-h-screen flex flex-col font-sans text-[#333333]">
            <img src="https://picsum.photos/1920/1080?random=hero" alt="Vietnam Landscape" className="absolute inset-0 -z-10 w-full h-full object-cover" />
            <div className="absolute inset-0 -z-10 w-full h-full object-cover bg-[#1C3D2A]/60"></div>
            <NavBar page={`${Page.SEARCH}`} />
            <section className="relative h-[40vh] flex items-center justify-center text-center overflow-hidden">
                <div className="relative z-10 w-full">
                    <h1 className="py-6 text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg">
                        Learning is a Lifelong Matter.
                    </h1>
                    <SearchBar query={query} />
                </div>
            </section>
            <div className="w-2/3 py-0 px-6 max-w-full mx-auto">
                <div className="space-y-4">
                    {MOCK_DOCUMENTS.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/70 backdrop-blur p-6 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="bg-sand p-3 rounded-lg text-forest group-hover:bg-forest transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#333333]">{doc.title}</h3>

                                </div>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-700 mt-1">
                                <span className="bg-gray-100 px-2 rounded text-xs flex items-center">{doc.type}</span>
                                <span>{doc.size}</span>
                                <span>{doc.date}</span>
                                <button className="text-gray-400 hover:text-[#333333]">
                                    <Download size={24} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div></div>);
}