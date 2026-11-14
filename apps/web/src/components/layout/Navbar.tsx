'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, LogOut, LayoutDashboard, Keyboard, BookOpen, Trophy, Users, Shield } from 'lucide-react';
import { SoundToggle } from '@/components/common/SoundToggle';

export function Navbar() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const openAuth = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="border-b border-border bg-surface/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-background text-lg shadow-sm group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-foreground">TypeMaster</span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-elevated text-muted border border-border">
                Bilingual EN/KM
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-elevated/60"
            >
              <Keyboard className="w-4 h-4 text-primary" />
              <span>Play</span>
            </Link>

            <Link
              href="/practice"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-elevated/60"
            >
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Practice</span>
            </Link>

            <Link
              href="/multiplayer"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-elevated/60"
            >
              <Users className="w-4 h-4 text-accent-light" />
              <span>Multiplayer</span>
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-elevated/60"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-elevated/60"
            >
              <LayoutDashboard className="w-4 h-4 text-primary-light" />
              <span>Dashboard</span>
            </Link>

            <SoundToggle />

            <span className="text-border">|</span>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-elevated border border-border text-xs font-semibold text-foreground hover:border-primary/50 transition-colors"
                  data-testid="user-profile-btn"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.displayName}</span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border shadow-xl py-1 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border text-xs">
                      <div className="font-semibold text-foreground truncate">{user.displayName}</div>
                      <div className="text-muted truncate text-[11px]">{user.email}</div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-elevated transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                      <span>My Dashboard</span>
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-elevated transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-elevated transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth('signin')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-foreground hover:bg-elevated transition-colors"
                  data-testid="nav-signin-btn"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-background hover:bg-primary-hover transition-colors shadow-sm"
                  data-testid="nav-register-btn"
                >
                  Register
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
