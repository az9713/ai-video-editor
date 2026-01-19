'use client';

import { useCallback, useRef, useState } from 'react';

interface PlayheadProps {
  time: number;
  duration: number;
  pixelsPerSecond: number;
  onSeek: (time: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Playhead({
  time,
  duration,
  pixelsPerSecond,
  onSeek,
  containerRef,
}: PlayheadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const playheadRef = useRef<HTMLDivElement>(null);

  const position = time * pixelsPerSecond;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      const newTime = Math.max(0, Math.min(x / pixelsPerSecond, duration));
      onSeek(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [containerRef, duration, pixelsPerSecond, onSeek]);

  return (
    <div
      ref={playheadRef}
      className="absolute top-0 bottom-0 z-20 cursor-ew-resize group"
      style={{ left: `${position}px`, transform: 'translateX(-50%)' }}
      onMouseDown={handleMouseDown}
    >
      {/* Playhead line */}
      <div className={`w-0.5 h-full ${isDragging ? 'bg-red-500' : 'bg-red-500'}`} />

      {/* Playhead handle at top */}
      <div
        className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${
          isDragging ? 'bg-red-600 scale-125' : 'bg-red-500 group-hover:scale-110'
        } transition-transform`}
      />
    </div>
  );
}
