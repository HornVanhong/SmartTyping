import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TypingTest } from '../TypingTest';

describe('TypingTest Component', () => {
  it('renders initial English configuration and metrics', () => {
    render(<TypingTest initialLocale="en" initialDuration={30} initialDifficulty="BEGINNER" />);

    expect(screen.getByTestId('typing-test-container')).toBeInTheDocument();
    expect(screen.getByTestId('locale-en-btn')).toBeInTheDocument();
    expect(screen.getByTestId('locale-km-btn')).toBeInTheDocument();
    expect(screen.getByTestId('metric-wpm')).toBeInTheDocument();
    expect(screen.getByTestId('metric-cpm')).toBeInTheDocument();
    expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('30s');
  });

  it('switches to Khmer locale and hides English WPM label', async () => {
    render(<TypingTest initialLocale="en" initialDuration={30} initialDifficulty="BEGINNER" />);

    const khmerBtn = screen.getByTestId('locale-km-btn');
    fireEvent.click(khmerBtn);

    // In Khmer mode, English WPM should NOT be shown
    expect(screen.queryByTestId('metric-wpm')).not.toBeInTheDocument();
    expect(screen.getByTestId('metric-cpm')).toBeInTheDocument();
    expect(screen.getByText(/ល្បឿន \(CPM\)/i)).toBeInTheDocument();
  });

  it('switches duration when duration button is clicked', () => {
    render(<TypingTest initialLocale="en" initialDuration={30} initialDifficulty="BEGINNER" />);

    const dur60Btn = screen.getByTestId('duration-60-btn');
    fireEvent.click(dur60Btn);

    expect(screen.getByTestId('remaining-seconds')).toHaveTextContent('60s');
  });
});
