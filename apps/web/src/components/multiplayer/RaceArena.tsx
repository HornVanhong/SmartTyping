'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RoomResponse, RaceProgressPayload } from '@/lib/multiplayer/types';
import { RaceTrack } from './RaceTrack';
import { splitGraphemes } from '@/lib/typing/segmenter';
import { Trophy, Award, Medal, RotateCcw, ArrowRight, Zap, Flag } from 'lucide-react';

interface RaceArenaProps {
  room: RoomResponse;
  currentUserId?: string | null;
  onSendProgress: (payload: RaceProgressPayload) => void;
  onLeaveRoom: () => void;
}

export function RaceArena({
  room,
  currentUserId,
  onSendProgress,
  onLeaveRoom,
}: RaceArenaProps) {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [typedText, setTypedText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [compositionText, setCompositionText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSentProgressRef = useRef<number>(0);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const passageGraphemes = React.useMemo(() => {
    return splitGraphemes(room.passageContent || '', room.locale);
  }, [room.passageContent, room.locale]);

  const committedGraphemes = React.useMemo(() => {
    return splitGraphemes(typedText, room.locale);
  }, [typedText, room.locale]);

  // Current user's participant entry
  const currentParticipant = room.participants.find((p) => p.userId === currentUserId);
  const isUserFinished = currentParticipant?.status === 'FINISHED';
  const isRaceCompleted = room.status === 'COMPLETED';

  // 3-2-1 Countdown logic
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(null);
        inputRef.current?.focus();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Evaluate progress and report to server
  const sendProgressUpdate = useCallback(
    (committed: string[]) => {
      let correct = 0;
      let incorrect = 0;

      for (let i = 0; i < committed.length; i++) {
        if (i < passageGraphemes.length && committed[i] === passageGraphemes[i]) {
          correct++;
        } else {
          incorrect++;
        }
      }

      const progressChars = Math.min(committed.length, passageGraphemes.length);

      // Monotonic guard: only send if progressed
      if (progressChars > lastSentProgressRef.current || progressChars === passageGraphemes.length) {
        lastSentProgressRef.current = progressChars;
        onSendProgress({
          roomCode: room.roomCode,
          progressCharacters: progressChars,
          correctCharacters: correct,
          incorrectCharacters: incorrect,
        });
      }
    },
    [passageGraphemes, room.roomCode, onSendProgress]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (countdown !== null || isUserFinished) return;
    const value = e.target.value;
    setTypedText(value);

    // Throttle progress updates to avoid WebSocket flooding
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        sendProgressUpdate(splitGraphemes(value, room.locale));
      }, 120);
    }

    // Immediate update on final character
    if (splitGraphemes(value, room.locale).length >= passageGraphemes.length) {
      sendProgressUpdate(splitGraphemes(value, room.locale));
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    setCompositionText(e.data);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setCompositionText('');
    const value = (e.target as HTMLInputElement).value;
    setTypedText(value);
    sendProgressUpdate(splitGraphemes(value, room.locale));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Race Track Header */}
      <RaceTrack
        participants={room.participants}
        totalCharacters={passageGraphemes.length}
        currentUserId={currentUserId}
        hostUserId={room.hostUserId}
        locale={room.locale}
      />

      {/* Countdown Overlay or Active Arena */}
      <div className="relative bg-surface rounded-2xl border border-border p-6 shadow-sm">
        {countdown !== null && (
          <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
            <div className="text-sm font-bold tracking-widest text-primary uppercase mb-2">
              Ready... Set...
            </div>
            <div className="text-7xl font-extrabold text-foreground animate-bounce">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        )}

        {/* Passage Display with Grapheme-level highlights */}
        <div
          className={`select-none p-5 rounded-xl bg-elevated/60 border border-border text-lg leading-relaxed tracking-wide min-h-[120px] cursor-text ${
            room.locale === 'km' ? 'font-khmer text-xl leading-loose' : 'font-mono'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {passageGraphemes.map((char, index) => {
            let stateClass = 'text-muted/60';
            const isCurrent = index === committedGraphemes.length;

            if (index < committedGraphemes.length) {
              stateClass =
                committedGraphemes[index] === char
                  ? 'text-emerald-400 font-semibold'
                  : 'text-error font-semibold bg-error/15 rounded';
            }

            return (
              <span
                key={index}
                className={`relative transition-colors ${stateClass} ${
                  isCurrent ? 'border-b-2 border-primary animate-pulse' : ''
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Composition preview indicator for Khmer IME */}
        {isComposing && compositionText && (
          <div className="mt-2 text-xs text-primary font-khmer flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-lg w-fit border border-primary/20">
            <span className="text-[10px] text-muted uppercase font-bold">IME Composing:</span>
            <span>{compositionText}</span>
          </div>
        )}

        {/* Hidden / Transparent typing input */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          disabled={countdown !== null || isUserFinished}
          autoFocus={countdown === null}
          aria-label="Multiplayer typing input"
          className="w-full mt-4 bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted/50"
          placeholder={
            countdown !== null
              ? 'Get ready...'
              : isUserFinished
              ? 'You have crossed the finish line!'
              : room.locale === 'km'
              ? 'វាយអត្ថបទនៅទីនេះ...'
              : 'Type the passage here...'
          }
        />
      </div>

      {/* Finished / Results Banner */}
      {(isUserFinished || isRaceCompleted) && (
        <div className="bg-gradient-to-r from-surface to-elevated rounded-2xl border border-primary/30 p-6 shadow-lg animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${
                  currentParticipant?.placement === 1
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-300'
                    : currentParticipant?.placement === 2
                    ? 'bg-gradient-to-tr from-slate-400 to-slate-200'
                    : currentParticipant?.placement === 3
                    ? 'bg-gradient-to-tr from-amber-700 to-amber-500'
                    : 'bg-primary'
                }`}
              >
                {currentParticipant?.placement === 1 ? (
                  <Trophy className="w-8 h-8 text-white" />
                ) : (
                  <Flag className="w-8 h-8 text-white" />
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider">
                  {isRaceCompleted ? 'Race Completed' : 'You Finished!'}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {currentParticipant?.placement
                    ? `You finished #${currentParticipant.placement}!`
                    : 'Great job!'}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                  {room.locale === 'en' && currentParticipant?.finalWpm != null && (
                    <span>
                      Speed:{' '}
                      <strong className="text-foreground">{currentParticipant.finalWpm} WPM</strong>
                    </span>
                  )}
                  {currentParticipant?.finalCpm != null && (
                    <span>
                      CPM:{' '}
                      <strong className="text-foreground">{currentParticipant.finalCpm}</strong>
                    </span>
                  )}
                  {currentParticipant?.finishElapsedMs && (
                    <span>
                      Time:{' '}
                      <strong className="text-foreground">
                        {(currentParticipant.finishElapsedMs / 1000).toFixed(1)}s
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLeaveRoom}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted hover:text-foreground hover:bg-elevated transition-colors"
              >
                Exit to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
