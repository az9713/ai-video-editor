'use client';

import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Clip, VideoMetadata } from '@/types/clip';

export interface UseVideoEditorReturn {
  // State
  video: VideoMetadata | null;
  clips: Clip[];
  selectedClipId: string | null;
  playheadTime: number;
  isPlaying: boolean;
  zoom: number;

  // Actions
  setVideo: (video: VideoMetadata | null) => void;
  setClips: (clips: Clip[]) => void;
  setPlayheadTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedClipId: (id: string | null) => void;
  setZoom: (zoom: number) => void;

  // Editing operations
  cutAtPlayhead: () => void;
  deleteClip: (clipId: string) => void;
  deleteSelectedClip: () => void;
  resetClips: () => void;

  // Computed
  totalDuration: number;
  getClipAtTime: (time: number) => Clip | null;
}

export function useVideoEditor(): UseVideoEditorReturn {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Initialize clips when video is set
  const handleSetVideo = useCallback((newVideo: VideoMetadata | null) => {
    setVideo(newVideo);
    if (newVideo) {
      // Create initial clip spanning entire video
      const initialClip: Clip = {
        id: uuidv4(),
        sourceStart: 0,
        sourceEnd: newVideo.duration,
        timelineStart: 0,
        duration: newVideo.duration,
      };
      setClips([initialClip]);
      setPlayheadTime(0);
      setSelectedClipId(null);
    } else {
      setClips([]);
      setPlayheadTime(0);
      setSelectedClipId(null);
    }
  }, []);

  // Cut the clip at the current playhead position
  const cutAtPlayhead = useCallback(() => {
    if (clips.length === 0) return;

    // Find which clip contains the playhead
    const clipIndex = clips.findIndex(
      clip => playheadTime >= clip.timelineStart && playheadTime < clip.timelineStart + clip.duration
    );

    if (clipIndex === -1) return;

    const clip = clips[clipIndex];
    const cutPointInClip = playheadTime - clip.timelineStart;

    // Don't cut if at the very start or end of the clip
    if (cutPointInClip <= 0.1 || cutPointInClip >= clip.duration - 0.1) return;

    // Create two new clips from the cut
    const firstClip: Clip = {
      id: uuidv4(),
      sourceStart: clip.sourceStart,
      sourceEnd: clip.sourceStart + cutPointInClip,
      timelineStart: clip.timelineStart,
      duration: cutPointInClip,
    };

    const secondClip: Clip = {
      id: uuidv4(),
      sourceStart: clip.sourceStart + cutPointInClip,
      sourceEnd: clip.sourceEnd,
      timelineStart: clip.timelineStart + cutPointInClip,
      duration: clip.duration - cutPointInClip,
    };

    // Replace the original clip with the two new clips
    const newClips = [...clips];
    newClips.splice(clipIndex, 1, firstClip, secondClip);
    setClips(newClips);
  }, [clips, playheadTime]);

  // Delete a clip and snap remaining clips together
  const deleteClip = useCallback((clipId: string) => {
    const clipIndex = clips.findIndex(c => c.id === clipId);
    if (clipIndex === -1) return;

    const clipToDelete = clips[clipIndex];
    const deletedDuration = clipToDelete.duration;

    // Remove the clip
    const newClips = clips.filter(c => c.id !== clipId);

    // Snap remaining clips: shift all clips after the deleted one to the left
    const snappedClips = newClips.map(clip => {
      if (clip.timelineStart > clipToDelete.timelineStart) {
        return {
          ...clip,
          timelineStart: clip.timelineStart - deletedDuration,
        };
      }
      return clip;
    });

    setClips(snappedClips);

    // Clear selection if the selected clip was deleted
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }

    // Adjust playhead if it's beyond the new duration
    const newDuration = snappedClips.reduce((acc, c) => Math.max(acc, c.timelineStart + c.duration), 0);
    if (playheadTime > newDuration) {
      setPlayheadTime(Math.max(0, newDuration));
    }
  }, [clips, selectedClipId, playheadTime]);

  // Delete the currently selected clip
  const deleteSelectedClip = useCallback(() => {
    if (selectedClipId) {
      deleteClip(selectedClipId);
    }
  }, [selectedClipId, deleteClip]);

  // Reset to original single clip
  const resetClips = useCallback(() => {
    if (video) {
      const initialClip: Clip = {
        id: uuidv4(),
        sourceStart: 0,
        sourceEnd: video.duration,
        timelineStart: 0,
        duration: video.duration,
      };
      setClips([initialClip]);
      setPlayheadTime(0);
      setSelectedClipId(null);
    }
  }, [video]);

  // Get the clip at a specific time
  const getClipAtTime = useCallback((time: number): Clip | null => {
    return clips.find(
      clip => time >= clip.timelineStart && time < clip.timelineStart + clip.duration
    ) || null;
  }, [clips]);

  // Calculate total timeline duration
  const totalDuration = useMemo(() => {
    if (clips.length === 0) return video?.duration || 0;
    return clips.reduce((acc, clip) => Math.max(acc, clip.timelineStart + clip.duration), 0);
  }, [clips, video]);

  return {
    // State
    video,
    clips,
    selectedClipId,
    playheadTime,
    isPlaying,
    zoom,

    // Actions
    setVideo: handleSetVideo,
    setClips,
    setPlayheadTime,
    setIsPlaying,
    setSelectedClipId,
    setZoom,

    // Editing operations
    cutAtPlayhead,
    deleteClip,
    deleteSelectedClip,
    resetClips,

    // Computed
    totalDuration,
    getClipAtTime,
  };
}
