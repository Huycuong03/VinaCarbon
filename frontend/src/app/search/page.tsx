import { SearchBar } from "@/components/common";
import { SearchResultRow } from "@/components/search";

import { SearchResult, DocumentMetaData } from "@/types/search";
import { dateFormatter } from "@/constants";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    const { query } = await searchParams;
    let documents: DocumentMetaData[] = Array.from({ length: 3 });

    if (query !== undefined) {
        const response = await fetch(`http://localhost:8001/?query=${encodeURIComponent(query)}`);
        const data: SearchResult = await response.json();
        documents = data.results.map((hit) => {
            const mapped: DocumentMetaData = {
                title: hit.meta.title.split(".")[0],
                url: hit.meta.url,
                content_type: hit.meta.content_type.split("/")[1].toUpperCase(),
                last_modified: dateFormatter.format(new Date(hit.meta.last_modified)),
                storage_size: hit.meta.storage_size / 1_000_000
            }
            return mapped;
        })
    }

    return (
        <div
            className="min-h-screen flex flex-col font-sans text-charcoal
             bg-[url('https://picsum.photos/1920/1080?random=hero')]
             bg-cover bg-center bg-no-repeat bg-fixed bg-forest/50 bg-blend-darken"
        >
                <div className="animate-fade-in">
                    <section className="relative h-[40vh] flex items-center justify-center text-center">
                        <div className="w-full">
                            <h1 className="py-6 text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg text-shadow-md">
                                Học, Học nữa, Học mãi.
                            </h1>
                            <SearchBar query={query ? query : null} />
                        </div>
                    </section>

                    <div className="w-2/3 px-6 max-w-full mx-auto">
                        <div className="space-y-4">
                            {documents.map((doc, i) => (
                                <SearchResultRow key={i} document={query ? doc : null} />
                            ))}
                        </div>
                    </div>
                </div>
        </div>

    );
}