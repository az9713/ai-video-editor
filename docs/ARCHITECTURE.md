# AI Video Editor - Architecture Document

## Overview

This document explains the technical architecture of the AI Video Editor for developers who want to understand the system design before diving into the code.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         React Application                             │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │   Editor    │  │ VideoPlayer │  │  Timeline   │  │ AIEditPanel │ │  │
│  │  │ (Container) │  │             │  │             │  │             │ │  │
│  │  └──────┬──────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │         │                                                             │  │
│  │         │ uses                                                        │  │
│  │         ▼                                                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                        Custom Hooks                              │ │  │
│  │  │  useVideoEditor    useKeyboardShortcuts    useWaveform          │ │  │
│  │  │  (clip state)      (hotkeys)               (audio peaks)         │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                     │                                        │
│                                     │ HTTP (fetch)                           │
│                                     ▼                                        │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────────────┐
│                              SERVER (Node.js)                                │
│                                     │                                        │
│  ┌──────────────────────────────────┼───────────────────────────────────┐  │
│  │                         Next.js API Routes                            │  │
│  │                                                                        │  │
│  │   /api/upload      /api/waveform     /api/extract-audio              │  │
│  │   /api/transcribe  /api/ai-edit      /api/export                     │  │
│  │   /api/video/*                                                        │  │
│  └──────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│                                      │ subprocess                            │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        External Tools                                 │  │
│  │                                                                        │  │
│  │   FFMPEG              Whisper                Gemini API               │  │
│  │   (video processing)  (transcription)        (AI analysis)            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         File System                                   │  │
│  │                                                                        │  │
│  │   /uploads           /temp                   /exports                 │  │
│  │   (source videos)    (processing)            (output videos)          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App (page.tsx)
└── Editor
    ├── VideoUploader (shown when no video)
    │
    ├── VideoPlayer
    │   └── <video> element
    │       └── Custom controls overlay
    │
    ├── Timeline
    │   ├── Zoom controls
    │   ├── Time ruler
    │   ├── Waveform (SVG)
    │   ├── TimelineClip (for each clip)
    │   └── Playhead
    │
    ├── Action Buttons
    │   ├── Cut button
    │   ├── Delete button
    │   └── Reset button
    │
    ├── AIEditPanel
    │   ├── Transcribe button
    │   ├── Transcript display
    │   ├── Prompt input
    │   └── Generate button
    │
    ├── ExportButton
    │
    └── VideoInfo
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| Editor | Orchestrates all child components, manages state |
| VideoUploader | Handles file drag/drop and upload |
| VideoPlayer | Video playback with clip-aware seeking (skips deleted sections during playback) |
| Timeline | Visual clip representation, click-to-seek, zoom |
| TimelineClip | Individual clip display and selection |
| Playhead | Current time indicator, draggable |
| AIEditPanel | Transcription UI, AI prompt input |
| ExportButton | Export trigger and progress display |

---

## State Management

### Central State (useVideoEditor hook)

```typescript
interface EditorState {
  // Video metadata
  video: VideoMetadata | null;

  // Clip array (the core editing data)
  clips: Clip[];

  // UI state
  selectedClipId: string | null;
  playheadTime: number;
  isPlaying: boolean;
  zoom: number;
}
```

### State Flow

```
User Action → State Update → Re-render → UI Update
     ↑                                        │
     └────────────────────────────────────────┘
```

### Key State Operations

1. **setVideo(video)**: Initialize clips from video metadata
2. **cutAtPlayhead()**: Split clip at current playhead position
3. **deleteClip(id)**: Remove clip and snap remaining clips
4. **setPlayheadTime(time)**: Update current position
5. **resetClips()**: Restore original single clip

---

## Data Flow

### Upload Flow

```
User drops file
       │
       ▼
VideoUploader
       │
       ▼
POST /api/upload
       │
       ├── Save file to /uploads
       │
       ├── Run ffprobe for metadata
       │
       └── Return VideoMetadata
       │
       ▼
setVideo(metadata)
       │
       └── Creates initial Clip[0..duration]
```

### Cut Flow

```
User presses C
       │
       ▼
cutAtPlayhead()
       │
       ├── Find clip containing playhead
       │
       ├── Calculate cut point
       │
       └── Split into two clips:
           ├── Clip A: [start, cutPoint]
           └── Clip B: [cutPoint, end]
       │
       ▼
setClips([...before, clipA, clipB, ...after])
       │
       ▼
Timeline re-renders
```

### Delete Flow

```
User presses Delete
       │
       ▼
deleteClip(selectedId)
       │
       ├── Remove clip from array
       │
       └── Snap remaining clips:
           └── For each clip after deleted:
               timelineStart -= deletedDuration
       │
       ▼
setClips(snappedClips)
       │
       ▼
Timeline re-renders with no gap
```

### AI Edit Flow

```
User clicks Transcribe
       │
       ▼
POST /api/extract-audio
       │
       ├── FFMPEG extracts audio
       │
       └── Returns audio path
       │
       ▼
POST /api/transcribe
       │
       ├── Whisper processes audio
       │
       └── Returns Transcript{segments, text}
       │
       ▼
User enters prompt
       │
       ▼
POST /api/ai-edit
       │
       ├── Format transcript for Gemini
       │
       ├── Send to Gemini with function calling
       │
       └── Returns AIEditResult{clips[]}
       │
       ▼
Convert to Clip[] format
       │
       ▼
setClips(aiSelectedClips)
```

### Export Flow

```
User clicks Export
       │
       ▼
POST /api/export
       │
       ├── For each clip:
       │   └── FFMPEG cut: ffmpeg -ss start -t duration
       │
       ├── Create concat list file
       │
       ├── FFMPEG concat: ffmpeg -f concat
       │
       └── Return download URL
       │
       ▼
Browser downloads file
```

---

## API Routes

### Route Summary

| Route | Method | Input | Output | External Tool |
|-------|--------|-------|--------|---------------|
| `/api/upload` | POST | FormData (video file) | VideoMetadata | ffprobe |
| `/api/waveform` | POST | {videoId, filename} | {peaks: number[]} | ffmpeg |
| `/api/extract-audio` | POST | {videoId, filename} | {audioPath} | ffmpeg |
| `/api/transcribe` | POST | {audioPath, model} | Transcript | Whisper |
| `/api/ai-edit` | POST | {transcript, segments, prompt} | AIEditResult | Gemini |
| `/api/export` | POST | {videoFilename, clips} | {downloadUrl} | ffmpeg |
| `/api/video/[...path]` | GET | URL path | Video file stream | - |

### Error Handling Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const data = await request.json();
    if (!data.required_field) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      );
    }

    // Process
    const result = await processData(data);

    // Success response
    return NextResponse.json(result);

  } catch (error) {
    // Log for debugging
    console.error('API error:', error);

    // User-friendly error response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
```

---

## File System Structure

```
ai-video-editor/
├── uploads/              # Uploaded source videos
│   ├── {uuid}.mp4       # Renamed with UUID
│   └── ...
│
├── temp/                 # Temporary processing files
│   ├── {uuid}.mp3       # Extracted audio
│   ├── clip_0_{uuid}.mp4
│   ├── clip_1_{uuid}.mp4
│   └── concat_list.txt
│
└── exports/              # Final exported videos
    └── export_{uuid}.mp4
```

### File Lifecycle

1. **Upload**: File saved to `/uploads/{uuid}.{ext}`
2. **Process**: Temp files created in `/temp/`
3. **Export**: Final file saved to `/exports/`
4. **Cleanup**: Temp files deleted after export
5. **Download**: File served via `/api/video/exports/...`

---

## External Tool Integration

### FFMPEG Commands Used

```bash
# Get video metadata
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4

# Extract audio waveform (raw float samples)
ffmpeg -i input.mp4 -ac 1 -ar 8000 -f f32le -acodec pcm_f32le pipe:1

# Extract audio for transcription
ffmpeg -i input.mp4 -vn -ar 16000 -ac 1 output.mp3

# Cut a clip (with re-encoding for frame-accurate cuts)
ffmpeg -i input.mp4 -ss {start} -t {duration} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -y output.mp4

# Concatenate clips
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
```

### Whisper Command

```bash
whisper audio.mp3 --model small --output_format json --word_timestamps True
```

### Gemini API

Uses function calling with `select_clips` tool:
```typescript
{
  name: 'select_clips',
  parameters: {
    type: 'OBJECT',
    properties: {
      clips: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            start: { type: 'NUMBER' },
            end: { type: 'NUMBER' },
            reason: { type: 'STRING' }
          }
        }
      }
    }
  }
}
```

---

## Type Definitions

### Core Types

```typescript
// A video clip on the timeline
interface Clip {
  id: string;           // Unique identifier (UUID)
  sourceStart: number;  // Start time in source video (seconds)
  sourceEnd: number;    // End time in source video (seconds)
  timelineStart: number; // Position on timeline (seconds)
  duration: number;     // sourceEnd - sourceStart (seconds)
}

// Metadata about the uploaded video
interface VideoMetadata {
  id: string;
  filename: string;     // Original filename
  filepath: string;     // API path to access video
  duration: number;     // Total duration (seconds)
  width: number;        // Video width (pixels)
  height: number;       // Video height (pixels)
  fps: number;          // Frames per second
  codec: string;        // Video codec (e.g., "h264")
}

// Transcription segment
interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

// Full transcript
interface Transcript {
  segments: TranscriptSegment[];
  text: string;
  language: string;
}

// AI clip selection result
interface AIEditResult {
  clips: {
    start: number;
    end: number;
    reason: string;
  }[];
}
```

---

## Performance Considerations

### Client-Side

1. **Video loading**: Videos load via streaming, not full download
2. **Timeline rendering**: SVG waveform pre-computed on server
3. **Re-renders**: State changes trigger targeted re-renders
4. **Zoom performance**: Virtualization not implemented (potential improvement)

### Server-Side

1. **FFMPEG**: Re-encodes clips for frame-accurate cuts (slower but precise)
2. **Temp file cleanup**: Files deleted after export
3. **Waveform sampling**: Downsampled to 1000 peaks

### Bottlenecks

| Operation | Bottleneck | Potential Improvement |
|-----------|------------|----------------------|
| Upload | Network + disk I/O | Chunked upload |
| Transcription | Whisper processing | Background worker |
| AI Edit | Gemini API latency | Caching |
| Export | FFMPEG processing | Background worker + progress |

---

## Security Considerations

1. **File validation**: Type and size checked on upload
2. **Path traversal**: API only serves from allowed directories
3. **API key**: Stored in environment variable, not in code
4. **No auth**: Currently no user authentication (single-user local app)

---

## Future Architecture Considerations

### Potential Improvements

1. **Multi-track timeline**: Support multiple video/audio tracks
2. **Undo/Redo**: State history stack
3. **Background processing**: Worker queues for long operations
4. **Cloud storage**: S3/GCS integration for larger files
5. **Real-time collaboration**: WebSocket-based sync
6. **Waveform caching**: Pre-compute and store waveforms
7. **Progressive loading**: Load video sections on demand

### Scaling Considerations

For production deployment:
- Separate video processing service
- Message queue for async operations
- CDN for video serving
- Database for project persistence
