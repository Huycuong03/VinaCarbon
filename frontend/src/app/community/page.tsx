import NavBar from "@/components/common/NavBar";
import PostCard from "@/components/community/PostCard";
import { COMMUNITY_POSTS } from "@/constants";
import { Page } from "@/types";

export default function CommunityPage() {
    return (
        <div className="animate-fade-in bg-gray-50 min-h-screen">
            <NavBar page={`${Page.COMMUNITY}`}/>
            <div className="max-w-3xl mx-auto -mt-8 py-12 px-6 pb-20">
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-forest">You</div>
                        <input type="text" placeholder="Share your experience or ask a question..." className="flex-1 bg-gray-50 rounded-xl px-4 focus:outline-none" />
                    </div>
                </div>

                <div className="space-y-6">
                    {COMMUNITY_POSTS.map(post => <PostCard key={post.id} post={post}/>)}
                </div>
            </div>
        </div>
    );
}