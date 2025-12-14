"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import { NavBar } from "@/components/common";
import { PostCard } from "@/components/community";

import { Post } from "@/types/community";
import { Page } from "@/constants";

export default function CommunityPage() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const loadPosts = useCallback(async () => {
        if (loading || (continuationToken === null && posts.length > 0)) return;

        try {
            setLoading(true);
            const url = continuationToken
                ? `http://localhost:8003/posts?continuation=${encodeURIComponent(continuationToken)}`
                : 'http://localhost:8003/posts';
            const res = await fetch(url);
            const { documents: data, continuation }: { documents: Post[], continuation: string | null } = await res.json();
            setPosts((prev) => [...prev, ...data]);
            setContinuationToken(continuation);
        } finally {
            setLoading(false);
        }

    }, [loading, continuationToken]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadPosts();
                }
            },
            { threshold: 0.2 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadPosts]);

    return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
            <NavBar page={Page.COMMUNITY} user={session?.user}/>
            <div className="bg-[#1C3D2A] text-white py-16 px-6 text-center">
                <h2 className="font-serif text-4xl font-bold mb-4">Farmer Community</h2>
                <p className="text-xl opacity-90">Connect, share, and grow together.</p>
            </div>
            
            <div className="max-w-3xl mx-auto -mt-8 px-6 pb-20">
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center font-bold text-forest">You</div>
                        <input type="text" placeholder="Share your experience or ask a question..." className="flex-1 bg-gray-50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-forest/20" />
                    </div>
                </div>

                <div className="space-y-6">
                    {posts.map(post => <PostCard key={post.id} post={post} user={session?.user}/>)}
                </div>
                <div ref={observerTarget} className="py-8 flex justify-center w-full">
                    {loading && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-bamboo border-t-forest rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">Loading ...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}