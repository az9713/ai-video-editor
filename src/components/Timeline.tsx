'use client';

import { useRef, useCallback, useMemo } from 'react';
import { Clip } from '@/types/clip';
import TimelineClip from './TimelineClip';
import Playhead from './Playhead';
import { formatTime } from '@/lib/utils';

interface TimelineProps {
  clips: Clip[];
  duration: number;
  playheadTime: number;
  selectedClipId: string | null;
  zoom: number;
  waveformPeaks?: number[];
  onSeek: (time: number) => void;
  onSelectClip: (clipId: string | null) => void;
  onZoomChange: (zoom: number) => void;
}

const BASE_PIXELS_PER_SECOND = 50;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

export default function Timeline({
  clips,
  duration,
  playheadTime,
  selectedClipId,
  zoom,
  waveformPeaks,
  onSeek,
  onSelectClip,
  onZoomChange,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelsPerSecond = BASE_PIXELS_PER_SECOND * zoom;
  const timelineWidth = Math.max(duration * pixelsPerSecond, 800);

  // Generate time ruler marks
  const rulerMarks = useMemo(() => {
    const marks: { time: number; label: string; major: boolean }[] = [];
    const interval = zoom >= 2 ? 1 : zoom >= 1 ? 2 : zoom >= 0.5 ? 5 : 10;
    const minorInterval = interval / 2;

    for (let t = 0; t <= duration; t += minorInterval) {
      const isMajor = t % interval === 0;
      marks.push({
        time: t,
        label: formatTime(t),
        major: isMajor,
      });
    }
    return marks;
  }, [duration, zoom]);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, Math.min(x / pixelsPerSecond, duration));
      onSeek(time);
      onSelectClip(null);
    },
    [pixelsPerSecond, duration, onSeek, onSelectClip]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
        onZoomChange(newZoom);
      }
    },
    [zoom, onZoomChange]
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Zoom controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Zoom:</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-400 w-12">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="text-sm text-gray-400">
          <span className="text-white">{formatTime(playheadTime)}</span> / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline content */}
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-hidden"
        onWheel={handleWheel}
      >
        <div
          className="relative"
          style={{ width: `${timelineWidth}px`, minHeight: '120px' }}
          onClick={handleTimelineClick}
        >
          {/* Time ruler */}
          <div className="h-6 bg-gray-800 border-b border-gray-700 relative">
            {rulerMarks.map((mark, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${mark.time * pixelsPerSecond}px` }}
              >
                <div
                  className={`w-px ${mark.major ? 'h-4 bg-gray-500' : 'h-2 bg-gray-600'}`}
                />
                {mark.major && (
                  <span className="text-[10px] text-gray-500 mt-0.5">{mark.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Waveform */}
          {waveformPeaks && waveformPeaks.length > 0 && (
            <div className="absolute top-6 left-0 right-0 h-12 pointer-events-none opacity-30">
              <svg
                width={timelineWidth}
                height={48}
                className="absolute top-0 left-0"
              >
                {waveformPeaks.map((peak, i) => {
                  const x = (i / waveformPeaks.length) * timelineWidth;
                  const height = peak * 48;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={(48 - height) / 2}
                      width={Math.max(1, timelineWidth / waveformPeaks.length - 1)}
                      height={height}
                      fill="#60a5fa"
                    />
                  );
                })}
              </svg>
            </div>
          )}

          {/* Clips track */}
          <div className="relative h-16 mt-6">
            {clips.map((clip) => (
              <TimelineClip
                key={clip.id}
                clip={clip}
                isSelected={clip.id === selectedClipId}
                pixelsPerSecond={pixelsPerSecond}
                onClick={() => onSelectClip(clip.id)}
              />
            ))}
          </div>

          {/* Playhead */}
          <Playhead
            time={playheadTime}
            duration={duration}
            pixelsPerSecond={pixelsPerSecond}
            onSeek={onSeek}
            containerRef={containerRef}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
        <span className="mr-4">Click timeline to seek</span>
        <span className="mr-4">Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">C</kbd> to cut at playhead</span>
        <span className="mr-4">Select clip and press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Delete</kbd> to remove</span>
        <span>Ctrl+Scroll to zoom</span>
      </div>
    </div>
  );
}
