import { User } from "@/types/common";

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
  images: string[];
  likes: User[];
  comments: Comment[];
};