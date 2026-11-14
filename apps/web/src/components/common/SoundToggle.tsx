'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/sound/sound-effects';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(soundManager.isEnabled());
  }, []);

  const handleToggle = () => {
    const next = soundManager.toggle();
    setEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-1.5 rounded-lg border transition-colors ${
        enabled
          ? 'bg-primary/15 text-primary border-primary/30'
          : 'bg-elevated/60 text-muted border-border hover:text-foreground'
      }`}
      aria-label={enabled ? 'Mute sound effects' : 'Enable mechanical typing sounds'}
      title={enabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)'}
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
