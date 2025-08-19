import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchInterface } from "@/components/SearchInterface";
import { SearchResults } from "@/components/SearchResults";
import { FilesDashboard } from "@/components/FilesDashboard";
import { useSearch } from "@/hooks/useSearch";

interface SearchSettings {
  strict: boolean;
  resultCount: number;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("search");
  const [isReindexing, setIsReindexing] = useState(false);
  const { result, isLoading, search, expandContext } = useSearch();

  const handleSearch = async (query: string, settings: SearchSettings) => {
    await search(query, settings);
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsReindexing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="search" className="data-[state=active]:bg-saffron data-[state=active]:text-primary-foreground">
              සෙවීම
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-dharma data-[state=active]:text-primary-foreground">
              ගොනු
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            <SearchInterface
              onSearch={handleSearch}
              onReindex={handleReindex}
              isLoading={isLoading}
              isReindexing={isReindexing}
            />
            
            <SearchResults 
              result={result}
              isLoading={isLoading}
              onExpandContext={expandContext}
            />
          </TabsContent>

          <TabsContent value="files">
            <FilesDashboard
              onReindex={handleReindex}
              isReindexing={isReindexing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}