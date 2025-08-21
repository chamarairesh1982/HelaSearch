import { useState } from 'react';
import { searchDocuments, expandSnippetContext } from '@/lib/searchService';
import { SearchResult, SearchSnippet } from '@/lib/supabase';

interface SearchSettings {
  strict: boolean;
  resultCount: number;
  useLlm: boolean;
  expandQuery: boolean;
}

export function useSearch() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (query: string, settings: SearchSettings) => {
    setIsLoading(true);
    try {
      const searchResult = await searchDocuments(query, {
        limit: settings.resultCount,
        strict: settings.strict,
        useLlm: settings.useLlm,
        expandQuery: settings.expandQuery
      });
      setResult(searchResult);
    } catch (error) {
      console.error('Search error:', error);
      setResult({
        query,
        answer: '',
        snippets: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const expandContext = async (snippet: SearchSnippet): Promise<string> => {
    return await expandSnippetContext(snippet);
  };

  return {
    result,
    isLoading,
    search,
    expandContext
  };
}