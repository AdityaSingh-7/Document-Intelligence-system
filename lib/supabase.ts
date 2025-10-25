import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_chunks: number;
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  similarity?: number;
  document_title?: string;
}

export interface QueryResult {
  query: string;
  summary: string;
  chunks: DocumentChunk[];
  resultsCount: number;
}
