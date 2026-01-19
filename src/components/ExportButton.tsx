'use client';

import { useState, useCallback } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Clip } from '@/types/clip';

interface ExportButtonProps {
  clips: Clip[];
  videoFilename: string;
  disabled?: boolean;
}

export default function ExportButton({
  clips,
  videoFilename,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (clips.length === 0) return;

    console.log('Exporting clips:', clips);

    setIsExporting(true);
    setExportComplete(false);
    setError(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFilename,
          clips,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export failed');
      }

      const { downloadUrl } = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `exported_video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportComplete(true);

      // Reset complete state after 3 seconds
      setTimeout(() => setExportComplete(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [clips, videoFilename]);

  const isDisabled = disabled || isExporting || clips.length === 0;

  return (
    <div className="space-y-2">
      <button
        onClick={handleExport}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all w-full justify-center',
          exportComplete
            ? 'bg-green-600 text-white'
            : isDisabled
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Exporting...
          </>
        ) : exportComplete ? (
          <>
            <Check className="w-5 h-5" />
            Download Started!
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export Video
          </>
        )}
      </button>

      {clips.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} will be merged in order
        </p>
      )}

      {error && (
        <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
