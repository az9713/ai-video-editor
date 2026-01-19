export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface Transcript {
  segments: TranscriptSegment[];
  text: string;
  language: string;
}

export interface AIEditResult {
  clips: {
    start: number;
    end: number;
    reason: string;
  }[];
}
