export interface Message {
  id: string;
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