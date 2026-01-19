'use client';

import { cn } from '@/lib/utils';
import { Clip } from '@/types/clip';
import { formatTime } from '@/lib/utils';

interface TimelineClipProps {
  clip: Clip;
  isSelected: boolean;
  pixelsPerSecond: number;
  onClick: () => void;
}

export default function TimelineClip({
  clip,
  isSelected,
  pixelsPerSecond,
  onClick,
}: TimelineClipProps) {
  const width = clip.duration * pixelsPerSecond;
  const left = clip.timelineStart * pixelsPerSecond;

  return (
    <div
      className={cn(
        'absolute top-0 h-full rounded cursor-pointer transition-all border-2',
        'flex items-center justify-center overflow-hidden',
        isSelected
          ? 'bg-blue-600/80 border-blue-400'
          : 'bg-indigo-600/60 border-indigo-400/50 hover:bg-indigo-600/80'
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        minWidth: '20px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="px-2 text-xs text-white truncate">
        {formatTime(clip.duration)}
      </div>

      {/* Left edge indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30" />

      {/* Right edge indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30" />
    </div>
  );
}
