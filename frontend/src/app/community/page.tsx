"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import { UserAvatar } from "@/components/common";
import { PostCard } from "@/components/community";
import { X, Plus } from "lucide-react";

import { Post } from "@/types/community";
import { getRandomString } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import { BACKEND_API_ENDPOINT } from "@/constants";

export default function CommunityPage() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [continuationToken, setContinuationToken] = useState<string>(`${Date.now()}#${getRandomString()}`);
    const [loading, setLoading] = useState(false);

    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImagesPreviews, setSelectedImagePreviews] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const loadPosts = useCallback(async () => {
        if (loading) return;
        if (!continuationToken) return;

        try {
            setLoading(true);
            const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.POSTS}`, {
                headers: {
                    "X-Continuation-Token": continuationToken
                }
            });
            const { data, detail }: { data: Post[], detail?: string } = await response.json();

            if (response.ok) {
                if (data) {
                    setPosts((prev) => [...prev, ...data]);
                } else {
                    setContinuationToken("");
                }
            } else {
                alert(detail);
            }
        } catch (error) {
            alert("Something went wrong.");
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
            { threshold: 0.5 }
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

    const handleCancelCreate = () => {
        setIsCreatingPost(false);
        setNewPostContent('');
        setSelectedImagePreviews([]);
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).reverse();
        if (files.length > 0) {
            setSelectedImages(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSelectedImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        e.target.value = "";
    };

    const removeSelectedImage = (index: number) => {
        setSelectedImagePreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmitPost() {
        if (!session?.user) return;

        const content = newPostContent.trim();
        if (!content) return;

        handleCancelCreate();

        const formData = new FormData();
        formData.append('content', newPostContent);
        selectedImages.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.POSTS}`, {
                method: 'POST',
                body: formData
            });

            const { data, detail }: { data: Post, detail?: string } = await response.json();

            if (response.ok) {
                setPosts((prev) => [data, ...prev]);
            } else {
                alert(detail);
            }
            
        } catch (error) {
            alert("Something went wrong.");
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="animate-fade-in">
                <div className="bg-[url('https://picsum.photos/1920/1080?random=community')] bg-cover bg-center bg-no-repeat bg-fixed bg-forest/50 bg-blend-darken text-white py-16 px-6 text-center">
                    <h2 className="font-serif text-4xl font-bold mb-4 text-shadow-lg">Cộng Đồng Carbon</h2>
                    <p className="text-xl font-light opacity-90">Kết nối, Chia sẻ, và Cùng Phát triển.</p>
                </div>

                <div className="max-w-4xl mx-auto -mt-8 px-6 pb-20">
                    <div className={`bg-white rounded-2xl shadow-lg mb-8 overflow-hidden transition-all duration-300 ${isCreatingPost ? 'p-0' : 'p-6'}`}>
                        {!isCreatingPost ? (
                            <div className="flex gap-4 items-center">
                                <UserAvatar user={session?.user} />
                                <input
                                    type="text"
                                    readOnly
                                    disabled={status === "unauthenticated"}
                                    onClick={() => setIsCreatingPost(true)}
                                    placeholder="Hãy chia sẻ trải nghiệm của bạn ..."
                                    className="flex-1 bg-gray-100/50 hover:bg-gray-100 rounded-lg px-5 py-3 text-charcoal/70 focus:outline-none transition-colors cursor-pointer"
                                />
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="p-5">
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3 mb-6">
                                            <UserAvatar user={session?.user} />
                                            <div>
                                                <h4 className="font-bold text-charcoal capitalize">{session?.user?.name || "Unknown"}</h4>
                                                <span className="text-xs text-gray-500">{formatDate(Date.now())}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <button onClick={handleCancelCreate} className="cursor-pointer p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        autoFocus
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Hãy chia sẻ trải nghiệm của bạn ..."
                                        className="bg-white w-full min-h-[120px] text-charcoal placeholder-gray-300 focus:outline-none resize-none border-none p-0"
                                    />

                                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedImagesPreviews.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => removeSelectedImage(idx)}
                                                        className="cursor-pointer p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleImageUploadClick}
                                            className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-forest hover:text-forest transition-all bg-gray-50/50"
                                        >
                                            <Plus size={24} />
                                            <span className="text-[10px] font-bold mt-1 uppercase">Thêm ảnh</span>
                                        </button>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />

                                    <button
                                        onClick={handleSubmitPost}
                                        disabled={!newPostContent.trim()}
                                        className={`cursor-pointer w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all ${(newPostContent.trim()) ? 'bg-forest text-white shadow-xl shadow-forest/20 hover:bg-forest/90 transform hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        Đăng bài ngay
                                    </button>
                                </div>
                            </div>
                        )}
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