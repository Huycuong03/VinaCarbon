import { Article, Post } from '@/types/community';

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

export enum Page {
  HOME = '/',
  SEARCH = '/search',
  ASSISTANT = '/assistant',
  MAP = '/map',
  COMMUNITY = '/community',
}

export const MAP_IMAGE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
export const MAP_REFERENCE_LAYER_URL = "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"