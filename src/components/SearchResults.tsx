import { useState, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchSnippet {
  docId: string;
  file: string;
  text: string;
  start: number;
  end: number;
  expandedText?: string;
}

interface SearchResult {
  query: string;
  answer: string;
  snippets: SearchSnippet[];
}

interface SearchResultsProps {
  result: SearchResult | null;
  isLoading?: boolean;
  onExpandContext?: (snippet: SearchSnippet) => Promise<string>;
}

export function SearchResults({ result, isLoading, onExpandContext }: SearchResultsProps) {
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [loadingContext, setLoadingContext] = useState<Set<string>>(new Set());

  const highlightText = (text: string, query: string): ReactNode => {
    if (!query) return text;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const terms = query
      .split(/\s+/)
      .filter(Boolean)
      .map(escapeRegExp);
    if (terms.length === 0) return text;
    const pattern = new RegExp(`(${terms.join("|")})`, "gu");
    return text.split(pattern).map((part, i) =>
      i % 2 === 1 ? <mark key={i}>{part}</mark> : part
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </Card>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <Alert className="border-dharma/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          සෙවීමක් කිරීමට ඉහත පෙට්ටියේ වචන ඇතුළත් කරන්න
        </AlertDescription>
      </Alert>
    );
  }

  if (result.snippets.length === 0) {
    return (
      <Alert className="border-destructive/20">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          "{result.query}" සඳහා ප්‍රතිඵල සොයා ගත නොහැකි විය. වෙනත් වචන භාවිතා කර බලන්න.
        </AlertDescription>
      </Alert>
    );
  }

  const handleExpandContext = async (snippet: SearchSnippet) => {
    const snippetId = `${snippet.docId}-${snippet.start}`;
    
    if (expandedSnippets.has(snippetId)) {
      setExpandedSnippets(prev => {
        const newSet = new Set(prev);
        newSet.delete(snippetId);
        return newSet;
      });
      return;
    }

    if (onExpandContext) {
      setLoadingContext(prev => new Set(prev).add(snippetId));
      try {
        const expandedText = await onExpandContext(snippet);
        snippet.expandedText = expandedText;
        setExpandedSnippets(prev => new Set(prev).add(snippetId));
      } catch (error) {
        console.error('Failed to expand context:', error);
      }
      setLoadingContext(prev => {
        const newSet = new Set(prev);
        newSet.delete(snippetId);
        return newSet;
      });
    }
  };

  // Group snippets by file
  const groupedSnippets = result.snippets.reduce((acc, snippet) => {
    if (!acc[snippet.file]) {
      acc[snippet.file] = [];
    }
    acc[snippet.file].push(snippet);
    return acc;
  }, {} as Record<string, SearchSnippet[]>);

  return (
    <div className="space-y-6">
      {/* Answer Summary */}
      {result.answer && (
        <Card className="p-6 border-saffron/20 bg-gradient-subtle">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-saffron text-primary-foreground">
                සාරාංශය
              </Badge>
              <span className="text-sm text-muted-foreground">
                "{result.query}" සඳහා
              </span>
            </div>
            <p className="text-lg leading-relaxed text-foreground">
              {result.answer}
            </p>
          </div>
        </Card>
      )}

      {/* Snippets by File */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-dharma">
            සෙවීම් ප්‍රතිඵල
          </h3>
          <Badge variant="outline" className="border-dharma/30 text-dharma">
            {result.snippets.length} ප්‍රතිඵල
          </Badge>
        </div>

        {Object.entries(groupedSnippets).map(([file, snippets]) => (
          <Card key={file} className="border-dharma/20">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-dharma" />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">
                    {file.replace('data/', '').replace('.txt', '')}
                  </h4>
                  <p className="text-sm text-muted-foreground">{file}</p>
                </div>
                <Badge variant="outline" className="border-saffron/30 text-saffron">
                  {snippets.length} ප්‍රවේශ
                </Badge>
              </div>
            </div>

            <div className="divide-y divide-border">
              {snippets.map((snippet, index) => {
                const snippetId = `${snippet.docId}-${snippet.start}`;
                const isExpanded = expandedSnippets.has(snippetId);
                const isLoading = loadingContext.has(snippetId);

                return (
                  <div key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground leading-relaxed">
                          {highlightText(
                            isExpanded && snippet.expandedText
                              ? snippet.expandedText
                              : snippet.text,
                            result.query
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>පිටු: {snippet.start}-{snippet.end}</span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpandContext(snippet)}
                          disabled={isLoading}
                          className="text-dharma hover:bg-dharma/10"
                        >
                          {isLoading ? (
                            "පූරණය කරමින්..."
                          ) : isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              සරලව
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              විස්තර
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}