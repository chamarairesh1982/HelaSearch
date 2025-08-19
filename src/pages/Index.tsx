import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchInterface } from "@/components/SearchInterface";
import { SearchResults } from "@/components/SearchResults";
import { FilesDashboard } from "@/components/FilesDashboard";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockFiles = [
  {
    path: "data/dhammapada.txt",
    name: "ධම්මපද",
    size: 45678,
    lastModified: "2024-08-15T10:30:00Z",
    chunkCount: 89
  },
  {
    path: "data/jataka_katha.txt", 
    name: "ජාතක කතා",
    size: 123456,
    lastModified: "2024-08-10T14:20:00Z",
    chunkCount: 167
  },
  {
    path: "data/buddha_vandana.txt",
    name: "බුද්ධ වන්දනා",
    size: 23456,
    lastModified: "2024-08-12T09:15:00Z",
    chunkCount: 34
  }
];

const mockSearchResult = {
  query: "කරුණා",
  answer: "කරුණා යනු සියලු සත්වයන්ට ඇති දුක් දුරදාම සහ සුව දුන් කිරීමේ අභිලාෂයයි. බුදුන් වහන්සේ කරුණාවේ මූර්තිමත් වූ ස්වරූපයයි.",
  snippets: [
    {
      docId: "dhammapada_001",
      file: "data/dhammapada.txt",
      text: "කරුණාව සියලු ධර්මයන්ගේ මූලයි. කරුණාවෙන් තොරව නිර්වාණයට පත්වීම අසාධ්‍යයි. මෙයින් අදහස් කරන්නේ සියලු සත්වයන්ට ඇති දුක් දුරදාම කිරීමයි.",
      start: 1234,
      end: 1456
    },
    {
      docId: "jataka_001", 
      file: "data/jataka_katha.txt",
      text: "බෝධිසත්ව කරුණාව ප්‍රභාවයෙන් සියලු සත්වයන්ගේ දුක් දුරදාම කරන්නේය. ඔහුගේ කරුණාව අසීමිතයි.",
      start: 2345,
      end: 2567
    }
  ]
};

interface SearchSettings {
  strict: boolean;
  resultCount: number;
}

export default function Index() {
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState(mockFiles);
  const [activeTab, setActiveTab] = useState("search");
  const { toast } = useToast();

  // Load persisted query on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem('dharma-search-query');
    if (savedQuery) {
      // Could restore the search query here if needed
    }
  }, []);

  const handleSearch = async (query: string, settings: SearchSettings) => {
    setIsSearching(true);
    
    // Persist query
    localStorage.setItem('dharma-search-query', query);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, show mock result for any query containing "කරුණා"
      if (query.includes("කරුණා")) {
        setSearchResult(mockSearchResult);
      } else {
        // No results found
        setSearchResult({
          query,
          answer: "",
          snippets: []
        });
      }
      
      toast({
        title: "සෙවීම සම්පූර්ණයි",
        description: `"${query}" සඳහා සෙවීම අවසන්`
      });
      
    } catch (error) {
      toast({
        title: "සෙවීමේ දෝෂයක්",
        description: "කරුණාකර නැවත උත්සාහ කරන්න",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    
    try {
      // Simulate reindexing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "සුචිගත කිරීම සම්පූර්ණයි",
        description: "ගොනු සාර්ථකව නවීකරණය කරන ලදී"
      });
      
    } catch (error) {
      toast({
        title: "සුචිගත කිරීමේ දෝෂයක්",
        description: "කරුණාකර නැවත උත්සාහ කරන්න",
        variant: "destructive"
      });
    } finally {
      setIsReindexing(false);
    }
  };

  const handleExpandContext = async (snippet) => {
    // Simulate expanding context
    await new Promise(resolve => setTimeout(resolve, 800));
    return `...පූර්ව සන්දර්භය... ${snippet.text} ...පසු සන්දර්භය... මෙය විස්තෘත සන්දර්භ අන්තර්ගතයකි.`;
  };

  const handleRefreshFiles = async () => {
    setIsLoadingFiles(true);
    
    try {
      // Simulate refreshing files
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "ගොනු නවීකරණය",
        description: "ගොනු ලේඛනය නවීකරණය කරන ලදී"
      });
      
    } catch (error) {
      toast({
        title: "ගොනු නවීකරණ දෝෂයක්",
        description: "ගොනු ලේඛනය පූරණය කළ නොහැක",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const totalChunks = files.reduce((sum, file) => sum + file.chunkCount, 0);

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
              isLoading={isSearching}
              isReindexing={isReindexing}
            />
            
            <SearchResults
              result={searchResult}
              isLoading={isSearching}
              onExpandContext={handleExpandContext}
            />
          </TabsContent>

          <TabsContent value="files">
            <FilesDashboard
              files={files}
              isLoading={isLoadingFiles}
              onRefresh={handleRefreshFiles}
              totalChunks={totalChunks}
              indexSize={2048576} // 2MB mock index size
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}