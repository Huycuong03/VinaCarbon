"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { SearchBar } from "@/components/common";
import { SearchResultRow } from "@/components/search";

import { Document } from "@/types/documents";
import { BACKEND_API_ENDPOINT } from "@/constants";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q");

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            searchDocuments(query);
        }
    }, [query])

    async function searchDocuments(query: string) {
        try {
            setLoading(true);
            const response = await fetch(`/api/backend${BACKEND_API_ENDPOINT.DOCUMENTS}?q=${encodeURIComponent(query)}`);
            const { data, detail}: { data: Document[], detail?: string } = await response.json();

            if (response.ok) {
                setDocuments(data);
            } else if (detail) {
                alert(detail);
            } else {
                throw new Error();
            }

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-fade-in min-h-screen font-sans text-charcoal bg-[url('https://picsum.photos/1920/1080?random=search')] bg-cover bg-center bg-no-repeat bg-fixed bg-forest/50 bg-blend-darken">
            <div className="animate-fade-in">
                <section className="relative h-[40vh] flex items-center justify-center text-center">
                    <div className="w-full">
                        <h1 className="py-6 text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg text-shadow-md">
                            Học, Học nữa, Học mãi.
                        </h1>
                        <SearchBar query={query} />
                    </div>
                </section>

                <div className="w-2/3 px-6 max-w-full mx-auto pb-10">
                    <div className="space-y-4">
                        {loading && Array.from({ length: 3 }).map((_, i) => (<SearchResultRow key={i} />))}
                        {!loading && documents.map((doc, i) => (<SearchResultRow key={i} document={doc} />))}
                    </div>
                </div>
            </div>
        </div>

    );
}