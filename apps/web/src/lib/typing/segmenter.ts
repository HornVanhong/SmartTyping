import { Locale } from './types';

/**
 * Splits text into user-perceived grapheme clusters.
 * Uses Intl.Segmenter where available; falls back to Array.from for environments without it.
 * This guarantees proper handling of Khmer combining characters (subscripts, dependent vowels, diacritics).
 */
export function splitGraphemes(text: string, locale: Locale = 'en'): string[] {
  if (!text) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(locale === 'km' ? 'km-KH' : 'en-US', {
        granularity: 'grapheme',
      });
      const segments = segmenter.segment(text);
      const result: string[] = [];
      for (const seg of segments) {
        result.push(seg.segment);
      }
      return result;
    } catch {
      // Fallback below
    }
  }

  // Fallback using code-point iteration
  return Array.from(text);
}

export const splitIntoGraphemes = splitGraphemes;

export interface CharacterMatchResult {
  grapheme: string;
  status: 'correct' | 'incorrect' | 'current' | 'pending';
}

/**
 * Compares committed user input graphemes against target text graphemes.
 */
export function evaluateInput(
  targetGraphemes: string[],
  inputGraphemes: string[],
  isComposing: boolean = false
): {
  evaluated: CharacterMatchResult[];
  correctCount: number;
  incorrectCount: number;
  isFinished: boolean;
} {
  let correctCount = 0;
  let incorrectCount = 0;
  const currentIdx = inputGraphemes.length;

  const evaluated: CharacterMatchResult[] = targetGraphemes.map((targetChar, idx) => {
    if (idx < currentIdx) {
      const inputChar = inputGraphemes[idx];
      if (inputChar === targetChar) {
        correctCount++;
        return { grapheme: targetChar, status: 'correct' };
      } else {
        incorrectCount++;
        return { grapheme: targetChar, status: 'incorrect' };
      }
    } else if (idx === currentIdx) {
      return { grapheme: targetChar, status: 'current' };
    } else {
      return { grapheme: targetChar, status: 'pending' };
    }
  });

  const isFinished = inputGraphemes.length >= targetGraphemes.length && !isComposing;

  return {
    evaluated,
    correctCount,
    incorrectCount,
    isFinished,
  };
}
