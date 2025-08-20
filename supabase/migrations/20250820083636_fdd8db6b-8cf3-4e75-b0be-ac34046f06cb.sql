
-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create text_files table for storing uploaded files
CREATE TABLE IF NOT EXISTS public.text_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size INTEGER NOT NULL,
  content TEXT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create text_chunks table for storing processed text chunks
CREATE TABLE IF NOT EXISTS public.text_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.text_files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  start_pos INTEGER NOT NULL,
  end_pos INTEGER NOT NULL,
  embedding vector(384),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (make tables public for this demo)
ALTER TABLE public.text_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_chunks ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo purposes
CREATE POLICY "Allow public access to text_files" 
ON public.text_files 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public access to text_chunks" 
ON public.text_chunks 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_text_files_updated_at
  BEFORE UPDATE ON public.text_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_chunks_file_id ON public.text_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_text_chunks_embedding ON public.text_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create search function for vector similarity search
CREATE OR REPLACE FUNCTION public.search_chunks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  file_id UUID,
  content TEXT,
  start_pos INTEGER,
  end_pos INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    text_chunks.id,
    text_chunks.file_id,
    text_chunks.content,
    text_chunks.start_pos,
    text_chunks.end_pos,
    1 - (text_chunks.embedding <=> query_embedding) AS similarity
  FROM text_chunks
  WHERE text_chunks.embedding IS NOT NULL
    AND 1 - (text_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY text_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
