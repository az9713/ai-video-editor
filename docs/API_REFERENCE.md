# AI Video Editor - API Reference

This document provides detailed information about all API endpoints in the AI Video Editor.

---

## Base URL

All API endpoints are relative to the application root:
- Development: `http://localhost:3000`
- Production: Your deployed URL

---

## Endpoints Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload a video file |
| `/api/waveform` | POST | Generate audio waveform |
| `/api/extract-audio` | POST | Extract audio from video |
| `/api/transcribe` | POST | Transcribe audio to text |
| `/api/ai-edit` | POST | AI-based clip selection |
| `/api/export` | POST | Export edited video |
| `/api/video/[...path]` | GET | Serve video files |

---

## POST /api/upload

Upload a video file and extract its metadata.

### Request

**Content-Type:** `multipart/form-data`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| video | File | Yes | Video file (MP4, MOV, or WebM) |

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('video', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "video=@/path/to/video.mp4"
```

### Response

**Success (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "my_video.mp4",
  "filepath": "/api/video/uploads/550e8400-e29b-41d4-a716-446655440000.mp4",
  "duration": 120.5,
  "width": 1920,
  "height": 1080,
  "fps": 29.97,
  "codec": "h264"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "No video file provided"
}
```

```json
{
  "error": "Invalid file type. Please upload MP4, MOV, or WebM files."
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "ffprobe failed: [error details]"
}
```

### Notes

- Maximum file size: 500 MB
- File is saved to `uploads/` directory with UUID filename
- Original filename is preserved in response

---

## POST /api/waveform

Generate audio waveform data for visualization.

### Request

**Content-Type:** `application/json`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| videoId | string | Yes | UUID from upload response |
| filename | string | Yes | Filename in uploads directory |

**Example:**
```javascript
const response = await fetch('/api/waveform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: '550e8400-e29b-41d4-a716-446655440000',
    filename: '550e8400-e29b-41d4-a716-446655440000.mp4'
  })
});
```

### Response

**Success (200 OK):**
```json
{
  "peaks": [0.1, 0.3, 0.5, 0.7, 0.4, 0.2, ...]
}
```

The `peaks` array contains normalized amplitude values (0.0 to 1.0) representing audio levels across the video duration. Typically contains ~1000 values.

**Error (400 Bad Request):**
```json
{
  "error": "Missing videoId or filename"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "ffmpeg waveform extraction failed: [error details]"
}
```

---

## POST /api/extract-audio

Extract audio track from video for transcription.

### Request

**Content-Type:** `application/json`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| videoId | string | Yes | UUID from upload response |
| filename | string | Yes | Video filename or path |

**Example:**
```javascript
const response = await fetch('/api/extract-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: '550e8400-e29b-41d4-a716-446655440000',
    filename: '/api/video/uploads/550e8400-e29b-41d4-a716-446655440000.mp4'
  })
});
```

### Response

**Success (200 OK):**
```json
{
  "audioId": "660e8400-e29b-41d4-a716-446655440001",
  "audioPath": "/api/video/temp/660e8400-e29b-41d4-a716-446655440001.mp3",
  "localPath": "/path/to/project/temp/660e8400-e29b-41d4-a716-446655440001.mp3"
}
```

- `audioId`: Unique ID for the extracted audio
- `audioPath`: URL to access the audio file
- `localPath`: Filesystem path (used by transcribe endpoint)

**Error (400 Bad Request):**
```json
{
  "error": "Missing videoId or filename"
}
```

---

## POST /api/transcribe

Convert speech in audio to text with timestamps.

### Request

**Content-Type:** `application/json`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audioPath | string | Yes | Local filesystem path to audio file |
| model | string | No | Whisper model (default: "small") |

**Available Models:**
- `tiny` - Fastest, lowest accuracy
- `base` - Fast, low accuracy
- `small` - Balanced (recommended)
- `medium` - Slower, better accuracy
- `large` - Slowest, best accuracy

**Example:**
```javascript
const response = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioPath: '/path/to/project/temp/audio.mp3',
    model: 'small'
  })
});
```

### Response

**Success (200 OK):**
```json
{
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 3.5,
      "text": "Hello and welcome to today's video."
    },
    {
      "id": 1,
      "start": 3.5,
      "end": 7.2,
      "text": "We're going to learn about video editing."
    }
  ],
  "text": "Hello and welcome to today's video. We're going to learn about video editing.",
  "language": "en"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing audioPath"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Whisper not found. Please install it with: pip install openai-whisper"
}
```

### Notes

- First run downloads model files (can take several minutes)
- Processing time depends on audio length and model size
- English has best accuracy; other languages may vary

---

## POST /api/ai-edit

Use AI to select clips based on transcript content.

### Request

**Content-Type:** `application/json`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transcript | string | Yes | Full transcript text |
| segments | array | Yes | Array of transcript segments |
| prompt | string | Yes | User instructions for clip selection |

**Segment Structure:**
```json
{
  "start": 0.0,
  "end": 3.5,
  "text": "Hello and welcome"
}
```

**Example:**
```javascript
const response = await fetch('/api/ai-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: "Full transcript text here...",
    segments: [
      { start: 0, end: 5, text: "Introduction" },
      { start: 5, end: 15, text: "Main content about cooking" },
      { start: 15, end: 20, text: "Tangent about weather" },
      { start: 20, end: 30, text: "More cooking tips" }
    ],
    prompt: "Keep only the parts about cooking"
  })
});
```

### Response

**Success (200 OK):**
```json
{
  "clips": [
    {
      "start": 5.0,
      "end": 15.0,
      "reason": "Main content discussing cooking techniques"
    },
    {
      "start": 20.0,
      "end": 30.0,
      "reason": "Additional cooking tips and recommendations"
    }
  ]
}
```

**Empty result (no matching clips):**
```json
{
  "clips": []
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing transcript, segments, or prompt"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "GEMINI_API_KEY not configured"
}
```

### Notes

- Requires `GEMINI_API_KEY` environment variable
- Uses Gemini 2.0 Flash model with function calling
- Clip timestamps correspond to source video times

---

## POST /api/export

Export edited video by cutting and merging clips.

### Request

**Content-Type:** `application/json`

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| videoFilename | string | Yes | Source video filename or path |
| clips | array | Yes | Array of Clip objects |

**Clip Structure:**
```json
{
  "id": "unique-id",
  "sourceStart": 10.0,
  "sourceEnd": 25.0,
  "timelineStart": 0,
  "duration": 15.0
}
```

**Example:**
```javascript
const response = await fetch('/api/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoFilename: '/api/video/uploads/550e8400-e29b-41d4-a716-446655440000.mp4',
    clips: [
      {
        id: 'clip1',
        sourceStart: 0,
        sourceEnd: 30,
        timelineStart: 0,
        duration: 30
      },
      {
        id: 'clip2',
        sourceStart: 60,
        sourceEnd: 90,
        timelineStart: 30,
        duration: 30
      }
    ]
  })
});
```

### Response

**Success (200 OK):**
```json
{
  "exportId": "770e8400-e29b-41d4-a716-446655440002",
  "filename": "export_770e8400-e29b-41d4-a716-446655440002.mp4",
  "downloadUrl": "/api/video/exports/export_770e8400-e29b-41d4-a716-446655440002.mp4"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing videoFilename or clips"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Source video not found"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Clip cutting failed: [ffmpeg error]"
}
```

### Notes

- Clips are cut using stream copy (no re-encoding)
- Temporary clip files are cleaned up after export
- Download the file using the `downloadUrl`

---

## GET /api/video/[...path]

Serve video and audio files with streaming support.

### Request

**URL Parameters:**
- `path`: Array of path segments (e.g., `uploads`, `filename.mp4`)

**Supported Paths:**
- `/api/video/uploads/{filename}` - Uploaded source videos
- `/api/video/temp/{filename}` - Temporary processing files
- `/api/video/exports/{filename}` - Exported videos

**Example:**
```javascript
// In HTML
<video src="/api/video/uploads/550e8400-e29b-41d4-a716-446655440000.mp4" />

// Fetch
const response = await fetch('/api/video/exports/export_770e8400.mp4');
const blob = await response.blob();
```

### Response

**Success (200 OK):**
- Returns the file content
- Content-Type based on file extension:
  - `.mp4` → `video/mp4`
  - `.mov` → `video/quicktime`
  - `.webm` → `video/webm`
  - `.mp3` → `audio/mpeg`

**Partial Content (206):**
For range requests (video seeking):
- Returns requested byte range
- Headers include `Content-Range`, `Accept-Ranges`

**Error (403 Forbidden):**
```json
{
  "error": "Forbidden"
}
```
(Returned when trying to access non-allowed directories)

**Error (404 Not Found):**
```json
{
  "error": "Not found"
}
```

### Notes

- Supports HTTP Range requests for video streaming
- Only serves from `uploads`, `temp`, and `exports` directories
- Security: Prevents path traversal attacks

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request processed successfully |
| 206 | Partial Content | Range request for video streaming |
| 400 | Bad Request | Missing required fields, invalid input |
| 403 | Forbidden | Trying to access restricted path |
| 404 | Not Found | File doesn't exist |
| 500 | Internal Server Error | Server-side processing failed |

---

## TypeScript Type Definitions

For TypeScript projects, here are the request/response types:

```typescript
// Upload
interface UploadResponse {
  id: string;
  filename: string;
  filepath: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}

// Waveform
interface WaveformRequest {
  videoId: string;
  filename: string;
}

interface WaveformResponse {
  peaks: number[];
}

// Extract Audio
interface ExtractAudioRequest {
  videoId: string;
  filename: string;
}

interface ExtractAudioResponse {
  audioId: string;
  audioPath: string;
  localPath: string;
}

// Transcribe
interface TranscribeRequest {
  audioPath: string;
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
}

interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

interface TranscribeResponse {
  segments: TranscriptSegment[];
  text: string;
  language: string;
}

// AI Edit
interface AIEditRequest {
  transcript: string;
  segments: { start: number; end: number; text: string }[];
  prompt: string;
}

interface AIEditResponse {
  clips: {
    start: number;
    end: number;
    reason: string;
  }[];
}

// Export
interface Clip {
  id: string;
  sourceStart: number;
  sourceEnd: number;
  timelineStart: number;
  duration: number;
}

interface ExportRequest {
  videoFilename: string;
  clips: Clip[];
}

interface ExportResponse {
  exportId: string;
  filename: string;
  downloadUrl: string;
}

// Error
interface ErrorResponse {
  error: string;
}
```

---

## Example: Complete Workflow

Here's how to use all APIs together for a complete editing workflow:

```javascript
// 1. Upload video
const uploadFormData = new FormData();
uploadFormData.append('video', file);
const uploadRes = await fetch('/api/upload', {
  method: 'POST',
  body: uploadFormData
});
const video = await uploadRes.json();
console.log('Uploaded:', video.id);

// 2. Get waveform (optional, for visualization)
const waveformRes = await fetch('/api/waveform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: video.id,
    filename: video.filepath.split('/').pop()
  })
});
const { peaks } = await waveformRes.json();
console.log('Waveform peaks:', peaks.length);

// 3. Extract audio for transcription
const extractRes = await fetch('/api/extract-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoId: video.id,
    filename: video.filepath
  })
});
const { localPath } = await extractRes.json();
console.log('Audio extracted');

// 4. Transcribe
const transcribeRes = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioPath: localPath,
    model: 'small'
  })
});
const transcript = await transcribeRes.json();
console.log('Transcribed:', transcript.segments.length, 'segments');

// 5. AI clip selection
const aiEditRes = await fetch('/api/ai-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: transcript.text,
    segments: transcript.segments,
    prompt: 'Keep only the important parts'
  })
});
const aiResult = await aiEditRes.json();
console.log('AI selected:', aiResult.clips.length, 'clips');

// 6. Convert AI result to export format
let timelineStart = 0;
const clips = aiResult.clips.map((c, i) => {
  const clip = {
    id: `clip-${i}`,
    sourceStart: c.start,
    sourceEnd: c.end,
    timelineStart: timelineStart,
    duration: c.end - c.start
  };
  timelineStart += clip.duration;
  return clip;
});

// 7. Export
const exportRes = await fetch('/api/export', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoFilename: video.filepath,
    clips: clips
  })
});
const exportResult = await exportRes.json();
console.log('Exported:', exportResult.downloadUrl);

// 8. Download
window.location.href = exportResult.downloadUrl;
```
