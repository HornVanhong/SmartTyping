import React from 'react';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Trash2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — TypeMaster',
  description: 'TypeMaster privacy policy and data governance practices.',
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Privacy Policy & Data Principles
          </h1>
          <p className="text-sm text-muted">
            Last updated: November 2026 • Effective immediately across all TypeMaster services.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
          {/* Core Non-Negotiable Commitment */}
          <div className="p-5 rounded-2xl bg-surface border border-emerald-500/30 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <EyeOff className="w-5 h-5" />
              <span>Zero Raw Keystroke Logging Policy</span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              In accordance with our strict product engineering principles, TypeMaster does <strong>never</strong> record,
              transmit, or store the raw text or sequence of characters that you type. Typing engine comparisons
              run entirely client-side in your web browser. Only mathematical aggregate results (duration, CPM,
              English WPM, accuracy percentage, and timestamp) are sent to the server for verified accounts.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. What Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-muted">
              <li>
                <strong>Guest Users:</strong> No personal identification is collected. All test scores remain
                local to your browser session unless you register.
              </li>
              <li>
                <strong>Registered Members:</strong> We collect your email address, display name, preferred
                locale (`en` or `km`), and chosen avatar accent color. Passwords are cryptographic hashes (BCrypt)
                and cannot be recovered in plain text.
              </li>
              <li>
                <strong>Typing & Race Metrics:</strong> Recomputed speed (CPM, WPM), accuracy %, test duration,
                and server-authoritative race placement.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. How We Protect Your Data</h2>
            <p className="text-xs text-muted leading-relaxed">
              All communications are encrypted using HTTPS and WSS (WebSockets over TLS). Access tokens are
              stateless JSON Web Tokens with a 15-minute expiration, and refresh tokens are securely rotated and
              stored as SHA-256 hashes at rest.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. User Rights & Account Deletion</h2>
            <p className="text-xs text-muted leading-relaxed">
              We respect your right to be forgotten. You can delete your account and all associated typing history
              at any time directly from your dashboard settings or by invoking the user deletion API. Deleted accounts
              anonymize historical multiplayer leaderboard entries while removing all personally identifiable data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Free Access Guarantee</h2>
            <p className="text-xs text-muted leading-relaxed">
              Core typing practice, bilingual English/Khmer lessons, and real-time multiplayer racing will always
              remain free and open to all learners and typists.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
