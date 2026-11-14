import { TypingTest } from '@/components/typing/TypingTest';
import { Keyboard, Trophy, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-12 max-w-6xl mx-auto w-full gap-12">
      {/* Hero Header */}
      <section className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated border border-border text-xs text-accent font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Free Practice — No Sign-up Required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Master Your Typing in <span className="text-primary">English</span> &amp;{' '}
          <span className="text-accent font-khmer">ភាសាខ្មែរ</span>
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed">
          Test your typing speed and accuracy with full Unicode and IME composition support. Instant
          results, zero distractions, designed for learners and competitive typists alike.
        </p>
      </section>

      {/* Main Interactive Typing Area */}
      <section id="test" className="w-full">
        <TypingTest initialLocale="en" initialDuration={30} initialDifficulty="BEGINNER" />
      </section>

      {/* Features Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 border-t border-border/60">
        <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Keyboard className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Khmer Unicode &amp; IME Safe</h3>
          <p className="text-sm text-muted leading-relaxed">
            Engineered specifically for Khmer script nuances — intermediate IME composition is never
            falsely penalized, ensuring accurate CPM tracking.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Verified Fair Leaderboards</h3>
          <p className="text-sm text-muted leading-relaxed">
            Server-side recomputation and anti-cheat validation ensure fair rankings and trusted
            personal best records.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-light/20 flex items-center justify-center text-primary-light">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Realtime Multiplayer</h3>
          <p className="text-sm text-muted leading-relaxed">
            Race live with friends in private rooms or public quick matches with server-authoritative
            countdown and finish line placement.
          </p>
        </div>
      </section>
    </div>
  );
}
