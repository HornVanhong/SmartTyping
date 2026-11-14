import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthModal } from '../AuthModal';
import { AuthProvider } from '@/lib/auth/auth-context';

describe('AuthModal Component', () => {
  it('renders sign in fields by default', () => {
    const handleClose = vi.fn();
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={handleClose} initialMode="signin" />
      </AuthProvider>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to TypeMaster/i })).toBeInTheDocument();
  });

  it('switches to register mode with display name and language options', () => {
    const handleClose = vi.fn();
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={handleClose} initialMode="signin" />
      </AuthProvider>
    );

    const registerTab = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerTab);

    expect(screen.getByText('Create Your Free Account')).toBeInTheDocument();
    expect(screen.getByText('Display Name')).toBeInTheDocument();
    expect(screen.getByText('ភាសាខ្មែរ (Khmer)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Free Account/i })).toBeInTheDocument();
  });
});
