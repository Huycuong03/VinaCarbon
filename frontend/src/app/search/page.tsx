"use client";

import { FileText, Download } from "lucide-react";
import { Page } from "@/constants";
import SearchBar from "@/components/common/SearchBar";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import NavBar from "@/components/common/NavBar";
import { SearchResult, DocumentMetaData } from "@/types/search";

const datetimeFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  })

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
    const [searchResult, setSearchResult] = useState<DocumentMetaData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function search(q: string) {
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8001/?query=${encodeURIComponent(q)}`
                );
                const data: SearchResult = await res.json();
                const results: DocumentMetaData[] = data.results.map((hit) => {
                    const mapped: DocumentMetaData = {
                        title: hit.meta.title.split(".")[0],
                        url: hit.meta.url,
                        content_type: hit.meta.content_type.split("/")[1].toUpperCase(),
                        last_modified: datetimeFormat.format(new Date(hit.meta.last_modified)),
                        storage_size: hit.meta.storage_size / 1_000_000
                    }
                    return mapped
                })
                setSearchResult(results)
            } finally {
                setLoading(false);
            }
        }

        if (query !== null) {
            search(query)
        }
    }, [])

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
                    {searchResult !== null && searchResult.map((doc, i) => (
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
                                <span className="bg-gray-100 px-2 rounded text-xs flex items-center">{doc.content_type}</span>
                                <span className="flex items-center">{doc.last_modified}</span>
                                <span className="flex items-center">{doc.storage_size.toFixed(2)} MB</span>
                                <button className="text-gray-400 hover:text-[#333333]">
                                    <Download size={24} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div></div>);
}