'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Crown, Calendar, Sparkles, Filter, Clock } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  userId: string;
  displayName: string;
  avatarColor: string;
  wpm: number | null;
  cpm: number;
  accuracy: number;
  createdAt: string;
}

interface LeaderboardResponse {
  period: string;
  locale: string;
  mode: string | null;
  items: LeaderboardItem[];
  page: number;
  size: number;
  totalItems: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'ALL_TIME'>('ALL_TIME');
  const [locale, setLocale] = useState<'en' | 'km'>('en');
  const [mode, setMode] = useState<string>('all');

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        locale,
        page: '0',
        size: '50',
      });
      if (mode !== 'all') {
        params.append('mode', mode);
      }

      const res = await fetch(`${API_BASE}/leaderboards?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, [period, locale, mode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const items = data?.items || [];
  const top1 = items[0];
  const top2 = items[1];
  const top3 = items[2];
  const rest = items.slice(3);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Global Rankings &amp; Fair Competition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          TypeMaster Leaderboards
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Rankings calculated server-side from completed, validated tests. Tie-breaks are determined
          by primary speed, then accuracy, then earlier completion timestamp.
        </p>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
        {/* Time Period Tabs */}
        <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border text-xs font-semibold">
          {(['ALL_TIME', 'WEEKLY', 'DAILY'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                period === p
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {p === 'ALL_TIME' ? 'All-Time' : p === 'WEEKLY' ? 'This Week' : 'Today'}
            </button>
          ))}
        </div>

        {/* Locale switcher */}
        <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              locale === 'en'
                ? 'bg-primary text-background font-bold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLocale('km')}
            className={`px-3 py-1.5 rounded-lg font-khmer transition-colors ${
              locale === 'km'
                ? 'bg-primary text-background font-bold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            ភាសាខ្មែរ (Khmer)
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border text-xs font-semibold">
          {['all', 'TIME_15', 'TIME_30', 'TIME_60', 'TIME_120'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                mode === m
                  ? 'bg-accent text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {m === 'all' ? 'All Modes' : m.replace('TIME_', '') + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 Display */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          {/* 2nd Place */}
          {top2 ? (
            <div className="p-6 rounded-2xl bg-surface border border-slate-400/30 flex flex-col items-center gap-3 text-center order-2 md:order-1 h-56 justify-between">
              <div className="w-12 h-12 rounded-full bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold text-lg border border-slate-300/40">
                2
              </div>
              <div>
                <div className="font-bold text-base text-foreground truncate max-w-[180px]">
                  {top2.displayName}
                </div>
                <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                  {locale === 'en' && top2.wpm !== null ? `${top2.wpm} WPM` : `${top2.cpm} CPM`}
                </div>
                <div className="text-xs text-muted mt-0.5">{top2.accuracy}% Accuracy</div>
              </div>
              <div className="text-[10px] text-muted font-mono">
                {new Date(top2.createdAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="hidden md:block order-2 md:order-1" />
          )}

          {/* 1st Place (Crown) */}
          {top1 && (
            <div className="p-7 rounded-2xl bg-gradient-to-b from-amber-500/15 via-surface to-surface border-2 border-amber-400/50 flex flex-col items-center gap-3 text-center order-1 md:order-2 h-64 justify-between shadow-xl shadow-amber-500/5">
              <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-extrabold text-2xl border-2 border-amber-400/60 shadow-md">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="font-extrabold text-lg text-foreground truncate max-w-[200px]">
                  {top1.displayName}
                </div>
                <div className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
                  {locale === 'en' && top1.wpm !== null ? `${top1.wpm} WPM` : `${top1.cpm} CPM`}
                </div>
                <div className="text-xs text-muted font-semibold mt-0.5">
                  {top1.accuracy}% Accuracy ({top1.cpm} CPM)
                </div>
              </div>
              <div className="text-[10px] text-muted font-mono">
                {new Date(top1.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3 ? (
            <div className="p-6 rounded-2xl bg-surface border border-amber-700/30 flex flex-col items-center gap-3 text-center order-3 md:order-3 h-52 justify-between">
              <div className="w-11 h-11 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center font-bold text-base border border-amber-600/40">
                3
              </div>
              <div>
                <div className="font-bold text-base text-foreground truncate max-w-[180px]">
                  {top3.displayName}
                </div>
                <div className="text-lg font-bold font-mono text-amber-500 mt-1">
                  {locale === 'en' && top3.wpm !== null ? `${top3.wpm} WPM` : `${top3.cpm} CPM`}
                </div>
                <div className="text-xs text-muted mt-0.5">{top3.accuracy}% Accuracy</div>
              </div>
              <div className="text-[10px] text-muted font-mono">
                {new Date(top3.createdAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="hidden md:block order-3 md:order-3" />
          )}
        </div>
      ) : null}

      {/* Full Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4">
        <h3 className="font-bold text-lg text-foreground">Rankings</h3>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted border-b border-border/80">
                <tr>
                  <th className="pb-3 font-semibold w-16">Rank</th>
                  <th className="pb-3 font-semibold">Typist</th>
                  <th className="pb-3 font-semibold">Speed</th>
                  <th className="pb-3 font-semibold">Accuracy</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-xs">
                {items.map((row) => (
                  <tr key={row.userId + row.createdAt} className="hover:bg-elevated/40 transition-colors">
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                          row.rank === 1
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : row.rank === 2
                            ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40'
                            : row.rank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                            : 'text-muted'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3 font-sans font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-background"
                          style={{ backgroundColor: row.avatarColor || '#7C8CFF' }}
                        >
                          {row.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span>{row.displayName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-foreground font-semibold">
                      {locale === 'en' && row.wpm !== null ? (
                        <span>
                          {row.wpm} <span className="text-[10px] text-muted">WPM</span> ({row.cpm} CPM)
                        </span>
                      ) : (
                        <span>
                          {row.cpm} <span className="text-[10px] text-muted">CPM</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-success font-semibold">{row.accuracy}%</td>
                    <td className="py-3 text-right text-muted">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted">
            No ranked scores recorded for this filter combination yet. Take a test while signed in to be the first!
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="p-4 rounded-xl bg-elevated/50 border border-border text-xs text-muted leading-relaxed">
        <div className="font-semibold text-foreground mb-1">Ranked Eligibility &amp; Fair Play</div>
        Tests must be completed by signed-in accounts and pass server-side validation (minimum duration, plausible CPM thresholds, and character consistency) to qualify for leaderboards. Guest tests remain private and local.
      </div>
    </div>
  );
}
