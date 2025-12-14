"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from 'next/navigation';

import { NavBar, SearchBar } from "@/components/common";
import { SearchResultRow } from "@/components/search";

import { SearchResult, DocumentMetaData } from "@/types/search";
import { Page } from "@/constants";

const datetimeFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
});

export default function SearchPage() {
    const { data: session, status } = useSession();
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
    }, []);

    return (
        <div className="animate-fade-in min-h-screen flex flex-col font-sans text-[#333333]">
            <img src="https://picsum.photos/1920/1080?random=hero" alt="Vietnam Landscape" className="absolute inset-0 -z-10 w-full h-full object-cover" />
            <div className="absolute inset-0 -z-10 w-full h-full object-cover bg-[#1C3D2A]/60"></div>
            <NavBar page={`${Page.SEARCH}`} user={session?.user} />
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
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => <SearchResultRow key={i} document={null}/>)
                    ) : (
                        searchResult.map((doc, i) => <SearchResultRow key={i} document={doc} />)
                    )}
                </div>
            </div>
        </div>
    );
}