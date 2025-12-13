"use client";

import { useRouter } from "next/navigation";
import { NavItem } from "@/types/common";
import { APP_NAME, Page } from "@/constants";
import { signIn, signOut, useSession } from "next-auth/react";

export default function NavBar({ page }: { page: string }) {
    const { data: session, status } = useSession();
    console.log(session)
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
                        session?.user ?
                            (<button className="hidden md:block bg-[#1C3D2A] text-white px-5 py-2 rounded-xl font-medium cursor-pointer hover:bg-[#1C3D2A]/90 transition-colors text-sm" onClick={() => signOut()}>
                                {session.user.name}
                            </button>) :
                            (<button className="hidden md:block bg-[#1C3D2A] text-white px-5 py-2 rounded-full font-medium cursor-pointer hover:bg-[#1C3D2A]/90 transition-colors text-sm" onClick={() => signIn("google")}>
                                Sign In
                            </button>)
                    }
                </div>
            </div>
        </nav>
    )
}