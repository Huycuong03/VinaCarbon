"use client";

import { useEffect, useRef, FormEvent } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { User, NavItem } from "@/types/common";
import { APP_NAME, Page } from "@/constants";
import { Search, ArrowRight } from "lucide-react";

export function NavBar({ page, user }: { page: string, user: User | undefined}) {
    const router = useRouter();
    const navItems: NavItem[] = [
        { id: Page.HOME, label: 'Home' },
        { id: Page.MAP, label: 'Map' },
        { id: Page.COMMUNITY, label: 'Community' },
        { id: Page.SEARCH, label: 'Documents' },
    ];

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push(Page.HOME)}
                >
                    <div className="w-10 h-10 bg-[#1C3D2A] rounded-lg flex items-center justify-center text-white">
                        <span className="font-serif font-bold text-xl">V</span>
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#1C3D2A] tracking-tight hidden sm:block">{APP_NAME}</span>
                </div>

                <div className="hidden md:flex gap-8">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.id)}
                            className={`text-sm font-sans p-2 rounded-xl transition-colors cursor-pointer hover:text-earth ${page === item.id ? 'text-[#1C3D2A] font-bold bg-gray-300/35' : 'text-gray-600 font-medium'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {
                        user ?
                            (<button className="hidden md:block bg-[#1C3D2A] text-white px-5 py-2 rounded-xl font-medium cursor-pointer hover:bg-[#1C3D2A]/90 transition-colors text-sm" onClick={() => signOut()}>
                                {user.name}
                            </button>) :
                            (<button className="hidden md:block bg-[#1C3D2A] text-white px-5 py-2 rounded-full font-medium cursor-pointer hover:bg-[#1C3D2A]/90 transition-colors text-sm" onClick={() => signIn("google")}>
                                Sign In
                            </button>)
                    }
                </div>
            </div>
        </nav>
    )
};

export function SearchBar({ query }: { query: string | null }) {
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
};