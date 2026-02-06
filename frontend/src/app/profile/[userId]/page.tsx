"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

import { SignOutButton } from "@/components/common";
import { PostCard } from "@/components/community";
import { UserX, X, MapPin, Save } from "lucide-react";

import { Profile, Update } from "@/types/common";
import { Post } from "@/types/community";
import { BACKEND_API_ENDPOINT, DEFAULT_USER_IMAGE_URL } from "@/constants";
import { getRandomString } from "@/lib/utils";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [continuationToken, setContinuationToken] = useState<string>(`${Date.now()}#${getRandomString()}`);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [followed, setFollowed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    async function loadProfile() {
        try {
            const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${userId}`);
            const { data, detail }: { data: Profile, detail?: string } = await response.json();

            if (response.ok) {
                setProfile(data);
            } else if (response.status === 404) {
                setNotFound(true);
            } else if (detail) {
                alert(detail);
            } else {
                throw new Error();
            }

        } catch (error) {
            alert("Something went wrong.");
        }
    }

    useEffect(() => {
        if (profile && posts.length === 0) {
            loadPosts();
        }
    }, [profile]);

    const loadPosts = useCallback(async () => {
        if (isLoadingPosts) return;
        if (!continuationToken) return;

        try {
            setIsLoadingPosts(true);
            const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${userId}/posts`, {
                headers: {
                    "X-Continuation-Token": continuationToken
                }
            });
            const { data, detail }: { data: Post[], detail?: string } = await response.json();

            if (response.ok) {
                if (data) {
                    setPosts(prev => [...prev, ...data]);
                } else {
                    setContinuationToken("");
                }
            } else if (detail) {
                alert(detail);
            } else {
                throw new Error();
            }

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setIsLoadingPosts(false);
        }
    }, [isLoadingPosts, continuationToken, userId]);

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

    if (notFound) {
        return (
            <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100/40 border border-gray-200 flex items-center justify-center text-earth mb-6">
                    <UserX size={48} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-forest mb-4">Người dùng không tồn tại</h2>
                <p className="text-charcoal/70 max-w-md mb-8">
                    Tài khoản của người dùng đã thay đổi hoặc không còn tồn tại nữa.
                </p>
            </div>
        );
    }

    async function handleFollow() {
        try {
            setFollowed(prev => !prev);
            const response = await fetch(
                `/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${userId}/${followed ? "unfollow" : "follow"}`,
                {
                    method: "PATCH"
                }
            );

            if (!response.ok) {
                setFollowed(prev => !prev);
                const { detail }: { detail?: string } = await response.json();
                if (detail) {
                    alert(detail);
                } else {
                    throw new Error();
                }
            }

        } catch (error) {
            alert("Something went wrong.");
        }
    }

    return (
        <div className="animate-fade-in bg-white min-h-screen py-5">
            {isEditing && <ProfileEditForm profile={profile} setProfile={setProfile} setIsEditing={setIsEditing} />}
            <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
                <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center md:items-start mb-12">
                    {profile ? (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border-2 border-bamboo">
                            <img src={profile ? profile.image : DEFAULT_USER_IMAGE_URL} alt={profile ? profile.name : "default"} className="w-full h-full rounded-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 animate-pulse"></div>
                    )}


                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-row items-center gap-4 mb-6">
                            {profile ? (
                                <h2 className="text-2xl font-light text-charcoal capitalize">{profile.name}</h2>
                            ) : (
                                <div className="h-10 w-50 bg-gray-300 rounded animate-pulse"></div>
                            )}
                            <div className="flex-1 flex justify-end gap-2">
                                {!profile ? (
                                    <>
                                        <div className="h-10 w-30 bg-gray-300 rounded-lg text-sm animate-pulse"></div>
                                        <div className="h-10 w-30 bg-gray-300 rounded-lg text-sm animate-pulse"></div>
                                    </>
                                ) : (
                                    status === "authenticated" && (
                                        session.user.id === decodeURIComponent(userId) ? (
                                            <>
                                                <button
                                                    className="cursor-pointer px-5 py-1.5 bg-forest text-white rounded-lg text-sm font-bold hover:bg-forest/90 hover:scale-[1.05] transition-all shadow-sm"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <SignOutButton />
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleFollow}
                                                className="cursor-pointer px-5 py-1.5 bg-forest text-white rounded-lg text-sm font-bold hover:bg-forest/90 hover:scale-[1.05] transition-all shadow-sm"
                                            >
                                                {followed ? "Hủy Theo dõi" : "Theo dõi"}
                                            </button>
                                        )
                                    )
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start gap-8 mb-6">
                            {profile ? (
                                <span><strong className="text-charcoal">{profile.followers.length}</strong> Người theo dõi</span>
                            ) : (
                                <div className="h-5 w-21 bg-gray-300 rounded animate-pulse"></div>
                            )}
                            {profile ? (
                                <span><strong className="text-charcoal">{profile.followings.length}</strong> Người theo dõi</span>
                            ) : (
                                <div className="h-5 w-21 bg-gray-300 rounded animate-pulse"></div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {profile ? (
                                <p className="text-charcoal whitespace-pre-wrap">{profile.bio || "Người dùng chưa cung cấp mô tả để hiển thị"}</p>
                            ) : (
                                <div className="h-5 w-50 bg-gray-300 rounded animate-pulse"></div>
                            )}
                            <div className="flex items-center gap-2 text-charcoal/60 text-sm">
                                {profile ? (
                                    <>
                                        <MapPin size={16} className="text-forest" />
                                        <span>{profile.address || "Người dùng chưa cung cấp địa chỉ để hiển thị"}</span>
                                    </>
                                ) : (
                                    <div className="h-20 flex-1 bg-gray-300 rounded animate-pulse"></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mb-10"></div>

                <div className="space-y-6">
                    {posts.map((post) => <PostCard key={post.id} post={post} user={session?.user} />)}
                </div>
                <div ref={observerTarget} className="py-8 min-h-[40px] flex justify-center w-full">
                    {!profile && (
                        <div className="h-40 w-full bg-gray-300 rounded animate-pulse"></div>
                    )}
                    {(profile && isLoadingPosts) && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-gray/20 border-t-charcoal rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">Đang tải ...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


function ProfileEditForm({ profile, setProfile, setIsEditing }: { profile: Profile | null, setProfile: React.Dispatch<React.SetStateAction<Profile | null>>, setIsEditing: React.Dispatch<React.SetStateAction<boolean>> }) {
    if (!profile) {
        return null;
    }

    const [formData, setFormData] = useState({ name: profile.name, bio: profile.bio, address: profile.address});

    async function handleSaveProfile(e: React.FormEvent) {
        if (!profile) return;
        e.preventDefault();

        const updates: Update[] = [
            {
                op: "replace",
                path: "/name",
                value: formData.name
            },
            {
                op: "replace",
                path: "/bio",
                value: formData.bio
            },
            {
                op: "replace",
                path: "/address",
                value: formData.address
            },
        ];

        try {
            const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${profile.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updates),
                }
            );

            if (response.ok) {
                const newProfile: Profile = { ...profile, ...formData }
                setProfile(newProfile);
            } else {
                const { detail }: { detail?: string } = await response.json();
                if (detail) {
                    alert(detail);
                } else {
                    throw new Error();
                }
            }

        } catch (error) {
            alert("Something went wrong.");
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-forest/40 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsEditing(false)}
            />

            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in transform scale-100 transition-transform">
                <div className="h-2 bg-gradient-to-r from-bamboo via-forest to-earth" />

                <button
                    onClick={() => setIsEditing(false)}
                    className="cursor-pointer absolute top-4 right-4 p-2 text-gray-400 hover:text-forest transition-colors rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSaveProfile} className="p-8">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-charcoal uppercase tracking-widest mb-1.5 ml-1">Tên hiển thị</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-sand/30 border border-gray-200 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-charcoal uppercase tracking-widest mb-1.5 ml-1">Mô tả</label>
                            <textarea
                                value={formData.bio || ""}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full bg-sand/30 border border-gray-200 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-charcoal uppercase tracking-widest mb-1.5 ml-1">Địa chỉ</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-sand/30 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all"
                                    placeholder="Your location"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            className="flex-1 bg-forest text-white py-2 cursor-pointer rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-forest/90 transition-all shadow-lg hover:shadow-forest/20"
                        >
                            <Save size={18} /> Lưu
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-white border border-gray-200 text-charcoal py-2 cursor-pointer rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}