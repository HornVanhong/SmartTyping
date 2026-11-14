import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RaceTrack } from '../RaceTrack';
import { ParticipantResponse } from '@/lib/multiplayer/types';

describe('RaceTrack Component', () => {
  const mockParticipants: ParticipantResponse[] = [
    {
      id: 'p-1',
      userId: 'user-1',
      displayName: 'Sophea',
      avatarColor: '#7C8CFF',
      progressCharacters: 50,
      correctCharacters: 50,
      incorrectCharacters: 0,
      finishElapsedMs: null,
      finalCpm: null,
      finalWpm: null,
      placement: null,
      status: 'RACING',
    },
    {
      id: 'p-2',
      userId: 'user-2',
      displayName: 'Dara',
      avatarColor: '#F59E0B',
      progressCharacters: 100,
      correctCharacters: 100,
      incorrectCharacters: 0,
      finishElapsedMs: 30000,
      finalCpm: 200,
      finalWpm: 40,
      placement: 1,
      status: 'FINISHED',
    },
  ];

  it('renders all racers and highlights YOU and HOST', () => {
    render(
      <RaceTrack
        participants={mockParticipants}
        totalCharacters={100}
        currentUserId="user-1"
        hostUserId="user-1"
        locale="en"
      />
    );

    expect(screen.getByText('Sophea')).toBeInTheDocument();
    expect(screen.getByText('Dara')).toBeInTheDocument();
    expect(screen.getByText('YOU')).toBeInTheDocument();
    expect(screen.getByText('HOST')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('displays WPM and CPM for English locale', () => {
    render(
      <RaceTrack
        participants={mockParticipants}
        totalCharacters={100}
        currentUserId="user-1"
        hostUserId="user-2"
        locale="en"
      />
    );

    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('WPM')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('CPM')).toBeInTheDocument();
  });

  it('strictly adheres to Rule #5: displays CPM only and never labels as WPM for Khmer locale', () => {
    render(
      <RaceTrack
        participants={mockParticipants}
        totalCharacters={100}
        currentUserId="user-1"
        hostUserId="user-2"
        locale="km"
      />
    );

    // CPM should be displayed
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('CPM')).toBeInTheDocument();

    // WPM should NOT be displayed
    expect(screen.queryByText('WPM')).toBeNull();
  });
});
