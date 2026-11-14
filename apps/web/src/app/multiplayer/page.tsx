'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { RoomResponse, RaceProgressPayload, RoomEvent } from '@/lib/multiplayer/types';
import { SimpleStompClient } from '@/lib/multiplayer/stomp-client';
import { API_BASE, getWebSocketUrl } from '@/lib/config/api';
import { LobbyView } from '@/components/multiplayer/LobbyView';
import { RaceArena } from '@/components/multiplayer/RaceArena';
import { Users, Plus, LogIn, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function MultiplayerPage() {
  const { user, token } = useAuth();

  // Navigation / Room State
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [createLocale, setCreateLocale] = useState<'en' | 'km'>('en');
  const [createDifficulty, setCreateDifficulty] = useState<string>('BEGINNER');
  const [createMaxPlayers, setCreateMaxPlayers] = useState<number>(5);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stomp client reference
  const stompClientRef = useRef<SimpleStompClient | null>(null);

  // Clean up Stomp client on unmount
  useEffect(() => {
    return () => {
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, []);

  // Initialize or update STOMP connection when room or token changes
  const connectWebSocket = useCallback((currentRoomCode: string) => {
    try {
      const wsUrl = getWebSocketUrl();
      const client = new SimpleStompClient(wsUrl, token);
      stompClientRef.current = client;

      client
        .connect()
        .then(() => {
          client.subscribe(`/topic/rooms/${currentRoomCode}`, (event: RoomEvent) => {
            if (!event || !event.type) return;

            if (event.type === 'ROOM_UPDATED' || event.type === 'RACE_STARTED' || event.type === 'RACE_FINISHED') {
              setRoom(event.payload as RoomResponse);
            } else if (event.type === 'PARTICIPANT_PROGRESS') {
              setRoom((prev) => {
                if (!prev) return prev;
                const updatedParticipant = event.payload;
                const newParticipants = prev.participants.map((p) =>
                  p.id === updatedParticipant.id ? { ...p, ...updatedParticipant } : p
                );
                return { ...prev, participants: newParticipants };
              });
            }
          });
        })
        .catch((err) => {
          console.warn('STOMP connection failed, using REST fallback:', err);
        });
    } catch (e) {
      console.warn('WebSocket init error:', e);
    }
  }, [token]);

  // Create room handler
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setErrorMessage('Please sign in or create a free account to host a multiplayer room.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale: createLocale,
          difficulty: createDifficulty,
          maxPlayers: createMaxPlayers,
          isPrivate: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create room.');
      }

      const createdRoom: RoomResponse = await res.json();
      setRoom(createdRoom);
      connectWebSocket(createdRoom.roomCode);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating room.');
    } finally {
      setIsLoading(false);
    }
  };

  // Join room handler
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    if (!user || !token) {
      setErrorMessage('Please sign in or create a free account to join a multiplayer race.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/rooms/${joinCode.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Could not join room. Check the code.');
      }

      const joinedRoom: RoomResponse = await res.json();
      setRoom(joinedRoom);
      connectWebSocket(joinedRoom.roomCode);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join room.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark ready handler
  const handleMarkReady = async () => {
    if (!room || !token) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // First try sending over STOMP if connected
      if (stompClientRef.current?.isConnected()) {
        stompClientRef.current.send('/app/room.ready', { roomCode: room.roomCode });
      }

      // Also send REST call for guaranteed delivery
      const res = await fetch(`${API_BASE}/rooms/${room.roomCode}/ready`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated: RoomResponse = await res.json();
        setRoom(updated);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating readiness.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send progress handler
  const handleSendProgress = (payload: RaceProgressPayload) => {
    if (!room || !token) return;

    // Send over WebSocket STOMP
    if (stompClientRef.current?.isConnected()) {
      stompClientRef.current.send('/app/race.progress', payload);
    } else {
      // Fallback to REST
      fetch(`${API_BASE}/rooms/${room.roomCode}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn('Progress REST fallback error:', e));
    }
  };

  // Leave room handler
  const handleLeaveRoom = async () => {
    if (room && token) {
      try {
        if (stompClientRef.current?.isConnected()) {
          stompClientRef.current.send('/app/room.leave', { roomCode: room.roomCode });
        }
        await fetch(`${API_BASE}/rooms/${room.roomCode}/leave`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (ignored) {}
    }

    stompClientRef.current?.disconnect();
    stompClientRef.current = null;
    setRoom(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* View 1: Not in Room -> Show Create & Join panels */}
        {!room && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Realtime Multiplayer Arena</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Race Against Friends & Typists
              </h1>
              <p className="text-sm text-muted">
                Compete in real time in both English and Khmer. Server-authoritative countdown,
                monotonic anti-cheat progress, and placement podium!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Create Room Card */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Create New Room</h2>
                  </div>

                  <form onSubmit={handleCreateRoom} className="space-y-4">
                    {/* Locale Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                        Language
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCreateLocale('en')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            createLocale === 'en'
                              ? 'bg-primary text-background border-primary shadow-sm'
                              : 'bg-elevated text-muted border-border hover:text-foreground'
                          }`}
                        >
                          English (WPM & CPM)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreateLocale('km')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            createLocale === 'km'
                              ? 'bg-primary text-background border-primary shadow-sm font-khmer'
                              : 'bg-elevated text-muted border-border hover:text-foreground font-khmer'
                          }`}
                        >
                          ភាសាខ្មែរ (Khmer CPM)
                        </button>
                      </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                        Difficulty
                      </label>
                      <select
                        value={createDifficulty}
                        onChange={(e) => setCreateDifficulty(e.target.value)}
                        className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
                      >
                        <option value="BEGINNER">Beginner (Short & Gentle)</option>
                        <option value="INTERMEDIATE">Intermediate (Standard)</option>
                        <option value="ADVANCED">Advanced (Challenging)</option>
                      </select>
                    </div>

                    {/* Max Players */}
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                        Max Players (2 - 10)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={createMaxPlayers}
                        onChange={(e) => setCreateMaxPlayers(parseInt(e.target.value) || 5)}
                        className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-sm transition-all"
                    >
                      {isLoading ? 'Creating Room...' : 'Create & Host Room'}
                    </button>
                  </form>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Free & Instant. Server-authoritative race rules.</span>
                </div>
              </div>

              {/* Join Room Card */}
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Join Existing Race</h2>
                  </div>

                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                        Enter 6-Letter Room Code
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="e.g. 7KM4P2"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg tracking-widest text-primary uppercase outline-none focus:border-primary"
                      />
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      Ask your friend for their 6-letter room code to jump straight into their
                      private or public lobby.
                    </p>

                    <button
                      type="submit"
                      disabled={isLoading || !joinCode.trim()}
                      className="w-full py-2.5 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent-hover shadow-sm transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Joining Room...' : 'Join Race Lobby'}
                    </button>
                  </form>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Low latency live telemetry via WebSockets.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: In Room -> Waiting Lobby */}
        {room && (room.status === 'WAITING' || room.status === 'READY') && (
          <LobbyView
            room={room}
            currentUserId={user?.id}
            onMarkReady={handleMarkReady}
            onLeaveRoom={handleLeaveRoom}
            isLoading={isLoading}
          />
        )}

        {/* View 3: In Room -> Racing or Completed */}
        {room && (room.status === 'RACING' || room.status === 'COMPLETED') && (
          <RaceArena
            room={room}
            currentUserId={user?.id}
            onSendProgress={handleSendProgress}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </div>
    </div>
  );
}
