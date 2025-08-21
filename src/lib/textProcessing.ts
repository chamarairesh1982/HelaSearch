// Text processing utilities for Sinhala text

// Basic stopword list for Sinhala derived from common particles and pronouns
const SINHALA_STOPWORDS = new Set([
  'මම', 'ඔබ', 'ඔහු', 'ඇය', 'අපි', 'ඔවුන්', 'මේ', 'මෙය', 'එය',
  'එම', 'සහ', 'හා', 'ද', 'වැනි', 'අතර', 'තවත්', 'ඉතා', 'පමණක්',
  'නමුත්', 'එහෙයින්'
]);

export function normalizeText(text: string): string {
  // Normalize Unicode to NFC form and remove BOM
  let normalized = text.normalize('NFC').replace(/^\uFEFF/, '');

  // Remove diacritics from Latin characters while preserving Sinhala marks
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');

  // Standardize punctuation forms
  normalized = normalized
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove stopwords
  const words = normalized.split(/\s+/);
  const filtered = words.filter((w) => !SINHALA_STOPWORDS.has(w.replace(/[\.\?!,'\"]/g, '')));
  return filtered.join(' ');
}

export function tokenizeSentences(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(/(?<=[\.!?\u0DF4])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
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
  const sentences = tokenizeSentences(text);
  const chunks: TextChunk[] = [];

  if (normalizedText.length <= chunkSize) {
    return [{ content: normalizedText, start: 0, end: normalizedText.length }];
  }

  let current = '';
  let chunkStart = 0;
  let currentEnd = 0;
  let searchPos = 0;

  for (const sentence of sentences) {
    const sentenceStart = normalizedText.indexOf(sentence, searchPos);
    const sentenceEnd = sentenceStart + sentence.length;

    if (current && current.length + sentence.length + 1 > chunkSize) {
      chunks.push({ content: current.trim(), start: chunkStart, end: currentEnd });
      const overlapText = overlap > 0 ? current.slice(-overlap) : '';
      chunkStart = currentEnd - overlapText.length;
      current = overlapText ? overlapText + ' ' + sentence : sentence;
    } else {
      if (!current) {
        chunkStart = sentenceStart;
      }
      current += (current ? ' ' : '') + sentence;
    }

    currentEnd = sentenceEnd;
    searchPos = sentenceEnd;
  }

  if (current.trim()) {
    chunks.push({ content: current.trim(), start: chunkStart, end: currentEnd });
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
