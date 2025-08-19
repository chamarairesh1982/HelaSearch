import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      text_files: {
        Row: {
          id: string;
          name: string;
          original_name: string;
          size: number;
          content: string;
          chunk_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          original_name: string;
          size: number;
          content: string;
          chunk_count: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          original_name?: string;
          size?: number;
          content?: string;
          chunk_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      text_chunks: {
        Row: {
          id: string;
          file_id: string;
          content: string;
          start_pos: number;
          end_pos: number;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          content: string;
          start_pos: number;
          end_pos: number;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_id?: string;
          content?: string;
          start_pos?: number;
          end_pos?: number;
          embedding?: number[] | null;
          created_at?: string;
        };
      };
    };
  };
};

export type TextFile = Database['public']['Tables']['text_files']['Row'];
export type TextChunk = Database['public']['Tables']['text_chunks']['Row'];

export interface SearchResult {
  query: string;
  answer: string;
  snippets: SearchSnippet[];
}

export interface SearchSnippet {
  docId: string;
  file: string;
  text: string;
  start: number;
  end: number;
  expandedText?: string;
  similarity?: number;
}