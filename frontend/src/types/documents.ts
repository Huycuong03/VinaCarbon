export interface Document {
  id: string;
  title: string;
  url: string;
  content_type: string;
  created_at: number | string;
  storage_size: number | string;
};