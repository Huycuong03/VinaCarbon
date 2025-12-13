"use client";

import { useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Page } from "@/constants";
import { useEffect } from "react";

export default function SearchBar({ query }: { query: string | null }) {
    const router = useRouter();
    const searchBar = useRef<HTMLInputElement>(null);
    
    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        const query = searchBar.current?.value.trim();
        if (!query) return;

        const href = `${Page.SEARCH}?query=${encodeURIComponent(query)}`
        router.push(href);
    };

    useEffect(() => {
        if (query !== null && searchBar.current !== null) {
            searchBar.current.value = query
        }
    }, [])

    return (
        <div className="max-w-lg mx-auto mb-10 w-full relative group">
            <form
                onSubmit={handleSearch}
                className="relative flex items-center"
            >
                <div className="absolute left-4 text-[#1C3D2A] group-focus-within:text-[#1C3D2A] transition-colors z-10">
                    <Search size={20} />
                </div>
                <input
                    ref={searchBar}
                    type="text"
                    placeholder="Search documents, policies, or guides..."
                    className="w-full pl-12 pr-14 py-4 rounded-full bg-white/40 backdrop-blur text-[#333333] font-sans text-lg font-light placeholder-white/40 shadow-5xl focus:bg-white/85 focus:scale-[1.01] focus:outline-none focus:placeholder-gray-500 transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 bg-[#1C3D2A] text-white cursor-pointer rounded-full transition-all shadow-md transform hover:scale-105 z-10"
                >
                    <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
}