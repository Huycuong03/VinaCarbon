"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import { PostCard } from "@/components/community";

import { Post } from "@/types/community";
import { DEFAULT_USER, numberFormatter } from "@/constants";
import { UserAvatar } from "@/components/common";

export default function CommunityPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const postInput = useRef<HTMLInputElement>(null);
    const isDisabled = !session?.user;

    const loadPosts = useCallback(async () => {
        if (loading || (continuationToken === null && posts.length > 0)) return;

        try {
            setLoading(true);
            const url = continuationToken
                ? `http://localhost/community/posts?continuation=${encodeURIComponent(continuationToken)}`
                : 'http://localhost/community/posts';
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

    async function handlePost() {
        if (!session?.user) return;

        const newPostContent = postInput.current?.value.trim();
        if (!newPostContent) return;

        if (postInput.current) {
            postInput.current.value = "";
        }

        const newPost: Post = {
            id: `post-${Date.now().toString()}`,
            author: session.user,
            created_at: new Date().toISOString(),
            content: newPostContent,
            likes: [],
            comments: [],
            tags: []
        }

        try {
            const response = await fetch(
                `http://localhost/community/posts`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newPost),
                }
            );

            if (response.ok) {
                setPosts((prev) => [newPost, ...prev]);
            } else {
                const error = await response.json();
                throw new Error(error.detail);
            }

        } catch (error) {
            alert(error);
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="animate-fade-in">
                <div className="bg-[url('https://picsum.photos/1920/1080?random=hero')] bg-cover bg-center bg-no-repeat bg-fixed bg-forest/50 bg-blend-darken text-white py-16 px-6 text-center">
                    <h2 className="font-serif text-4xl font-bold mb-4 text-shadow-lg">Cộng Đồng Carbon</h2>
                    <p className="text-xl font-light opacity-90">Kết nối, Chia sẻ, và Cùng Phát triển.</p>
                </div>

                <div className="max-w-3xl mx-auto -mt-8 px-6 pb-20">
                    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 hover:scale-[1.05] transition-all">
                        <div className="flex gap-4">
                            <UserAvatar user={session?.user || DEFAULT_USER} />
                            <input
                                ref={postInput}
                                type="text"
                                disabled={isDisabled}
                                placeholder={"Hãy chia sẻ trải nghiệm của bạn ..."}
                                className={`
                                    w-full bg-gray-50 rounded-lg px-3 py-2 text-sm
                                    focus:outline-none transition-opacity
                                    ${isDisabled ? "cursor-not-allowed opacity-50" : "focus:ring-2 focus:ring-forest"}
                                `}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isDisabled) {
                                        handlePost();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {posts.map((post, i) => <PostCard key={i} post={post} user={session?.user} />)}
                    </div>
                    <div ref={observerTarget} className="py-8 flex justify-center w-full">
                        {loading && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-gray/20 border-t-charcoal rounded-full animate-spin"></div>
                                <span className="text-sm text-gray-500">Đang tải ...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}