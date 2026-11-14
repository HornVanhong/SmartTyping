import { Passage, TypingMetrics, Locale } from '../typing/types';
import { getFallbackPassage } from '../typing/starter-passages';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export interface SubmitSessionPayload {
  passageId?: string;
  locale: Locale;
  mode: string;
  durationSeconds: number;
  elapsedMs: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  clientCpm: number;
  clientWpm?: number | null;
  clientAccuracy: number;
}

export async function fetchRandomPassage(locale: Locale, difficulty?: string): Promise<Passage> {
  try {
    const params = new URLSearchParams({ locale });
    if (difficulty) params.append('difficulty', difficulty);

    const res = await fetch(`${API_BASE}/passages/random?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id,
        locale: data.locale,
        title: data.title || '',
        content: data.content,
        difficulty: data.difficulty,
        category: data.category,
        contentMode: data.contentMode,
      };
    }
  } catch (e) {
    // Graceful offline/local fallback
  }

  return getFallbackPassage(locale, difficulty);
}

export async function submitTypingSession(payload: SubmitSessionPayload): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/typing-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Return null if offline; guest local results still show
  }
  return null;
}
