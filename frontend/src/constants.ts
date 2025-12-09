import { Article, Post } from '@/types';

export const APP_NAME = "VinaCarbon";

export const FEATURED_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'From Rice Fields to Revenue',
    excerpt: 'How sustainable farming practices in the Mekong Delta are generating new income streams through carbon credits.',
    category: 'Success Story',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Understanding Forest Canopies',
    excerpt: 'A deep dive into how LiDAR technology helps measure the carbon potential of your woodland property.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Government Policy Update 2024',
    excerpt: 'New regulations simplify the process for smallholder farmers to register for national carbon programs.',
    category: 'Policy',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    readTime: '4 min read'
  }
];

export const EDUCATION_MODULES = [
  {
    title: "Carbon Basics",
    description: "What is a carbon credit and why does it matter?",
    icon: "🌱"
  },
  {
    title: "Project Types",
    description: "Reforestation, Blue Carbon, and Methane Reduction.",
    icon: "🌳"
  },
  {
    title: "Measurement",
    description: "How scientists calculate the value of your land.",
    icon: "📏"
  },
  {
    title: "Marketplace",
    description: "How to sell your credits safely and legally.",
    icon: "💰"
  }
];

export const COMMUNITY_POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Nguyen Van A',
    authorAvatar: 'https://picsum.photos/50/50?random=10',
    timeAgo: '2 hours ago',
    content: 'Just finished my first biomass assessment for the new acacia plantation in Lam Dong. The results look promising! Has anyone else used the new simplified methodology?',
    likes: 24,
    comments: 5,
    tags: ['#Forestry', '#LamDong', '#Biomass']
  },
  {
    id: 'p2',
    author: 'Tran Thi B',
    authorAvatar: 'https://picsum.photos/50/50?random=11',
    timeAgo: '5 hours ago',
    content: 'Looking for partners to aggregate small rice farms in the Mekong Delta for a methane reduction project. We need at least 500 hectares.',
    image: 'https://picsum.photos/600/300?random=12',
    likes: 45,
    comments: 12,
    tags: ['#Rice', '#Mekong', '#Collaboration']
  }
];

export const MOCK_DOCUMENTS = [
  { title: "National Carbon Market Decree 06/2022", type: "PDF", size: "2.4 MB", date: "Jan 2022" },
  { title: "Methodology for Rice Cultivation (VM0042)", type: "PDF", size: "1.1 MB", date: "Mar 2023" },
  { title: "Guide to Afforestation in Central Highlands", type: "DOCX", size: "850 KB", date: "Jun 2023" },
  { title: "Carbon Pricing Technical Report", type: "PDF", size: "5.6 MB", date: "Aug 2023" },
];

export const IMAGE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
export const REFERENCE_LAYER_URL = "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"