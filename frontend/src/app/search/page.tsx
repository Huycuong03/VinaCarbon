import { SearchBar } from "@/components/common";
import { SearchResultRow } from "@/components/search";

import { DocumentMetaData } from "@/types/search";
import { formatDate, formatFileSize } from "@/lib/formatters";
import { BACKEND_URL, BACKEND_API_ENDPOINT } from "@/constants";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
    const { query } = await searchParams;
    let documents: DocumentMetaData[] = Array.from({ length: 3 });

    if (query !== undefined) {
        const response = await fetch(`${BACKEND_URL}${BACKEND_API_ENDPOINT.SEARCH}?q=${encodeURIComponent(query)}`);
        const data: DocumentMetaData[] = await response.json();
        documents = data.map((doc) => {
            const mapped: DocumentMetaData = {
                id: doc.id,
                title: doc.title.split(".")[0],
                url: doc.url,
                content_type: doc.content_type.split("/")[1].toUpperCase(),
                last_modified: formatDate(doc.last_modified),
                storage_size: formatFileSize(doc.storage_size)
            }
            return mapped;
        })
    }

    return (
        <div className="flex flex-1 flex-col overflow-auto font-sans text-charcoal bg-[url('https://picsum.photos/1920/1080?random=search')] bg-cover bg-center bg-no-repeat bg-fixed bg-forest/50 bg-blend-darken">
            <div className="animate-fade-in">
                <section className="relative h-[40vh] flex items-center justify-center text-center">
                    <div className="w-full">
                        <h1 className="py-6 text-5xl md:text-7xl font-serif text-white font-bold mb-6 leading-tight drop-shadow-lg text-shadow-md">
                            Học, Học nữa, Học mãi.
                        </h1>
                        <SearchBar query={query ? query : null} />
                    </div>
                </section>

                <div className="w-2/3 px-6 max-w-full mx-auto pb-10">
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