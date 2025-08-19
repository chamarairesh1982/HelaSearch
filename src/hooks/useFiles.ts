import { useState, useEffect } from 'react';
import { supabase, TextFile } from '@/lib/supabase';

export function useFiles() {
  const [files, setFiles] = useState<TextFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('text_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFiles(data || []);
      setTotalFiles(data?.length || 0);
      setTotalSize(data?.reduce((sum, file) => sum + file.size, 0) || 0);
      setTotalChunks(data?.reduce((sum, file) => sum + file.chunk_count, 0) || 0);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      // Delete chunks first (due to foreign key constraint)
      await supabase
        .from('text_chunks')
        .delete()
        .eq('file_id', fileId);

      // Then delete the file
      const { error } = await supabase
        .from('text_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      // Reload files
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const reindexFiles = async () => {
    // For now, just reload the files
    // In a full implementation, this would regenerate embeddings
    await loadFiles();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return {
    files,
    isLoading,
    totalFiles,
    totalSize,
    totalChunks,
    loadFiles,
    deleteFile,
    reindexFiles
  };
}