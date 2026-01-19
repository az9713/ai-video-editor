'use client';

import { useState, useCallback } from 'react';

interface UseWaveformReturn {
  peaks: number[];
  isLoading: boolean;
  error: string | null;
  fetchWaveform: (videoId: string, filename: string) => Promise<void>;
}

export function useWaveform(): UseWaveformReturn {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWaveform = useCallback(async (videoId: string, filename: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract just the filename from the path
      const actualFilename = filename.split('/').pop() || filename;

      const response = await fetch('/api/waveform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, filename: actualFilename }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch waveform');
      }

      const data = await response.json();
      setPeaks(data.peaks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch waveform');
      setPeaks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    peaks,
    isLoading,
    error,
    fetchWaveform,
  };
}
