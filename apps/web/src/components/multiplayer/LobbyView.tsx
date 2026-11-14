'use client';

import React, { useState } from 'react';
import { RoomResponse } from '@/lib/multiplayer/types';
import { Copy, Check, Users, Globe, BookOpen, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface LobbyViewProps {
  room: RoomResponse;
  currentUserId?: string | null;
  onMarkReady: () => void;
  onLeaveRoom: () => void;
  isLoading?: boolean;
}

export function LobbyView({
  room,
  currentUserId,
  onMarkReady,
  onLeaveRoom,
  isLoading = false,
}: LobbyViewProps) {
  const [copied, setCopied] = useState(false);

  const currentUserParticipant = room.participants.find((p) => p.userId === currentUserId);
  const isReady = currentUserParticipant?.status === 'READY';
  const isHost = room.hostUserId === currentUserId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Room Header Card */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Multiplayer Room
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  room.locale === 'km'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-primary/15 text-primary border border-primary/30'
                }`}
              >
                {room.locale === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'English'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Waiting for Racers</h1>
          </div>

          {/* Room Code Display & Copy */}
          <div className="flex items-center gap-2 bg-elevated border border-border rounded-xl px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] text-muted font-bold tracking-wider uppercase">
                Room Code
              </div>
              <div className="text-xl font-mono font-extrabold text-primary tracking-widest">
                {room.roomCode}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy room code"
              className="p-2 rounded-lg bg-surface hover:bg-elevated text-muted hover:text-foreground border border-border transition-colors ml-2"
              title="Copy Room Code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Passage Preview */}
        <div className="mt-5 p-4 rounded-xl bg-elevated/60 border border-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span>Passage: {room.passageTitle || 'Standard Passage'}</span>
            <span className="text-border">•</span>
            <span>{room.passageContent.length} characters</span>
          </div>
          <p
            className={`text-sm text-foreground/80 line-clamp-2 italic ${
              room.locale === 'km' ? 'font-khmer leading-relaxed' : ''
            }`}
          >
            &ldquo;{room.passageContent}&rdquo;
          </p>
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Players in Room</span>
            <span className="text-xs font-normal text-muted">
              ({room.participants.length} / {room.maxPlayers})
            </span>
          </h2>
          <span className="text-xs text-muted">
            Race begins automatically when all players are ready!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {room.participants.map((p) => {
            const isUser = p.userId === currentUserId;
            const isPlayerReady = p.status === 'READY';

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isPlayerReady
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-elevated border-border'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                    style={{ backgroundColor: p.avatarColor || '#7C8CFF' }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {p.displayName}
                      </span>
                      {isUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                          YOU
                        </span>
                      )}
                    </div>
                    {p.userId === room.hostUserId && (
                      <span className="text-[10px] text-accent font-medium">Room Host</span>
                    )}
                  </div>
                </div>

                <div>
                  {isPlayerReady ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-xs text-muted font-medium px-2 py-1">
                      Waiting...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onLeaveRoom}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted hover:text-foreground hover:bg-elevated transition-colors"
        >
          Leave Room
        </button>

        <button
          type="button"
          onClick={onMarkReady}
          disabled={isLoading || isReady}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
            isReady
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-primary text-background hover:bg-primary-hover hover:scale-[1.02]'
          }`}
        >
          {isReady ? (
            <>
              <Check className="w-4 h-4" />
              <span>You Are Ready! Waiting for others...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Ready Up!</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
