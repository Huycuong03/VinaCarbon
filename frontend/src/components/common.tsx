"use client";

import { useEffect, useRef, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import { Page, User } from "@/types/common";
import { APP_NAME, NAV_ITEMS, DEFAULT_USER } from "@/constants";
import { Search, ArrowRight } from "lucide-react";

export function UserAvatar({ user }: { user: User }) {
    const router = useRouter();
    return (
        <button
            onClick={() => {
                if (user?.name && user.name !== DEFAULT_USER.name) {
                    const username = user.email?.split("@")[0];
                    router.push(`${Page.PROFILE}/${username}`);
                }
            }}
            className="hidden md:flex items-center justify-center cursor-pointer"
        >
            <img
                src={user.image || DEFAULT_USER.image}
                alt={user.name || DEFAULT_USER.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:scale-105 transition-transform"
            />
        </button>
    );
}

export function NavBar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const segment = pathname.split("/").filter(Boolean)[0];
    const page = segment ? `/${segment}` : "/";
    const router = useRouter();

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        router.push(Page.HOME);
                    }}
                >
                    <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center text-white">
                        <span className="font-serif font-bold text-xl">{APP_NAME[0]}</span>
                    </div>
                    <span className="font-serif text-2xl font-bold text-forest tracking-tight hidden sm:block">{APP_NAME}</span>
                </div>

                <div className="hidden md:flex gap-8">
                    {NAV_ITEMS.map(item => {
                        const isRestricted = item.restricted === true;
                        const isUnauthed = !session?.user;
                        const isDisabled = isRestricted && isUnauthed;

                        return (
                            <div key={item.id} className="relative group">
                                <button
                                    disabled={isDisabled}
                                    aria-disabled={isDisabled}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            router.push(item.id);
                                        }
                                    }}
                                    className={`
                                        text-sm font-sans p-2 rounded-lg transition-all
                                        ${page === item.id
                                                            ? "text-forest font-bold"
                                                            : "text-gray-600 font-normal"}
                                        ${isDisabled
                                                            ? "cursor-not-allowed opacity-40"
                                                            : "cursor-pointer hover:bg-charcoal/3 hover:scale-[1.05] hover:text-forest"}
                                    `}
                                >
                                    {item.label}
                                </button>

                                {isDisabled && (
                                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-charcoal text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        Đăng nhập để sử dụng tính năng này.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>


                <div className="flex items-center gap-4">
                    {
                        session?.user ?
                            (<UserAvatar user={session.user} />) :
                            (<button className="hidden md:block bg-forest text-white px-5 py-2 rounded-full font-medium cursor-pointer hover:bg-forest/90 transition-colors text-sm" onClick={() => signIn("google")}>
                                Đăng nhập
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

    function handleSearch(e: FormEvent) {
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
    }, []);

    return (
        <div className="max-w-lg mx-auto mb-10 w-full relative group">
            <form
                onSubmit={handleSearch}
                className="relative flex items-center"
            >
                <div className="absolute left-4 text-forest group-focus-within:text-forest transition-colors z-10">
                    <Search size={20} />
                </div>
                <input
                    ref={searchBar}
                    type="text"
                    placeholder="Tìm kiếm tài liệu, hướng dẫn..."
                    className="w-full pl-12 pr-14 py-4 rounded-full bg-white/40 backdrop-blur text-charcoal font-sans text-lg font-extralight placeholder-white/40 shadow-5xl focus:bg-white/85 focus:scale-[1.01] focus:outline-none focus:placeholder-gray-500 transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 bg-forest text-white cursor-pointer rounded-full transition-all shadow-md transform hover:scale-105 z-10"
                >
                    <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
};