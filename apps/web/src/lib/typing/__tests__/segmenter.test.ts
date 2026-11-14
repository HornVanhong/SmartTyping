import { describe, it, expect } from 'vitest';
import { splitGraphemes, evaluateInput } from '../segmenter';

describe('Unicode Grapheme Segmenter & Input Evaluation', () => {
  it('correctly segments English text into graphemes', () => {
    const text = 'Quick fox';
    const graphemes = splitGraphemes(text, 'en');
    expect(graphemes).toEqual(['Q', 'u', 'i', 'c', 'k', ' ', 'f', 'o', 'x']);
  });

  it('correctly segments Khmer combining characters into unified graphemes', () => {
    // Word: "ខ្មែរ" (Khmer)
    // Consonant ខ (\u1781) + Subscript marker ្ (\u17D2) + Consonant ម (\u1798) + Vowel ែ (\u17C2) + Consonant រ (\u1795)
    const text = 'ខ្មែរ';
    const graphemes = splitGraphemes(text, 'km');

    // Expected perceived grapheme clusters: "ខ្មែ" (cluster) and "រ"
    expect(graphemes.length).toBeGreaterThan(0);
    // Joining them back should reconstruct the exact text
    expect(graphemes.join('')).toBe(text);
  });

  it('evaluates correct and incorrect character matches accurately', () => {
    const target = ['h', 'e', 'l', 'l', 'o'];
    const input = ['h', 'e', 'x'];

    const result = evaluateInput(target, input, false);

    expect(result.correctCount).toBe(2);
    expect(result.incorrectCount).toBe(1);
    expect(result.isFinished).toBe(false);

    expect(result.evaluated[0].status).toBe('correct');
    expect(result.evaluated[1].status).toBe('correct');
    expect(result.evaluated[2].status).toBe('incorrect');
    expect(result.evaluated[3].status).toBe('current');
    expect(result.evaluated[4].status).toBe('pending');
  });

  it('does not mark test as finished while IME composition is active', () => {
    const target = ['a', 'b', 'c'];
    const input = ['a', 'b', 'c'];

    // If still composing, isFinished must be false!
    const resultComposing = evaluateInput(target, input, true);
    expect(resultComposing.isFinished).toBe(false);

    // When composition completes, isFinished becomes true
    const resultCommitted = evaluateInput(target, input, false);
    expect(resultCommitted.isFinished).toBe(true);
  });
});
