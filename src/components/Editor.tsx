'use client';

import { useRef, useCallback, useEffect } from 'react';
import { RotateCcw, Scissors, Trash2 } from 'lucide-react';
import VideoUploader from './VideoUploader';
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer';
import Timeline from './Timeline';
import AIEditPanel from './AIEditPanel';
import ExportButton from './ExportButton';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useWaveform } from '@/hooks/useWaveform';
import { VideoMetadata, Clip } from '@/types/clip';
import { cn } from '@/lib/utils';

export default function Editor() {
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const {
    video,
    clips,
    selectedClipId,
    playheadTime,
    isPlaying,
    zoom,
    setVideo,
    setClips,
    setPlayheadTime,
    setIsPlaying,
    setSelectedClipId,
    setZoom,
    cutAtPlayhead,
    deleteSelectedClip,
    resetClips,
    totalDuration,
  } = useVideoEditor();

  const { peaks, fetchWaveform } = useWaveform();

  // Handle video upload complete
  const handleUploadComplete = useCallback((metadata: VideoMetadata) => {
    setVideo(metadata);

    // Fetch waveform data
    const filename = metadata.filepath.split('/').pop() || '';
    fetchWaveform(metadata.id, filename);
  }, [setVideo, fetchWaveform]);

  // Handle seek from timeline (time is timeline time, need to convert to source time)
  const handleSeek = useCallback((timelineTime: number) => {
    setPlayheadTime(timelineTime);

    // Convert timeline time to source time
    if (clips.length > 0) {
      const clip = clips.find(
        c => timelineTime >= c.timelineStart && timelineTime < c.timelineStart + c.duration
      );
      if (clip) {
        const offsetInClip = timelineTime - clip.timelineStart;
        const sourceTime = clip.sourceStart + offsetInClip;
        videoPlayerRef.current?.seekTo(sourceTime);
        return;
      }
    }
    // Fallback: seek directly (for when no clips or outside clip range)
    videoPlayerRef.current?.seekTo(timelineTime);
  }, [setPlayheadTime, clips]);

  // Handle time update from video player
  const handleTimeUpdate = useCallback((time: number) => {
    setPlayheadTime(time);
  }, [setPlayheadTime]);

  // Handle play state change
  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, [setIsPlaying]);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    videoPlayerRef.current?.togglePlayPause();
  }, []);

  // Handle AI-generated clips
  const handleClipsGenerated = useCallback((newClips: Clip[]) => {
    console.log('Editor received AI clips:', newClips);
    setClips(newClips);
    setPlayheadTime(0);
    videoPlayerRef.current?.seekTo(0);
  }, [setClips, setPlayheadTime]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCut: cutAtPlayhead,
    onDelete: deleteSelectedClip,
    onPlayPause: handlePlayPause,
    enabled: !!video,
  });

  // Map playhead time to actual video time based on clips
  useEffect(() => {
    if (!video || clips.length === 0) return;

    // Find which clip the playhead is in
    const clip = clips.find(
      c => playheadTime >= c.timelineStart && playheadTime < c.timelineStart + c.duration
    );

    if (clip) {
      // Calculate the actual source time
      const offsetInClip = playheadTime - clip.timelineStart;
      const sourceTime = clip.sourceStart + offsetInClip;

      // Only seek if we're not currently playing (to avoid jitter)
      if (!isPlaying) {
        const currentTime = videoPlayerRef.current?.getCurrentTime() || 0;
        if (Math.abs(currentTime - sourceTime) > 0.1) {
          videoPlayerRef.current?.seekTo(sourceTime);
        }
      }
    }
  }, [playheadTime, clips, video, isPlaying]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Video Editor
          </h1>
          {video && (
            <button
              onClick={() => setVideo(null)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              New Project
            </button>
          )}
        </header>

        {!video ? (
          // Upload state
          <div className="max-w-2xl mx-auto">
            <VideoUploader onUploadComplete={handleUploadComplete} />
          </div>
        ) : (
          // Editor state
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Video and Timeline */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video Player */}
              <VideoPlayer
                ref={videoPlayerRef}
                src={video.filepath}
                clips={clips}
                onTimeUpdate={handleTimeUpdate}
                onPlayStateChange={handlePlayStateChange}
              />

              {/* Timeline */}
              <Timeline
                clips={clips}
                duration={totalDuration}
                playheadTime={playheadTime}
                selectedClipId={selectedClipId}
                zoom={zoom}
                waveformPeaks={peaks}
                onSeek={handleSeek}
                onSelectClip={setSelectedClipId}
                onZoomChange={setZoom}
              />

              {/* Quick action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={cutAtPlayhead}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'bg-orange-600 hover:bg-orange-700 text-white'
                  )}
                >
                  <Scissors className="w-4 h-4" />
                  Cut (C)
                </button>

                <button
                  onClick={deleteSelectedClip}
                  disabled={!selectedClipId}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedClipId
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>

                <button
                  onClick={resetClips}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Right side - AI Edit and Export */}
            <div className="space-y-4">
              <AIEditPanel
                videoId={video.id}
                filename={video.filepath}
                onClipsGenerated={handleClipsGenerated}
              />

              <ExportButton
                clips={clips}
                videoFilename={video.filepath}
              />

              {/* Video Info */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Video Info</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {video.filename}</p>
                  <p><span className="text-gray-500">Duration:</span> {video.duration.toFixed(2)}s</p>
                  <p><span className="text-gray-500">Resolution:</span> {video.width}x{video.height}</p>
                  <p><span className="text-gray-500">FPS:</span> {video.fps}</p>
                  <p><span className="text-gray-500">Codec:</span> {video.codec}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
