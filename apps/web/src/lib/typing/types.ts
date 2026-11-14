export type Locale = 'en' | 'km';
export type TestDuration = 15 | 30 | 60 | 120;
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type TypingState = 'IDLE' | 'TYPING' | 'COMPLETED';

export interface Passage {
  id: string;
  locale: Locale;
  title: string;
  content: string;
  difficulty: Difficulty;
  category: string;
  contentMode: string;
}

export interface TypingMetrics {
  wpm: number | null; // English only
  cpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedMs: number;
  remainingSeconds: number;
}
