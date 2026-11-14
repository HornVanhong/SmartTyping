import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../metrics';

describe('Typing Metrics Calculations', () => {
  it('calculates English WPM and CPM deterministically', () => {
    // 300 correct characters in 60,000 ms (1 minute)
    // Expected CPM: 300
    // Expected English WPM: 300 / 5 = 60
    // Expected accuracy: 300 / 300 * 100 = 100%
    const metrics = calculateMetrics({
      correctChars: 300,
      incorrectChars: 0,
      totalTyped: 300,
      elapsedMs: 60000,
      durationSeconds: 60,
      locale: 'en',
    });

    expect(metrics.cpm).toBe(300);
    expect(metrics.wpm).toBe(60);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.remainingSeconds).toBe(0);
  });

  it('keeps WPM null for Khmer while correctly calculating CPM', () => {
    // In accordance with AGENTS.md rule 5:
    // "Do not label Khmer CPM as WPM. WPM is shown only where its calculation is meaningful and documented."
    const metrics = calculateMetrics({
      correctChars: 150,
      incorrectChars: 5,
      totalTyped: 155,
      elapsedMs: 30000, // 0.5 minute
      durationSeconds: 30,
      locale: 'km',
    });

    // 150 / 0.5 = 300 CPM
    expect(metrics.cpm).toBe(300);
    expect(metrics.wpm).toBeNull();
    // Accuracy = 150 / 155 * 100 = 96.77% -> 97%
    expect(metrics.accuracy).toBe(97);
  });

  it('handles zero or tiny elapsed time without division by zero', () => {
    const metrics = calculateMetrics({
      correctChars: 0,
      incorrectChars: 0,
      totalTyped: 0,
      elapsedMs: 0,
      durationSeconds: 30,
      locale: 'en',
    });

    expect(metrics.cpm).toBe(0);
    expect(metrics.wpm).toBe(0);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.remainingSeconds).toBe(30);
  });
});
