"use client";

import { useEffect, useRef, useState } from "react";

import { User } from "@/types/common";
import { Post, Comment } from "@/types/community";
import { Heart, MessageSquare, Share2 } from "lucide-react";

import { dateFormatter, numberFormatter, DEFAULT_USER } from "@/constants";
import { UserAvatar } from "./common";

export function PostCard({ post, user }: { post: Post, user: User | undefined }) {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <UserAvatar user={post.author} />
                    <div>
                        <h4 className="font-bold text-charcoal capitalize">{post.author.name}</h4>
                        <span className="text-xs text-gray-500">{dateFormatter.format(new Date(post.created_at))}</span>
                    </div>
                </div>
                <p className="text-charcoal mb-4 text-lg">{post.content}</p>
                {post.image && (
                    <img src={post.image} alt="Post content" className="w-full h-64 object-cover rounded-xl mb-4" />
                )}
                <div className="flex gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-[#F5F1EA] text-forest px-2 py-1 rounded-md font-medium">{tag}</span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500">
                    <LikeButton post={post} user={user} />
                    <button className="flex items-center gap-2 cursor-pointer" onClick={() => setExpanded((prev) => !prev)}>
                        <MessageSquare size={20} /> {post.comments.length} Comments
                    </button>
                    <button className="flex items-center gap-2 cursor-pointer">
                        <Share2 size={20} /> Share
                    </button>
                </div>
                {expanded && <CommentSection post={post} user={user} />}
            </div>
        </div>
    );
}

function LikeButton({ post, user }: { post: Post, user: User | undefined }) {
    const [like, setLike] = useState<{ liked: boolean, likes: number }>({ liked: false, likes: post.likes.length });

    useEffect(() => {
        if (!user) return;

        const liked = post.likes.some(liker => liker.email === user?.email);
        setLike((prev) => ({ liked: liked, likes: prev.likes }));
    }, []);

    async function handleLike() {
        if (!user) return;

        const newLiked = !like.liked;
        const newLikes = newLiked ? (like.likes + 1) : (like.likes - 1);

        const update = newLiked ? ([
            {
                "op": "add",
                "path": "/likes/-",
                "value": user
            }
        ]) : ([
            {
                "op": "replace",
                "path": "/likes",
                "value": post.likes.filter(liker => liker.email !== user.email)
            }
        ]);

        try {
            const response = await fetch(
                `http://localhost:8002/posts/${post.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(update),
                }
            );

            if (response.status !== 204) {
                throw new Error(`Unexpected status: ${response.status}`);
            }

            setLike({ liked: newLiked, likes: newLikes });
        } catch (error) {
            console.error("Failed to update like", error);
        }
    }


    return (
        <button className={`flex items-center gap-2 cursor-pointer ${like.liked && "text-red-500"} hover:text-red-500 transition-colors`} onClick={handleLike}>
            <Heart size={20} /> {like.likes}
        </button>
    );
}

function CommentSection({ post, user }: { post: Post, user: User | undefined }) {
    const [comments, setComments] = useState<Comment[]>(post.comments);
    const commentInput = useRef<HTMLInputElement>(null);

    async function handleComment() {
        if (!user) return;

        const newCommentContent = commentInput.current?.value.trim();
        if (!newCommentContent) return;

        if (commentInput.current) {
            commentInput.current.value = "";
        }

        const newComment: Comment = {
            id: `c-${numberFormatter(comments.length + 1)}`,
            author: user,
            created_at: new Date().toISOString(),
            content: newCommentContent
        }

        const update = [
            {
                "op": "add",
                "path": "/comments/-",
                "value": newComment
            }
        ]

        try {
            const response = await fetch(
                `http://localhost:8002/posts/${post.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(update),
                }
            );

            if (response.status !== 204) {
                throw new Error(`Unexpected status: ${response.status}`);
            }

            setComments((prev) => [...prev, newComment]);
        } catch (error) {
            console.error("Failed to update like", error);
        }
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <h5 className="font-bold text-sm text-charcoal mb-3">Comments</h5>
            <div className="space-y-4 mb-4">
                {comments && comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                            <UserAvatar user={comment.author} />
                            <div className="bg-gray-50 p-3 rounded-xl flex-1 text-sm">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-forest capitalize">{comment.author.name}</span>
                                    <span className="text-xs text-gray-400">{dateFormatter.format(new Date(comment.created_at))}</span>
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
                <UserAvatar user={user || DEFAULT_USER} />
                <input
                    ref={commentInput}
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleComment();
                        }
                    }}
                />
            </div>
        </div>
    );
}