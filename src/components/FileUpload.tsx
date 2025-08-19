import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { chunkText } from '@/lib/textProcessing';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  id: string;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles)
      .filter(file => file.type === 'text/plain' || file.name.endsWith('.txt'))
      .map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
        id: Math.random().toString(36).substring(7)
      }));

    if (newFiles.length === 0) {
      toast({
        title: 'වලංගු නොවන ගොනු',
        description: 'කරුණාකර .txt ගොනු පමණක් අපලෝඩ් කරන්න',
        variant: 'destructive'
      });
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    processFiles(newFiles);
  };

  const processFiles = async (filesToProcess: UploadFile[]) => {
    for (const uploadFile of filesToProcess) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        // Read file content
        const content = await readFileContent(uploadFile.file);
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: 30 } : f
        ));

        // Process and chunk the text
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'processing', progress: 50 } : f
        ));

        const chunks = chunkText(content);
        
        // Insert file record
        const { data: fileRecord, error: fileError } = await supabase
          .from('text_files')
          .insert({
            name: uploadFile.file.name.replace('.txt', ''),
            original_name: uploadFile.file.name,
            size: uploadFile.file.size,
            content: content,
            chunk_count: chunks.length
          })
          .select()
          .single();

        if (fileError) throw fileError;

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: 70 } : f
        ));

        // Insert chunks
        const chunkInserts = chunks.map(chunk => ({
          file_id: fileRecord.id,
          content: chunk.content,
          start_pos: chunk.start,
          end_pos: chunk.end
        }));

        const { error: chunksError } = await supabase
          .from('text_chunks')
          .insert(chunkInserts);

        if (chunksError) throw chunksError;

        // Complete
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100 } : f
        ));

        toast({
          title: 'ගොනුව සාර්ථකව අපලෝඩ් විය',
          description: `${uploadFile.file.name} සාර්ථකව සැකසීය (${chunks.length} කොටස්)`
        });

      } catch (error) {
        console.error('File processing error:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'error' } : f
        ));

        toast({
          title: 'ගොනුව සැකසීමේ දෝෂයක්',
          description: `${uploadFile.file.name} සැකසීමේදී දෝෂයක් සිදු විය`,
          variant: 'destructive'
        });
      }
    }

    onUploadComplete?.();
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        className={`p-8 border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-saffron bg-saffron/5' 
            : 'border-saffron/30 hover:border-saffron/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-saffron/10">
              <Upload className="h-8 w-8 text-saffron" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-dharma">
              සිංහල පාඨ ගොනු අපලෝඩ් කරන්න
            </h3>
            <p className="text-muted-foreground">
              .txt ගොනු මෙහි ඇද්දමා දමන්න හෝ පහත බොත්තම ඔබන්න
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-primary hover:shadow-saffron transition-all duration-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            ගොනු තෝරන්න
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,text/plain"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground">
            සම්පූර්ණයෙන්ම UTF-8 කේතනය කළ සිංහල .txt ගොනු පමණක් අනුමත
          </p>
        </div>
      </Card>

      {/* File Processing List */}
      {files.length > 0 && (
        <Card className="p-6 border-dharma/20">
          <div className="space-y-4">
            <h4 className="font-semibold text-dharma">ගොනු ප්‍රගතිය</h4>
            
            <div className="space-y-3">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-dharma" />
                      <div>
                        <p className="font-medium text-sm">{uploadFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'uploading' || uploadFile.status === 'processing' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-saffron" />
                      ) : uploadFile.status === 'complete' ? (
                        <div className="text-green-600 text-sm font-medium">සම්පූර්ණ</div>
                      ) : uploadFile.status === 'error' ? (
                        <div className="text-destructive text-sm font-medium">දෝෂය</div>
                      ) : null}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {uploadFile.progress > 0 && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}
                  
                  {uploadFile.status === 'processing' && (
                    <p className="text-xs text-muted-foreground">
                      පාඨය කොටස් කරමින්...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}