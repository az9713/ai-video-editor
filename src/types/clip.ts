export interface Clip {
  id: string;
  sourceStart: number; // Start time in the source video (seconds)
  sourceEnd: number;   // End time in the source video (seconds)
  timelineStart: number; // Position on the timeline (seconds)
  duration: number;    // Duration of the clip (seconds)
}

export interface VideoMetadata {
  id: string;
  filename: string;
  filepath: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}
