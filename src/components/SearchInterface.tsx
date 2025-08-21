import { useState } from "react";
import { Search, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SearchSettings {
  strict: boolean;
  resultCount: number;
  useLlm: boolean;
  expandQuery: boolean;
}

interface SearchInterfaceProps {
  onSearch: (query: string, settings: SearchSettings) => void;
  onReindex: () => void;
  isLoading?: boolean;
  isReindexing?: boolean;
}

export function SearchInterface({ onSearch, onReindex, isLoading, isReindexing }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useState<SearchSettings>({
    strict: true,
    resultCount: 8,
    useLlm: false,
    expandQuery: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "සෙවීමක් ඇතුළත් කරන්න",
        description: "කරුණාකර සෙවීමට වචන ඇතුළත් කරන්න",
        variant: "destructive"
      });
      return;
    }
    onSearch(query, settings);
  };

  const handleReindex = () => {
    onReindex();
    toast({
      title: "සුචිගත කිරීම ආරම්භ විය",
      description: "ගොනු නවින් කරනවා..."
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Search Card */}
      <Card className="p-8 bg-gradient-subtle border-saffron/20 shadow-saffron">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ධර්ම ගුණ සෙවීම
            </h1>
            <p className="text-muted-foreground text-lg">
              බෞද්ධ ධර්ම පාඨයන් සෙවීම සහ විමර්ශනය
            </p>
            <p className="text-sm text-muted-foreground">
              මෙම යෙදුම ඔබ ඇතුළත් කළ ගොනු තුළ ඇති තොරතුරු පමණක් භාවිතා කරයි
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="බෞද්ධ ධර්ම පාඨයන් සෙවීම..."
                className="pl-12 h-14 text-lg bg-background/80 border-saffron/30 focus:border-saffron focus:ring-saffron"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-primary hover:shadow-saffron transition-all duration-300"
              >
                {isLoading ? "සෙවීම..." : "සෙවීම"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReindex}
                disabled={isReindexing}
                className="border-saffron/30 hover:bg-saffron/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isReindexing ? "නවින් කරමින්..." : "නවින් කරන්න"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-saffron/10"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                සැකසීම්
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-6 border-dharma/20">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dharma">සෙවීම් සැකසීම්</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="strict-mode"
                  checked={settings.strict}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, strict: checked }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="strict-mode" className="text-sm font-medium">
                    කඩිනම් ප්‍රකාරය
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    ගොනු තුළ ඇති තොරතුරු පමණක් භාවිතා කරන්න
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="llm-summary"
                  checked={settings.useLlm}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, useLlm: checked }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="llm-summary" className="text-sm font-medium">
                    LLM සාරාංශය
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    OpenAI LLM භාවිතයෙන් සාරාංශයක්
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="query-expansion"
                  checked={settings.expandQuery}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, expandQuery: checked }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="query-expansion" className="text-sm font-medium">
                    සෙවුම් විස්තාරය
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    සමානාර්ථ පද මගින් සෙවීම් පුළුල් කරන්න
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">ප්‍රතිඵල ගණන</Label>
                <Select
                  value={settings.resultCount.toString()}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, resultCount: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="border-dharma/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 8, 10, 15, 20].map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} ප්‍රතිඵල
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-saffron/30 text-saffron">
                කඩිනම්: {settings.strict ? "සක්‍රිය" : "අක්‍රිය"}
              </Badge>
              <Badge variant="outline" className="border-dharma/30 text-dharma">
                ප්‍රතිඵල: {settings.resultCount}
              </Badge>
              <Badge variant="outline" className="border-saffron/30 text-saffron">
                LLM: {settings.useLlm ? "සක්‍රිය" : "අක්‍රිය"}
              </Badge>
              <Badge variant="outline" className="border-dharma/30 text-dharma">
                විස්තාරය: {settings.expandQuery ? "සක්‍රිය" : "අක්‍රිය"}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}