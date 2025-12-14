import { User } from "@/types/common";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  readTime: string;
  content?: string;
};

export interface Comment {
  id: string;
  author: User;
  created_at: string;
  content: string;
};

export interface Post {
  id: string;
  author: User;
  created_at: string;
  content: string;
  image?: string;
  likes: User[];
  comments: Comment[];
  tags: string[];
};