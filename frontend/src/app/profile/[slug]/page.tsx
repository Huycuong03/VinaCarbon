import { PostCard } from "@/components/community";
import { DEFAULT_USER } from "@/constants";
import { Post } from "@/types/community";

export default function ProfilePage() {
    const profileData = {
        name: "Lê Minh Hoàng",
        username: "Lê Minh Hoàng",
        avatar: "https://picsum.photos/300/300?random=profile",
        bio: "Chủ trang trại hồ tiêu tại Lâm Đồng 🌿. Đam mê nông nghiệp bền vững và bảo vệ rừng đầu nguồn. Đang tham gia dự án tín chỉ carbon từ năm 2022.",
        stats: {
            posts: 18,
            supporters: 420,
            connections: 85
        },
        location: "Đà Lạt, Lâm Đồng"
    };

    const mockPosts: Post[] = [
        {
            id: "post1",
            author: {
                email: "alice@example.com",
                name: "Alice Johnson",
                image: "https://randomuser.me/api/portraits/women/21.jpg",
            },
            created_at: "2025-12-20T10:15:00Z",
            content: "Just finished a 10k run! Feeling amazing and energized. 🏃‍♀️✨",
            image: "https://picsum.photos/800/400?random=1",
            likes: [
                {
                    email: "bob@example.com",
                    name: "Bob Smith",
                    image: "https://randomuser.me/api/portraits/men/45.jpg",
                },
                {
                    email: "carol@example.com",
                    name: "Carol Lee",
                    image: "https://randomuser.me/api/portraits/women/32.jpg",
                },
            ],
            comments: [
                {
                    id: "comment1",
                    author: {
                        email: "dave@example.com",
                        name: "Dave Wilson",
                        image: "https://randomuser.me/api/portraits/men/11.jpg",
                    },
                    created_at: "2025-12-20T11:00:00Z",
                    content: "Way to go, Alice! 💪",
                },
                {
                    id: "comment2",
                    author: {
                        email: "ellen@example.com",
                        name: "Ellen Brown",
                        image: "https://randomuser.me/api/portraits/women/50.jpg",
                    },
                    created_at: "2025-12-20T11:15:00Z",
                    content: "Inspiring! I need to start running again.",
                },
            ],
            tags: ["fitness", "running", "motivation"],
        },

        {
            id: "post2",
            author: {
                email: "frank@example.com",
                name: "Frank Miller",
                image: "https://randomuser.me/api/portraits/men/67.jpg",
            },
            created_at: "2025-12-21T08:30:00Z",
            content: "Check out this sunset I captured yesterday. The sky was unreal! 🌅",
            image: "https://picsum.photos/800/400?random=2",
            likes: [
                {
                    email: "grace@example.com",
                    name: "Grace Kim",
                    image: "https://randomuser.me/api/portraits/women/22.jpg",
                },
            ],
            comments: [
                {
                    id: "comment3",
                    author: {
                        email: "henry@example.com",
                        name: "Henry Adams",
                        image: "https://randomuser.me/api/portraits/men/39.jpg",
                    },
                    created_at: "2025-12-21T09:00:00Z",
                    content: "That’s gorgeous! Where did you take this?",
                },
            ],
            tags: ["photography", "sunset", "nature"],
        },

        {
            id: "post3",
            author: {
                email: "ivy@example.com",
                name: "Ivy Chen",
                image: "https://randomuser.me/api/portraits/women/77.jpg",
            },
            created_at: "2025-12-22T14:45:00Z",
            content: "Finally launched my first web app! Feeling proud and relieved. 🚀",
            likes: [
                {
                    email: "jack@example.com",
                    name: "Jack Turner",
                    image: "https://randomuser.me/api/portraits/men/14.jpg",
                },
                {
                    email: "kate@example.com",
                    name: "Kate Wilson",
                    image: "https://randomuser.me/api/portraits/women/9.jpg",
                },
                {
                    email: "liam@example.com",
                    name: "Liam Patel",
                    image: "https://randomuser.me/api/portraits/men/50.jpg",
                },
            ],
            comments: [
                {
                    id: "comment4",
                    author: {
                        email: "mia@example.com",
                        name: "Mia Gonzales",
                        image: "https://randomuser.me/api/portraits/women/18.jpg",
                    },
                    created_at: "2025-12-22T15:10:00Z",
                    content: "Congrats Ivy! Can’t wait to try it out.",
                },
            ],
            tags: ["webdev", "launch", "proud"],
        },
    ];

    return (
        <div className="animate-fade-in bg-white min-h-screen py-5">
            <div className="max-w-4xl mx-auto px-6 pt-10 pb-20">
                <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center md:items-start mb-12">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border-2 border-bamboo">
                        <img src={profileData.avatar} alt={profileData.name} className="w-full h-full rounded-full object-cover" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-light text-charcoal capitalize">{profileData.username}</h2>
                            <div className="flex-1 flex justify-end">
                                <button className="px-5 py-1.5 bg-forest cursor-pointer text-white rounded-lg text-sm font-bold hover:scale-[1.05] transition-all">
                                    Đăng xuất
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start gap-8 mb-6">
                            <span><strong className="text-charcoal">{profileData.stats.posts}</strong> posts</span>
                            <span><strong className="text-charcoal">{profileData.stats.supporters}</strong> supporters</span>
                            <span><strong className="text-charcoal">{profileData.stats.connections}</strong> connections</span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-charcoal whitespace-pre-wrap">{profileData.bio}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mb-10"></div>

                <div className="space-y-6">
                    {mockPosts.map((post) => <PostCard post={post} user={DEFAULT_USER} />)}
                </div>
            </div>
        </div>
    );
};