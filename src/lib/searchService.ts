import { supabase } from './supabase';
import { SearchResult, SearchSnippet, TextChunk } from './supabase';
import { expandContext } from './textProcessing';

// Cache to avoid recomputing embeddings for identical text
const embeddingCache = new Map<string, number[]>();
const EMBEDDING_DIMENSION = 1024; // deepseek-embedding-1 output size

// Simple embedding service using Supabase Edge Functions backed by DeepSeek
async function getEmbedding(text: string): Promise<number[]> {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text }
    });

    if (error) throw error;
    embeddingCache.set(text, data.embedding);
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a dummy embedding for development
    const dummy = Array(EMBEDDING_DIMENSION).fill(0).map(() => Math.random() - 0.5);
    embeddingCache.set(text, dummy);
    return dummy;
  }
}

export async function searchDocuments(
  query: string,
  options: {
    limit?: number;
    strict?: boolean;
    useLlm?: boolean;
  } = {}
): Promise<SearchResult> {
  const { limit = 8, strict = true, useLlm = false } = options;
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    // Search for similar chunks using vector similarity
    const { data: chunks, error } = await supabase.rpc('search_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: limit * 2
    });
    
    if (error) {
      console.error('Search error:', error);
      return {
        query,
        answer: '',
        snippets: []
      };
    }
    
    if (!chunks || chunks.length === 0) {
      return {
        query,
        answer: '',
        snippets: []
      };
    }
    
    // Get file information for the chunks
    const typedChunks = (chunks || []) as (TextChunk & { similarity?: number })[];

    const fileIds = [...new Set(typedChunks.map(chunk => chunk.file_id))];
    const { data: files } = await supabase
      .from('text_files')
      .select('*')
      .in('id', fileIds);
    
    const fileMap = new Map(files?.map(file => [file.id, file]) || []);
    
    // Convert to snippets
    const snippets: SearchSnippet[] = typedChunks
      .slice(0, limit)
      .map(chunk => {
        const file = fileMap.get(chunk.file_id);
        return {
          docId: chunk.id,
          file: file?.original_name || 'Unknown file',
          text: chunk.content,
          start: chunk.start_pos,
          end: chunk.end_pos,
          similarity: chunk.similarity || 0
        };
      });
    
    // Generate answer in strict mode
    let answer = '';
    if (strict && snippets.length > 0) {
      const topSnippets = snippets.slice(0, 3);
      answer = await generateAnswer(query, topSnippets, useLlm);
    }
    
    return {
      query,
      answer,
      snippets
    };

  } catch (error) {
    console.error('Search service error:', error);
    return {
      query,
      answer: '',
      snippets: []
    };
  }
}

async function generateAnswer(
  query: string,
  snippets: SearchSnippet[],
  useLlm: boolean
): Promise<string> {
  const combinedText = snippets.map(s => s.text).join(' ');
  if (combinedText.length === 0) return '';

  if (!useLlm) {
    return generateStrictAnswer(query, combinedText);
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-answer', {
      body: {
        query,
        snippets: snippets.map(s => s.text)
      }
    });

    if (error) throw error;
    return data.answer;
  } catch (error) {
    console.error('Error generating LLM answer:', error);
    return generateStrictAnswer(query, combinedText);
  }
}

function generateStrictAnswer(query: string, context: string): string {
  // Simple extraction-based answer generation
  // In a production system, you'd use a more sophisticated approach
  const sentences = context.split(/[.!?।]/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) return '';
  
  // Return the first relevant sentence as a simple answer
  const queryWords = query.toLowerCase().split(/\s+/);
  
  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    const matchCount = queryWords.filter(word => 
      sentenceLower.includes(word) || sentenceLower.includes(word.slice(0, -1))
    ).length;
    
    if (matchCount >= Math.min(2, queryWords.length)) {
      return sentence.trim();
    }
  }
  
  return sentences[0].trim();
}

export async function expandSnippetContext(
  snippet: SearchSnippet,
  contextSize: number = 300
): Promise<string> {
  try {
    // Get the full file content
    const { data: chunks } = await supabase
      .from('text_chunks')
      .select('file_id')
      .eq('id', snippet.docId)
      .single();
    
    if (!chunks) return snippet.text;
    
    const { data: file } = await supabase
      .from('text_files')
      .select('content')
      .eq('id', chunks.file_id)
      .single();
    
    if (!file) return snippet.text;
    
    return expandContext(file.content, snippet.start, snippet.end, contextSize);
    
  } catch (error) {
    console.error('Error expanding context:', error);
    return snippet.text;
  }
}