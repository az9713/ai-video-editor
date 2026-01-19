'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onCut?: () => void;
  onDelete?: () => void;
  onPlayPause?: () => void;
  onUndo?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onCut,
  onDelete,
  onPlayPause,
  onUndo,
  enabled = true,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // C - Cut at playhead
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      onCut?.();
    }

    // Delete or Backspace - Delete selected clip
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete?.();
    }

    // Space - Play/Pause
    if (e.key === ' ') {
      e.preventDefault();
      onPlayPause?.();
    }

    // Ctrl/Cmd + Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      onUndo?.();
    }
  }, [onCut, onDelete, onPlayPause, onUndo]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
