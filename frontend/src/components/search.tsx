"use client";

import { useRouter } from "next/navigation";
import { DocumentMetaData } from "@/types/search";
import { FileText, Download } from "lucide-react";

export function SearchResultRow({ document }: { document: DocumentMetaData | null }) {
    const router = useRouter();

    if (!document) {
        return (
            <div className="flex items-center justify-between bg-white/40 p-6 rounded-xl">
                <div className="flex items-center gap-4 w-full">
                    <div className="bg-gray-200 w-12 h-12 rounded-lg shrink-0 animate-pulse"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        <div className="flex gap-4">
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => router.push(document.url)}
            className="flex items-center justify-between cursor-pointer bg-white/70 backdrop-blur p-6 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="bg-sand p-3 rounded-lg text-charcoal">
                    <FileText size={24} />
                </div>

                <div className="min-w-0">
                    <h3 className="text-lg text-charcoal truncate max-w-[50rem]">
                        {document.title}
                    </h3>
                </div>
            </div>


            <div className="flex gap-4 text-sm text-gray-700 mt-1 items-center">
                <span className="bg-gray-100 px-2 rounded text-xs">
                    {document.content_type}
                </span>
                <span className="font-light">{document.last_modified}</span>
                <span className="font-light">{document.storage_size.toFixed(2)} MB</span>
                <button className="cursor-pointer text-gray-400 hover:text-charcoal">
                    <Download size={24} />
                </button>
            </div>
        </div>
    );
}
