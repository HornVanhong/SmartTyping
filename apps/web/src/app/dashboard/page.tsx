'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { API_BASE } from '@/lib/config/api';
import {
  Trophy,
  Zap,
  Target,
  Clock,
  Award,
  Trash2,
  Calendar,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface SummaryStats {
  totalTestsCompleted: number;
  bestWpm: number;
  bestCpm: number;
  averageAccuracy: number;
  totalPracticeTimeSeconds: number;
}

interface TrendPoint {
  id: string;
  locale: string;
  mode: string;
  durationSeconds: number;
  cpm: number;
  wpm: number | null;
  accuracy: number;
  createdAt: string;
}

interface AchievementItem {
  id: string;
  code: string;
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  iconKey: string;
  unlocked: boolean;
  earnedAt: string | null;
}

interface HistoryItem {
  id: string;
  locale: string;
  mode: string;
  durationSeconds: number;
  cpm: number;
  wpm: number | null;
  accuracy: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [trendLocale, setTrendLocale] = useState<string>('');
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setDataLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: HeadersInit = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      // 1. Fetch summary stats
      if (user) {
        const statsRes = await fetch(`${API_BASE}/stats/me/summary`, {
          headers,
          credentials: 'include',
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        // 2. Fetch trends
        const trendUrl = trendLocale
          ? `${API_BASE}/stats/me/trend?locale=${trendLocale}`
          : `${API_BASE}/stats/me/trend`;
        const trendRes = await fetch(trendUrl, { headers, credentials: 'include' });
        if (trendRes.ok) {
          setTrends(await trendRes.json());
        }

        // 3. Fetch history
        const histRes = await fetch(`${API_BASE}/typing-sessions/me?size=10`, {
          headers,
          credentials: 'include',
        });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData.content || []);
        }
      }

      // 4. Fetch achievements (public/authenticated)
      const achRes = await fetch(`${API_BASE}/achievements`, {
        headers,
        credentials: 'include',
      });
      if (achRes.ok) {
        setAchievements(await achRes.json());
      }
    } catch {
      // Offline fallback
    } finally {
      setDataLoading(false);
    }
  }, [user, trendLocale]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteSession = async (id: string) => {
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/typing-sessions/me/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        fetchDashboardData();
      }
    } catch {
      // Ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-muted">
        Loading dashboard...
      </div>
    );
  }

  // Guest Callout
  if (!user) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2 max-w-lg">
          <h1 className="text-3xl font-extrabold text-foreground">Track Your Progress</h1>
          <p className="text-sm text-muted leading-relaxed">
            Sign in or create a free TypeMaster account to save your typing history, unlock
            achievements, view speed improvement charts, and compete on the global leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-background font-semibold hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span>Start Practice</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Available Achievements Preview */}
        <div className="w-full mt-12 text-left">
          <h3 className="text-lg font-bold text-foreground mb-4">Available Achievements Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((ach) => (
              <div
                key={ach.id}
                className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3 opacity-80"
              >
                <div className="w-9 h-9 rounded-lg bg-elevated border border-border flex items-center justify-center text-muted shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{ach.nameEn}</div>
                  <div className="text-xs text-muted mt-0.5">{ach.descriptionEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-10 flex flex-col gap-10 w-full">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-background text-2xl font-bold shadow-md">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2">
              <span>{user.displayName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 uppercase">
                {user.role}
              </span>
            </h1>
            <p className="text-xs text-muted mt-1">{user.email}</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>Take a Test</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-muted text-xs font-medium uppercase">
            <span>Tests Completed</span>
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-mono text-foreground" data-testid="stat-tests">
            {stats?.totalTestsCompleted ?? 0}
          </div>
          <div className="text-xs text-muted">Total recorded sessions</div>
        </div>

        {/* Best English Speed */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-muted text-xs font-medium uppercase">
            <span>Best English Speed</span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold font-mono text-accent" data-testid="stat-wpm">
            {stats?.bestWpm ?? 0} <span className="text-xs font-normal text-muted">WPM</span>
          </div>
          <div className="text-xs text-muted">Peak words per minute</div>
        </div>

        {/* Best CPM */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-muted text-xs font-medium uppercase">
            <span>Best CPM</span>
            <Award className="w-4 h-4 text-primary-light" />
          </div>
          <div className="text-3xl font-bold font-mono text-primary" data-testid="stat-cpm">
            {stats?.bestCpm ?? 0} <span className="text-xs font-normal text-muted">CPM</span>
          </div>
          <div className="text-xs text-muted">Peak characters per minute</div>
        </div>

        {/* Average Accuracy */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-muted text-xs font-medium uppercase">
            <span>Average Accuracy</span>
            <Target className="w-4 h-4 text-success" />
          </div>
          <div className="text-3xl font-bold font-mono text-success" data-testid="stat-accuracy">
            {stats?.averageAccuracy ?? 0}%
          </div>
          <div className="text-xs text-muted">Across all completed tests</div>
        </div>
      </div>

      {/* Speed & Accuracy Progression Trend Chart */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-lg text-foreground">Speed Progression</h3>
          </div>

          <div className="flex items-center gap-1 bg-elevated p-1 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setTrendLocale('')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                trendLocale === ''
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTrendLocale('en')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                trendLocale === 'en'
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setTrendLocale('km')}
              className={`px-3 py-1 text-xs font-medium font-khmer rounded-md transition-colors ${
                trendLocale === 'km'
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              ភាសាខ្មែរ
            </button>
          </div>
        </div>

        {/* SVG Sparkline / Bar Graph */}
        {trends.length > 0 ? (
          <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-2 border-b border-border/50">
            {trends.map((item, idx) => {
              const maxCpm = Math.max(...trends.map((t) => t.cpm), 100);
              const heightPercent = Math.max(15, Math.round((item.cpm / maxCpm) * 100));

              return (
                <div
                  key={item.id || idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-elevated border border-border px-2.5 py-1 rounded-md text-[11px] font-mono text-foreground shadow-lg whitespace-nowrap pointer-events-none">
                    <span>
                      {item.locale === 'en' && item.wpm ? `${item.wpm} WPM | ` : ''}
                      {item.cpm} CPM
                    </span>
                    <span className="text-[10px] text-muted">{item.accuracy}% acc</span>
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all group-hover:opacity-100 ${
                      item.locale === 'km'
                        ? 'bg-accent/70 hover:bg-accent'
                        : 'bg-primary/70 hover:bg-primary'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-muted mt-2 hidden sm:block">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted">
            No test sessions recorded for this filter yet. Complete a test to see your speed chart!
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">Badges &amp; Achievements</h3>
          </div>
          <div className="text-xs text-muted font-medium">
            {achievements.filter((a) => a.unlocked).length} of {achievements.length} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-surface border-accent/40 shadow-sm'
                  : 'bg-surface/50 border-border opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  ach.unlocked
                    ? 'bg-accent/20 text-accent font-bold'
                    : 'bg-elevated text-muted'
                }`}
              >
                {ach.unlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{ach.nameEn}</span>
                  {ach.unlocked && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-accent/20 text-accent">
                      EARNED
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted leading-relaxed">{ach.descriptionEn}</div>
                <div className="text-[11px] text-muted/70 font-khmer mt-0.5 leading-relaxed">
                  {ach.descriptionKm}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4">
        <h3 className="font-bold text-lg text-foreground">Recent Test History</h3>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted border-b border-border/80">
                <tr>
                  <th className="pb-3 font-semibold">Date &amp; Time</th>
                  <th className="pb-3 font-semibold">Locale</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Speed</th>
                  <th className="pb-3 font-semibold">Accuracy</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-xs">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-elevated/40 transition-colors">
                    <td className="py-3 text-muted">
                      {new Date(row.createdAt).toLocaleDateString()}{' '}
                      {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.locale === 'km'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {row.locale.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-foreground">{row.durationSeconds}s</td>
                    <td className="py-3 text-foreground font-semibold">
                      {row.locale === 'en' && row.wpm !== null ? (
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
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(row.id)}
                        className="p-1 rounded text-muted hover:text-error transition-colors"
                        title="Delete session record"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted">
            No test sessions saved yet. Start practicing to see your session logs!
          </div>
        )}
      </div>
    </div>
  );
}
