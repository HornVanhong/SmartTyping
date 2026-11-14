'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredLocale: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string,
    preferredLocale?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (update: {
    displayName?: string;
    preferredLocale?: string;
    avatarColor?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = { Accept: 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include',
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('access_token');
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          localStorage.setItem('access_token', data.accessToken);
        }
        setUser(data.user);
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.detail || 'Invalid email or password.' };
      }
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      preferredLocale: string = 'en'
    ) => {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, displayName, preferredLocale }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            localStorage.setItem('access_token', data.accessToken);
          }
          setUser(data.user);
          return { success: true };
        } else {
          const err = await res.json().catch(() => ({}));
          const detail =
            err.fieldErrors && err.fieldErrors.length > 0
              ? err.fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(', ')
              : err.detail || 'Registration failed.';
          return { success: false, error: detail };
        }
      } catch {
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } catch {
      // Proceed with client logout
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (update: { displayName?: string; preferredLocale?: string; avatarColor?: string }) => {
      try {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/users/me`, {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify(update),
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return { success: true };
        } else {
          const err = await res.json().catch(() => ({}));
          return { success: false, error: err.detail || 'Failed to update profile.' };
        }
      } catch {
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
