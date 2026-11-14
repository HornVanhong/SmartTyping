import { Locale, TypingMetrics } from './types';

export interface CalculationInput {
  correctChars: number;
  incorrectChars: number;
  totalTyped: number;
  elapsedMs: number;
  durationSeconds: number;
  locale: Locale;
}

/**
 * Calculates typing metrics:
 * - English WPM: (correct characters / 5) / elapsed minutes
 * - CPM: correct characters / elapsed minutes (for all locales)
 * - Accuracy: (correct characters / total typed) * 100
 *
 * In accordance with AGENTS.md:
 * "Do not label Khmer CPM as WPM. WPM is shown only where its calculation is meaningful and documented."
 */
export function calculateMetrics(input: CalculationInput): TypingMetrics {
  const { correctChars, incorrectChars, totalTyped, elapsedMs, durationSeconds, locale } = input;

  const elapsedMinutes = Math.max(elapsedMs / 60000, 0.0001);
  const cpm = Math.round(correctChars / elapsedMinutes);

  const wpm = locale === 'en'
    ? Math.round((correctChars / 5) / elapsedMinutes)
    : null;

  const accuracy = totalTyped > 0
    ? Math.min(100, Math.max(0, Math.round((correctChars / totalTyped) * 100)))
    : 100;

  const remainingSeconds = Math.max(0, Math.ceil(durationSeconds - elapsedMs / 1000));

  return {
    wpm,
    cpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalChars: totalTyped,
    elapsedMs,
    remainingSeconds,
  };
}
