"use client";

import { useEffect, useRef, useState } from "react";

import { Heart, MessageSquare, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { UserAvatar } from "./common";


import { User } from "@/types/common";
import { Post, Comment } from "@/types/community";
import { formatDate } from "@/lib/formatters";
import { BACKEND_API_ENDPOINT } from "@/constants";


export function PostCard({ post, user }: { post: Post, user?: User }) {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <UserAvatar user={post.author} />
                    <div>
                        <h4 className="font-bold text-charcoal capitalize">{post.author.name}</h4>
                        <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                </div>
                <p className="text-charcoal mb-4 text-lg">{post.content}</p>
                {post.images.length > 0 && <ImageCarousel images={post.images} />}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500">
                    <LikeButton post={post} user={user} />
                    <button className='cursor-pointer flex items-center gap-2 transition-colors py-1 px-2 rounded-lg hover:text-forest hover:bg-forest/5' onClick={() => setExpanded((prev) => !prev)}>
                        <MessageSquare size={20} />  <span className="text-sm font-semibold">{post.comments.length} Bình luận</span>
                    </button>
                    <button className="cursor-pointer flex items-center gap-2 hover:text-blue-500 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50">
                        <Share2 size={20} />  <span className="text-sm font-semibold">Chia sẻ</span>
                    </button>
                </div>
                {expanded && <CommentSection post={post} user={user} />}
            </div>
        </div>
    );
}

function ImageCarousel({ images }: { images: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative group w-full aspect-square sm:aspect-video rounded-2xl overflow-hidden border border-gray-100 mb-4 bg-black/5">
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Post content ${idx + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                    />
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-forest shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-forest shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

function LikeButton({ post, user }: { post: Post, user?: User }) {
    const [like, setLike] = useState<{ liked: boolean; likes: number }>({
        liked: false,
        likes: post.likes.length,
    });

    const isDisabled = !user;

    useEffect(() => {
        if (!user) return;

        const liked = post.likes.some(liker => liker.id === user.id);
        setLike(prev => ({ liked, likes: prev.likes }));
    }, [user, post.likes]);

    async function handleLike() {
        if (!user) return;

        const previousLike = like;

        setLike({
            liked: !previousLike.liked,
            likes: previousLike.liked ? previousLike.likes - 1 : previousLike.likes + 1
        });

        const response = await fetch(
            `/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${post.author.id}/posts/${post.id}/${like.liked ? "unlike" : "like"}`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            setLike(previousLike);
            const { detail } = await response.json();
            alert(detail);
        }


    }

    return (
        <button
            disabled={isDisabled}
            aria-disabled={isDisabled}
            onClick={handleLike}
            className={`
                cursor-pointer flex items-center gap-2 hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50
                ${like.liked ? "text-red-500 bg-red-50" : "text-gray-600"}
                ${isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:text-red-500"}
            `}
        >
            <Heart size={20} /> <span className="text-sm font-semibold">{like.likes}</span>
        </button>
    );
}


function CommentSection({ post, user }: { post: Post, user?: User }) {
    const [comments, setComments] = useState<Comment[]>(post.comments);
    const commentInput = useRef<HTMLInputElement>(null);
    const isDisabled = !user;

    async function handleComment() {
        if (!user) return;

        const newCommentContent = commentInput.current?.value.trim();
        if (!newCommentContent) return;

        if (commentInput.current) {
            commentInput.current.value = "";
        }

        const previous = comments;

        const newComment: Comment = {
            author: user,
            created_at: new Date().toISOString(),
            content: newCommentContent
        }
        setComments(prev => [...prev, newComment]);

        const response = await fetch(`/vinacarbon/api/backend${BACKEND_API_ENDPOINT.USERS}/${post.author.id}/posts/${post.id}/comments`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newComment),
            }
        );

        if (!response.ok) {
            setComments(previous);
            const { detail } = await response.json();
            alert(detail);
        }
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <h5 className="font-bold text-sm text-charcoal mb-3">Bình luận</h5>
            <div className="space-y-4 mb-4">
                {comments && comments.length > 0 ? (
                    comments.map((comment, i) => (
                        <div key={i} className="flex gap-3">
                            <UserAvatar user={comment.author} />
                            <div className="bg-gray-50 p-3 rounded-xl flex-1 text-sm">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-forest capitalize">{comment.author.name}</span>
                                    <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-charcoal">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
                )}
            </div>
            <div className="flex gap-3 items-center">
                <UserAvatar user={user} />
                <input
                    ref={commentInput}
                    type="text"
                    disabled={isDisabled}
                    placeholder={isDisabled ? "Log in to write a comment" : "Write a comment..."}
                    className={`
                        w-full bg-gray-50 rounded-lg px-3 py-2 text-sm
                        focus:outline-none transition-opacity
                        ${isDisabled ? "cursor-not-allowed opacity-50" : "focus:ring-2 focus:ring-forest"}
                    `}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !isDisabled) {
                            handleComment();
                        }
                    }}
                />
            </div>

        </div>
    );
}