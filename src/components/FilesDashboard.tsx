import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Calendar, Hash, HardDrive, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFiles } from "@/hooks/useFiles";

interface FilesDashboardProps {
  onReindex?: () => Promise<void>;
  isReindexing?: boolean;
}

export function FilesDashboard({ 
  onReindex, 
  isReindexing 
}: FilesDashboardProps) {
  const { files, isLoading, totalSize, totalChunks, loadFiles } = useFiles();
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleRefresh = async () => {
    if (onReindex) {
      await onReindex();
    }
    await loadFiles();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-saffron/20">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-saffron" />
            <div>
              <p className="text-2xl font-bold text-saffron">{files.length}</p>
              <p className="text-sm text-muted-foreground">ගොනු</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-dharma/20">
          <div className="flex items-center gap-3">
            <Hash className="h-8 w-8 text-dharma" />
            <div>
              <p className="text-2xl font-bold text-dharma">{totalChunks}</p>
              <p className="text-sm text-muted-foreground">කැබලි</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-wisdom/20">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-wisdom" />
            <div>
              <p className="text-2xl font-bold text-wisdom">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-muted-foreground">මුළු ප්‍රමාණය</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-earth/20">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-earth" />
            <div>
              <p className="text-2xl font-bold text-earth">{formatFileSize(totalSize * 0.1)}</p>
              <p className="text-sm text-muted-foreground">සුචිය</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Files List */}
      <Card className="border-dharma/20">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dharma">ගොනු ලැයිස්තුව</h3>
            {handleRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isReindexing}
                className="border-dharma/30 hover:bg-dharma/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isReindexing ? 'animate-spin' : ''}`} />
                නවීකරණය
              </Button>
            )}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              data/ බහාලුමේ .txt ගොනු නොමැත
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              ගොනු එකතු කර නවින් කරන්න බොත්තම ක්ලික් කරන්න
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {files.map((file, index) => (
              <div key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {file.name}
                      </h4>
                       <p className="text-sm text-muted-foreground">
                         {file.original_name}
                       </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge variant="outline" className="border-saffron/30 text-saffron">
                        {file.chunk_count} කැබලි
                      </Badge>
                      <Badge variant="outline" className="border-muted-foreground/30">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      අවසන් වරට වෙනස් කළේ: {' '}
                      {formatDistanceToNow(new Date(file.updated_at), { addSuffix: true })}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span>කැබලි ප්‍රගතිය:</span>
                      <div className="w-20">
                        <Progress 
                          value={(file.chunk_count / Math.max(totalChunks, 1)) * 100} 
                          className="h-1"
                        />
                      </div>
                      <span>{Math.round((file.chunk_count / Math.max(totalChunks, 1)) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-gradient-subtle border-saffron/20">
        <div className="space-y-2">
          <h4 className="font-medium text-saffron">ගොනු එකතු කිරීම</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• සිංහල .txt ගොනු data/ බහාලුමට එකතු කරන්න</p>
            <p>• UTF-8 කේතනය භාවිතා කරන්න</p>
            <p>• ගොනු එකතු කිරීමෙන් පසු "නවින් කරන්න" ක්ලික් කරන්න</p>
            <p>• සුචිය ස්වයංක්‍රීයව නැවත සාදනු ලැබේ</p>
          </div>
        </div>
      </Card>
    </div>
  );
}