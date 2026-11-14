'use client';

import React from 'react';
import { ParticipantResponse } from '@/lib/multiplayer/types';
import { Trophy, Award, Medal, CheckCircle2, Clock } from 'lucide-react';

interface RaceTrackProps {
  participants: ParticipantResponse[];
  totalCharacters: number;
  currentUserId?: string | null;
  hostUserId?: string | null;
  locale: 'en' | 'km';
}

export function RaceTrack({
  participants,
  totalCharacters,
  currentUserId,
  hostUserId,
  locale,
}: RaceTrackProps) {
  const safeTotal = Math.max(totalCharacters, 1);

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border text-xs text-muted font-semibold tracking-wider uppercase">
        <span>Racers ({participants.length})</span>
        <span>Progress</span>
      </div>

      <div className="space-y-4">
        {participants.map((p, index) => {
          const isYou = currentUserId && p.userId === currentUserId;
          const isHost = hostUserId && p.userId === hostUserId;
          const progressPercent = Math.min(100, Math.round((p.progressCharacters / safeTotal) * 100));

          return (
            <div
              key={p.id || index}
              className={`p-3.5 rounded-xl border transition-all ${
                isYou
                  ? 'bg-elevated/80 border-primary/40 shadow-sm'
                  : 'bg-surface/50 border-border'
              }`}
            >
              {/* Header row: Avatar, Name, Badges, Stats */}
              <div className="flex items-center justify-between gap-3 mb-2 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                    style={{ backgroundColor: p.avatarColor || '#7C8CFF' }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name and Tags */}
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-foreground truncate">
                      {p.displayName}
                    </span>
                    {isYou && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        YOU
                      </span>
                    )}
                    {isHost && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                        HOST
                      </span>
                    )}
                  </div>
                </div>

                {/* Status / Speed / Placement */}
                <div className="flex items-center gap-3 shrink-0 text-xs font-medium">
                  {p.status === 'READY' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  )}

                  {p.status === 'FINISHED' && p.placement && (
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        p.placement === 1
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : p.placement === 2
                          ? 'bg-slate-300/20 text-slate-300 border border-slate-400/30'
                          : p.placement === 3
                          ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30'
                          : 'bg-elevated text-muted'
                      }`}
                    >
                      {p.placement === 1 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                      {p.placement === 2 && <Award className="w-3.5 h-3.5 text-slate-300" />}
                      {p.placement === 3 && <Medal className="w-3.5 h-3.5 text-amber-600" />}
                      #{p.placement}
                    </span>
                  )}

                  {/* Speed display */}
                  {p.finalCpm != null ? (
                    <div className="flex items-center gap-1.5 text-muted">
                      {locale === 'en' && p.finalWpm != null && (
                        <span className="text-foreground font-semibold">
                          {p.finalWpm} <span className="text-[10px] text-muted">WPM</span>
                        </span>
                      )}
                      <span className="text-foreground font-semibold">
                        {p.finalCpm} <span className="text-[10px] text-muted">CPM</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted text-[11px]">{progressPercent}%</span>
                  )}
                </div>
              </div>

              {/* Lane track & car/runner marker */}
              <div className="relative w-full h-3 rounded-full bg-border/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    p.status === 'FINISHED'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isYou
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'bg-primary/60'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
