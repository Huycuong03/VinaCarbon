export interface Message {
  id: string;
  type: "message" | "file_search_call";
  role: 'user' | 'assistant';
  content: MessageContent[];
}

export interface MessageContent {
  type: string;
  text: string;
  annotations?: {
    file_id: string;
    filename: string;
    type: string;
  }[]
}