-- Add user_id columns to existing tables
ALTER TABLE public.text_files ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.text_chunks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove old public policies
DROP POLICY IF EXISTS "Allow public access to text_files" ON public.text_files;
DROP POLICY IF EXISTS "Allow public access to text_chunks" ON public.text_chunks;

-- Create secure user-based policies for text_files
CREATE POLICY "Users can view their own files" 
ON public.text_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own files" 
ON public.text_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
ON public.text_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.text_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure user-based policies for text_chunks  
CREATE POLICY "Users can view their own chunks" 
ON public.text_chunks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chunks" 
ON public.text_chunks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chunks" 
ON public.text_chunks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chunks" 
ON public.text_chunks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for profiles timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update search_chunks function to be user-aware
CREATE OR REPLACE FUNCTION public.search_chunks(query_embedding vector, match_threshold double precision DEFAULT 0.3, match_count integer DEFAULT 20)
RETURNS TABLE(id uuid, file_id uuid, content text, start_pos integer, end_pos integer, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    AND text_chunks.user_id = auth.uid()  -- Only search user's own documents
    AND 1 - (text_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY text_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$