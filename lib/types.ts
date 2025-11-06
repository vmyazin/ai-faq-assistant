export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  content: string;
  url: string | null;
  title: string | null;
  embedding: number[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CrawlJob {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  pages_crawled: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
