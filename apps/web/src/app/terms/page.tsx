import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, ArrowLeft, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms & Fair Play — TypeMaster',
  description: 'TypeMaster terms of service and fair play guidelines.',
};

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to TypeMaster</span>
        </Link>

        <div className="space-y-3 pb-6 border-b border-border">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fair Play & Community Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Terms of Service & Anti-Cheat Rules
          </h1>
          <p className="text-sm text-muted">
            Effective November 2026 • Governing all fair play, leaderboards, and multiplayer competition.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Server-Authoritative Fair Play</h2>
            <p className="text-xs text-muted leading-relaxed">
              To ensure fair, trustworthy leaderboards and multiplayer competitions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-muted">
              <li>
                <strong>Server Authoritative Metrics:</strong> All final CPM, WPM, and accuracy scores are
                calculated on the server based on passage bounds, server timestamps, and character counts.
                Client-submitted calculations are treated as hints only.
              </li>
              <li>
                <strong>Monotonic Progress Tracking:</strong> Progress in multiplayer races must advance
                monotonically. Decreasing character offsets or impossible burst speeds trigger anti-cheat rejection.
              </li>
              <li>
                <strong>Automated Anti-Bot Checks:</strong> Scores exceeding human physical typing ceilings
                (e.g., &gt; 250 WPM or &gt; 1,200 CPM without variance) are automatically flagged as non-eligible
                for ranked leaderboards (`rankedEligible = false`).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Bilingual Integrity & Khmer Script Rule</h2>
            <p className="text-xs text-muted leading-relaxed">
              Khmer is a syllable and cluster-based writing system that does not have spaces between words. In accordance
              with international linguistic standards and TypeMaster product rules, Khmer typing speed is calculated
              strictly in Characters Per Minute (CPM) and is <strong>never</strong> converted or labeled as WPM.
              WPM is computed exclusively on English passages where the 5-character standardized word formula applies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Community Standards & Reporting</h2>
            <p className="text-xs text-muted leading-relaxed">
              TypeMaster is a supportive, educational environment for typists of all levels. Inappropriate or toxic
              display names, harassment in room chats, or abuse of the multiplayer platform will result in account
              suspension. Users may report misconduct at any time to the moderation team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Free & Open Access</h2>
            <p className="text-xs text-muted leading-relaxed">
              Use of the TypeMaster website, practice catalog, achievements, leaderboards, and multiplayer lobbies
              is completely free of charge. No paywalls or pay-to-win mechanisms will ever be introduced.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
