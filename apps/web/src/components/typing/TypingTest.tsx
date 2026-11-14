'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Locale,
  TestDuration,
  Difficulty,
  TypingState,
  Passage,
  TypingMetrics,
} from '@/lib/typing/types';
import { splitGraphemes, evaluateInput, CharacterMatchResult } from '@/lib/typing/segmenter';
import { calculateMetrics } from '@/lib/typing/metrics';
import { fetchRandomPassage, submitTypingSession } from '@/lib/api/client';
import { getFallbackPassage } from '@/lib/typing/starter-passages';
import { soundManager } from '@/lib/sound/sound-effects';
import { RotateCcw, ArrowRight, CheckCircle2, AlertCircle, Clock, Award, Zap } from 'lucide-react';

interface TypingTestProps {
  initialLocale?: Locale;
  initialDuration?: TestDuration;
  initialDifficulty?: Difficulty;
}

export function TypingTest({
  initialLocale = 'en',
  initialDuration = 30,
  initialDifficulty = 'BEGINNER',
}: TypingTestProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [duration, setDuration] = useState<TestDuration>(initialDuration);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  const [passage, setPassage] = useState<Passage>(() => getFallbackPassage(initialLocale, initialDifficulty));
  const [targetGraphemes, setTargetGraphemes] = useState<string[]>(() => splitGraphemes(passage.content, initialLocale));

  const [typedGraphemes, setTypedGraphemes] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [compositionText, setCompositionText] = useState<string>('');

  const [typingState, setTypingState] = useState<TypingState>('IDLE');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const [metrics, setMetrics] = useState<TypingMetrics>(() =>
    calculateMetrics({
      correctChars: 0,
      incorrectChars: 0,
      totalTyped: 0,
      elapsedMs: 0,
      durationSeconds: initialDuration,
      locale: initialLocale,
    })
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load new passage
  const loadPassage = useCallback(async (newLocale: Locale, newDiff: Difficulty) => {
    const p = await fetchRandomPassage(newLocale, newDiff);
    setPassage(p);
    setTargetGraphemes(splitGraphemes(p.content, newLocale));
    setTypedGraphemes([]);
    setCompositionText('');
    setTypingState('IDLE');
    setStartTime(null);
    setElapsedMs(0);
    setMetrics(
      calculateMetrics({
        correctChars: 0,
        incorrectChars: 0,
        totalTyped: 0,
        elapsedMs: 0,
        durationSeconds: duration,
        locale: newLocale,
      })
    );
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [duration]);

  // Restart current test
  const handleRestart = useCallback((overrideDuration?: TestDuration) => {
    const activeDuration = overrideDuration ?? duration;
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedGraphemes([]);
    setCompositionText('');
    setTypingState('IDLE');
    setStartTime(null);
    setElapsedMs(0);
    setMetrics(
      calculateMetrics({
        correctChars: 0,
        incorrectChars: 0,
        totalTyped: 0,
        elapsedMs: 0,
        durationSeconds: activeDuration,
        locale,
      })
    );
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [duration, locale]);

  // Handle Locale Change
  const handleLocaleChange = (newLoc: Locale) => {
    setLocale(newLoc);
    loadPassage(newLoc, difficulty);
  };

  // Handle Duration Change
  const handleDurationChange = (newDur: TestDuration) => {
    setDuration(newDur);
    handleRestart(newDur);
  };

  // Handle Difficulty Change
  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    loadPassage(locale, newDiff);
  };

  // Finish test
  const finishTest = useCallback(
    async (finalElapsed: number, finalGraphemes: string[]) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTypingState('COMPLETED');
      soundManager.playFinish();

      const evaluation = evaluateInput(targetGraphemes, finalGraphemes, false);
      const finalMetrics = calculateMetrics({
        correctChars: evaluation.correctCount,
        incorrectChars: evaluation.incorrectCount,
        totalTyped: finalGraphemes.length,
        elapsedMs: finalElapsed,
        durationSeconds: duration,
        locale,
      });
      setMetrics(finalMetrics);

      // Submit session in background
      await submitTypingSession({
        passageId: passage.id.includes('-') && passage.id.length > 20 ? passage.id : undefined,
        locale,
        mode: `TIME_${duration}`,
        durationSeconds: duration,
        elapsedMs: finalElapsed,
        correctCharacters: finalMetrics.correctChars,
        incorrectCharacters: finalMetrics.incorrectChars,
        totalCharacters: finalMetrics.totalChars,
        clientCpm: finalMetrics.cpm,
        clientWpm: finalMetrics.wpm,
        clientAccuracy: finalMetrics.accuracy,
      });
    },
    [targetGraphemes, duration, locale, passage.id]
  );

  // Timer loop
  useEffect(() => {
    if (typingState === 'TYPING' && startTime !== null) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsed = now - startTime;
        setElapsedMs(currentElapsed);

        if (currentElapsed >= duration * 1000) {
          finishTest(duration * 1000, typedGraphemes);
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [typingState, startTime, duration, typedGraphemes, finishTest]);

  // Recalculate metrics as user types
  useEffect(() => {
    if (typingState === 'TYPING' && elapsedMs > 0) {
      const evaluation = evaluateInput(targetGraphemes, typedGraphemes, isComposing);
      const m = calculateMetrics({
        correctChars: evaluation.correctCount,
        incorrectChars: evaluation.incorrectCount,
        totalTyped: typedGraphemes.length,
        elapsedMs,
        durationSeconds: duration,
        locale,
      });
      setMetrics(m);

      if (evaluation.isFinished) {
        finishTest(elapsedMs, typedGraphemes);
      }
    }
  }, [typedGraphemes, elapsedMs, typingState, isComposing, targetGraphemes, duration, locale, finishTest]);

  // IME & Input Handlers
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    setCompositionText(e.data || '');
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setCompositionText('');
    const fullValue = e.currentTarget.value;
    const graphemes = splitGraphemes(fullValue, locale);
    setTypedGraphemes(graphemes);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Start timer on first keystroke
    if (typingState === 'IDLE' && val.length > 0) {
      setTypingState('TYPING');
      setStartTime(Date.now());
    }

    if (!isComposing) {
      const graphemes = splitGraphemes(val, locale);
      setTypedGraphemes(graphemes);
      soundManager.playKeyClick(val.endsWith(' '));
    }
  };

  // Evaluate characters for rendering
  const evaluation = evaluateInput(targetGraphemes, typedGraphemes, isComposing);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6" data-testid="typing-test-container">
      {/* Top Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-elevated/70 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleLocaleChange('en')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              locale === 'en'
                ? 'bg-primary text-background font-semibold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            data-testid="locale-en-btn"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLocaleChange('km')}
            className={`px-3 py-1.5 text-sm font-khmer rounded-md transition-colors ${
              locale === 'km'
                ? 'bg-primary text-background font-semibold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            data-testid="locale-km-btn"
          >
            ភាសាខ្មែរ (Khmer)
          </button>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-1 bg-elevated/70 p-1 rounded-lg">
          {([15, 30, 60, 120] as TestDuration[]).map((dur) => (
            <button
              key={dur}
              type="button"
              onClick={() => handleDurationChange(dur)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                duration === dur
                  ? 'bg-primary text-background'
                  : 'text-muted hover:text-foreground'
              }`}
              data-testid={`duration-${dur}-btn`}
            >
              {dur}s
            </button>
          ))}
        </div>

        {/* Difficulty selector */}
        <div className="flex items-center gap-1 bg-elevated/70 p-1 rounded-lg">
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => handleDifficultyChange(diff)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                difficulty === diff
                  ? 'bg-accent text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
              data-testid={`difficulty-${diff.toLowerCase()}-btn`}
            >
              {diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Time Remaining */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted uppercase font-medium">Time Remaining</div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="remaining-seconds">
              {metrics.remainingSeconds}s
            </div>
          </div>
        </div>

        {/* Primary Speed Metric: WPM for English, CPM for Khmer */}
        {locale === 'en' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
            <Zap className="w-5 h-5 text-accent" />
            <div>
              <div className="text-xs text-muted uppercase font-medium">Speed (WPM)</div>
              <div className="text-2xl font-bold font-mono text-foreground" data-testid="metric-wpm">
                {metrics.wpm ?? 0}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
            <Zap className="w-5 h-5 text-accent" />
            <div>
              <div className="text-xs text-muted uppercase font-medium font-khmer">ល្បឿន (CPM)</div>
              <div className="text-2xl font-bold font-mono text-foreground" data-testid="metric-cpm">
                {metrics.cpm}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Metric: CPM for English, or Characters for Khmer */}
        {locale === 'en' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
            <Award className="w-5 h-5 text-primary-light" />
            <div>
              <div className="text-xs text-muted uppercase font-medium">CPM</div>
              <div className="text-2xl font-bold font-mono text-foreground" data-testid="metric-cpm">
                {metrics.cpm}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
            <Award className="w-5 h-5 text-primary-light" />
            <div>
              <div className="text-xs text-muted uppercase font-medium font-khmer">តួអក្សរត្រឹមត្រូវ</div>
              <div className="text-2xl font-bold font-mono text-foreground" data-testid="metric-correct">
                {metrics.correctChars}
              </div>
            </div>
          </div>
        )}

        {/* Accuracy */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div>
            <div className="text-xs text-muted uppercase font-medium">Accuracy</div>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="metric-accuracy">
              {metrics.accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Typing Workspace */}
      {typingState !== 'COMPLETED' ? (
        <div
          onClick={() => inputRef.current?.focus()}
          className={`relative p-6 sm:p-8 rounded-2xl bg-surface border-2 transition-all cursor-text min-h-[220px] flex flex-col justify-between ${
            typingState === 'TYPING'
              ? 'border-primary shadow-lg shadow-primary/5'
              : 'border-border hover:border-border/80'
          }`}
        >
          {/* Target Text Display with Caret & Status Highlights */}
          <div
            className={`text-lg sm:text-xl md:text-2xl select-none break-words ${
              locale === 'km' ? 'font-khmer leading-[2.2]' : 'font-sans leading-relaxed tracking-wide'
            }`}
            data-testid="passage-display"
          >
            {evaluation.evaluated.map((item, idx) => {
              if (item.status === 'correct') {
                return (
                  <span key={idx} className="text-accent">
                    {item.grapheme}
                  </span>
                );
              }
              if (item.status === 'incorrect') {
                return (
                  <span
                    key={idx}
                    className="text-error bg-error/20 underline decoration-error rounded-sm px-[1px]"
                  >
                    {item.grapheme}
                  </span>
                );
              }
              if (item.status === 'current') {
                return (
                  <span key={idx} className="relative inline-block text-foreground font-semibold">
                    <span className="absolute -left-[2px] top-[10%] bottom-[10%] w-[2.5px] bg-primary animate-pulse" />
                    {compositionText ? (
                      <span className="text-primary-light underline decoration-dashed">
                        {compositionText}
                      </span>
                    ) : (
                      item.grapheme
                    )}
                  </span>
                );
              }
              return (
                <span key={idx} className="text-muted/60">
                  {item.grapheme}
                </span>
              );
            })}
          </div>

          {/* Hidden/Transparent Input for IME & Keystroke Capture */}
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-text"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            onChange={handleInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            aria-label="Typing test input"
            data-testid="typing-input"
          />

          {/* Bottom helper prompt */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50 text-xs text-muted">
            <span>
              {typingState === 'IDLE' ? 'Click here and start typing to begin the test...' : 'Keep typing steady!'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRestart();
              }}
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors p-1"
              title="Restart test"
              data-testid="restart-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="p-8 rounded-2xl bg-surface border border-accent/30 shadow-xl flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Test Complete!</h2>
            <p className="text-sm text-muted mt-1">Here is your speed and accuracy breakdown</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
            {locale === 'en' ? (
              <div className="p-4 rounded-xl bg-elevated border border-border">
                <div className="text-xs text-muted uppercase">Speed</div>
                <div className="text-3xl font-bold font-mono text-accent mt-1" data-testid="result-wpm">
                  {metrics.wpm} <span className="text-xs font-normal text-muted">WPM</span>
                </div>
              </div>
            ) : null}

            <div className="p-4 rounded-xl bg-elevated border border-border">
              <div className="text-xs text-muted uppercase font-khmer">
                {locale === 'km' ? 'ល្បឿន (CPM)' : 'Characters/Min'}
              </div>
              <div className="text-3xl font-bold font-mono text-primary mt-1" data-testid="result-cpm">
                {metrics.cpm} <span className="text-xs font-normal text-muted">CPM</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-elevated border border-border">
              <div className="text-xs text-muted uppercase">Accuracy</div>
              <div className="text-3xl font-bold font-mono text-success mt-1" data-testid="result-accuracy">
                {metrics.accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-elevated border border-border">
              <div className="text-xs text-muted uppercase">Errors</div>
              <div className="text-3xl font-bold font-mono text-error mt-1" data-testid="result-errors">
                {metrics.incorrectChars}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleRestart()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold hover:bg-primary-hover transition-colors shadow-sm"
              data-testid="retry-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => loadPassage(locale, difficulty)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-elevated border border-border text-foreground hover:bg-elevated/80 transition-colors"
              data-testid="next-passage-btn"
            >
              <span>Next Passage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
