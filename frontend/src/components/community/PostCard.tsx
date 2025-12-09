import { Post } from "@/types";
import { Heart, MessageSquare, Share2 } from "lucide-react";

export default function PostCard({ post }: { post: Post }) {
    return (
        <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full" />
                    <div>
                        <h4 className="font-bold text-[#333333]">{post.author}</h4>
                        <span className="text-xs text-gray-500">{post.timeAgo}</span>
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
                    <button className="flex items-center gap-2 cursor-pointer hover:text-red-500 transition-colors">
                        <Heart size={20} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 cursor-pointer">
                        <MessageSquare size={20} /> {post.comments} Comments
                    </button>
                    <button className="flex items-center gap-2 cursor-pointer">
                        <Share2 size={20} /> Share
                    </button>
                </div>
            </div>
        </div>
    );
}