import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User } from "lucide-react";
import { SearchInterface } from "@/components/SearchInterface";
import { SearchResults } from "@/components/SearchResults";
import { FilesDashboard } from "@/components/FilesDashboard";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SearchSettings {
  strict: boolean;
  resultCount: number;
  useLlm: boolean;
  expandQuery: boolean;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState("search");
  const [isReindexing, setIsReindexing] = useState(false);
  const { result, isLoading, search, expandContext } = useSearch();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSearch = async (query: string, settings: SearchSettings) => {
    await search(query, settings);
  };

  const handleReindex = async () => {
    setIsReindexing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsReindexing(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "දෝෂයක්",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "ප්‍රවේශයෙන් ඉවත් වීම සාර්ථකයි",
        description: "ඔබ සාර්ථකව ප්‍රවේශයෙන් ඉවත් විය.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header Card with User Info */}
        <Card className="mb-8 border-dharma/20 shadow-elegant">
          <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm opacity-90">
                <User size={16} />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:text-white/80 hover:bg-white/20"
              >
                <LogOut size={16} className="mr-1" />
                ප්‍රවේශයෙන් ඉවත්
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold mt-2">
              🏛️ RAG සිස්ටම්
            </CardTitle>
            <p className="text-lg opacity-90">
              සිංහල පෙළ ගොනු සෙවීම සහ විශ්ලේෂණය
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
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
    </div>
  );
}