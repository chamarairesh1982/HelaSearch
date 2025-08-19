// Text processing utilities for Sinhala text
export function normalizeText(text: string): string {
  // Normalize Unicode to NFC form and remove BOM
  return text.normalize('NFC').replace(/^\uFEFF/, '');
}

export interface TextChunk {
  content: string;
  start: number;
  end: number;
}

export function chunkText(
  text: string, 
  chunkSize: number = 700, 
  overlap: number = 100
): TextChunk[] {
  const normalizedText = normalizeText(text);
  const chunks: TextChunk[] = [];
  
  if (normalizedText.length <= chunkSize) {
    return [{
      content: normalizedText,
      start: 0,
      end: normalizedText.length
    }];
  }
  
  let start = 0;
  
  while (start < normalizedText.length) {
    let end = Math.min(start + chunkSize, normalizedText.length);
    
    // Try to break at sentence boundaries for better chunks
    if (end < normalizedText.length) {
      // Look for Sinhala sentence endings (period, question mark, exclamation)
      const sentenceEnd = normalizedText.lastIndexOf('।', end);
      const periodEnd = normalizedText.lastIndexOf('.', end);
      const questionEnd = normalizedText.lastIndexOf('?', end);
      const exclamationEnd = normalizedText.lastIndexOf('!', end);
      
      const bestEnd = Math.max(sentenceEnd, periodEnd, questionEnd, exclamationEnd);
      
      if (bestEnd > start + chunkSize * 0.7) {
        end = bestEnd + 1;
      }
    }
    
    const chunk: TextChunk = {
      content: normalizedText.slice(start, end).trim(),
      start,
      end
    };
    
    if (chunk.content.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start position with overlap
    start = Math.max(start + 1, end - overlap);
    
    // Prevent infinite loop
    if (start >= normalizedText.length) break;
  }
  
  return chunks;
}

export function expandContext(
  fullText: string, 
  start: number, 
  end: number, 
  contextSize: number = 300
): string {
  const expandedStart = Math.max(0, start - contextSize);
  const expandedEnd = Math.min(fullText.length, end + contextSize);
  
  let expanded = fullText.slice(expandedStart, expandedEnd);
  
  // Add ellipsis if we're not at the beginning/end
  if (expandedStart > 0) {
    expanded = '...' + expanded;
  }
  if (expandedEnd < fullText.length) {
    expanded = expanded + '...';
  }
  
  return expanded;
}