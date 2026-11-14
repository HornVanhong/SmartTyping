'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { X, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [locale, setLocale] = useState<'en' | 'km'>('en');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } else {
      if (!displayName.trim()) {
        setError('Display name is required.');
        setIsSubmitting(false);
        return;
      }
      const res = await register(email, password, displayName, locale);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-muted hover:text-foreground hover:bg-elevated transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TypeMaster Account</span>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-foreground">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-muted">
            {mode === 'signin'
              ? 'Sign in to sync your stats, personal records, and achievements'
              : 'Save history, compete on leaderboards, and race in multiplayer'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-elevated border border-border text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-primary text-background font-semibold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-primary text-background font-semibold shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-lg bg-error/15 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-display-name" className="text-xs font-medium text-foreground">
                Display Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-muted" />
                <input
                  id="auth-display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. SpeedyFox"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-medium text-foreground">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-muted" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-xs font-medium text-foreground">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-muted" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-elevated border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Preferred Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    locale === 'en'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-elevated border-border text-muted hover:text-foreground'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('km')}
                  className={`py-2 text-xs font-semibold font-khmer rounded-lg border transition-colors ${
                    locale === 'km'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-elevated border-border text-muted hover:text-foreground'
                  }`}
                >
                  ភាសាខ្មែរ (Khmer)
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 rounded-xl bg-primary text-background font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In to TypeMaster'
              : 'Create Free Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
