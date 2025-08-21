import { describe, it, expect } from 'vitest';
import { tokenizeSentences, chunkText } from './textProcessing';

describe('Sinhala text processing', () => {
  it('tokenizes sentences correctly', () => {
    const text = 'සිංහල භාෂාව සුවඳයි. කුරුල්ලෝ ගසක ගී කියති? දිවයින සුරකින්න!';
    const sentences = tokenizeSentences(text);
    expect(sentences).toEqual([
      'සිංහල භාෂාව සුවඳයි.',
      'කුරුල්ලෝ ගසක ගී කියති?',
      'දිවයින සුරකින්න!'
    ]);
  });

  it('chunks text using sentence boundaries', () => {
    const text = 'සිංහල භාෂාව සුවඳයි. කුරුල්ලෝ ගසක ගී කියති? දිවයින සුරකින්න!';
    const chunks = chunkText(text, 50, 0);
    expect(chunks.length).toBe(2);
    expect(chunks[0].content).toBe('සිංහල භාෂාව සුවඳයි. කුරුල්ලෝ ගසක ගී කියති?');
    expect(chunks[1].content).toBe('දිවයින සුරකින්න!');
  });
});
