"use client";

import { useEffect, useState } from "react";

import { User } from "@/types/common";
import { Post } from "@/types/community";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const datetimeFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
});

export function PostCard({ post, user }: { post: Post, user: User | undefined}) {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(false);

    useEffect(() => {
        setLiked(() => user ? post.likes.some(liker => liker.email === user?.email) : false);
    }, []);

    return (
        <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <img src={post.author.image ? post.author.image: "https://shouldyourent.com/img/default-profile-picture.png"} alt={post.author.name ? post.author.name : "None"} className="w-10 h-10 rounded-full" />
                    <div>
                        <h4 className="font-bold text-[#333333]">{post.author.name}</h4>
                        <span className="text-xs text-gray-500">{datetimeFormat.format(new Date(post.created_at))}</span>
                    </div>
                </div>
                <p className="text-[#333333] mb-4 text-lg">{post.content}</p>
                {post.image && (
                    <img src={post.image} alt="Post content" className="w-full h-64 object-cover rounded-xl mb-4" />
                )}
                <div className="flex gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#F5F1EA] text-forest px-2 py-1 rounded-md font-medium">{tag}</span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500">
                    <button className={`flex items-center gap-2 cursor-pointer ${liked && "text-red-500"} hover:text-red-500 transition-colors`} onClick={() => {setLiked((prev) => !prev)}}>
                        <Heart size={20} /> {post.likes.length}
                    </button>
                    <button className="flex items-center gap-2 cursor-pointer" onClick={() => setExpanded((prev) => !prev)}>
                        <MessageSquare size={20} /> {post.comments.length} Comments
                    </button>
                    <button className="flex items-center gap-2 cursor-pointer">
                        <Share2 size={20} /> Share
                    </button>
                </div>
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                        <h5 className="font-bold text-sm text-charcoal mb-3">Comments</h5>
                        <div className="space-y-4 mb-4">
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <img src={comment.author.image ? comment.author.image : "https://shouldyourent.com/img/default-profile-picture.png"} alt={comment.author.name ? comment.author.name : "None"} className="w-8 h-8 rounded-full" />
                                        <div className="bg-gray-50 p-3 rounded-xl flex-1 text-sm">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-bold text-forest">{comment.author.name}</span>
                                                <span className="text-xs text-gray-400">{datetimeFormat.format(new Date(comment.created_at))}</span>
                                            </div>
                                            <p className="text-charcoal">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center font-bold text-forest text-xs">You</div>
                            <input type="text" placeholder="Write a comment..." className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest/30" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}