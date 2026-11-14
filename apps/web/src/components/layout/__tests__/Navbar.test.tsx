import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from '../Navbar';
import { AuthProvider } from '@/lib/auth/auth-context';

describe('Navbar Component', () => {
  it('renders TypeMaster brand, links, and guest auth buttons', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    expect(screen.getByText('TypeMaster')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-signin-btn')).toBeInTheDocument();
    expect(screen.getByTestId('nav-register-btn')).toBeInTheDocument();
  });
});
