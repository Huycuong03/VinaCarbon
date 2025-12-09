export interface User {
  id: string;
  name: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon?: any;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  readTime: string;
  content?: string;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface LandAnalysisData {
  biomass: number; // tons
  carbonStock: number; // tons
  estimatedCredits: number; // credits/year
  potentialRevenue: number; // USD
  canopyHeight: number; // meters
}

export enum Page {
  HOME = '/',
  COMMUNITY = '/community',
  MAP = '/map',
  SEARCH = '/docs',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
