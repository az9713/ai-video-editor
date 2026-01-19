# AI Video Editor

A web-based video editor with AI-powered semantic editing capabilities. Cut, delete, and rearrange video clips manually, or let AI analyze your content and automatically select relevant segments based on natural language prompts.

---

## Features

- **Video Upload** - Drag-and-drop upload for MP4, MOV, and WebM files
- **Visual Timeline** - See your clips with audio waveform visualization
- **Manual Editing** - Cut at any point, delete clips, clips auto-snap together
- **AI Transcription** - Convert speech to text using Whisper
- **AI Editing** - Describe what you want to keep, Gemini selects matching clips
- **Export** - Download your edited video as a single MP4 file
- **Keyboard Shortcuts** - Fast editing with C (cut), Delete (remove), Space (play/pause)

---

## Quick Start

### Prerequisites

Before running the application, you need:

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **FFMPEG** - [Download](https://ffmpeg.org/download.html)
3. **Python 3.8+** - [Download](https://www.python.org/downloads/)
4. **Whisper** (for AI transcription):
   ```bash
   pip install openai-whisper
   ```
5. **Gemini API Key** (for AI editing) - [Get one free](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone or download the project
cd ai-video-editor

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Start the application
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Spacebar** | Play/Pause video |
| **C** | Cut at playhead position |
| **Delete** | Remove selected clip |

---

## How to Edit a Video

### Manual Editing

1. **Upload** - Drag your video onto the upload area
2. **Navigate** - Click on timeline or use video controls to position playhead
3. **Cut** - Press `C` to split the clip at the playhead
4. **Select** - Click a clip to select it (turns bright blue)
5. **Delete** - Press `Delete` to remove the selected clip
6. **Export** - Click "Export Video" to download your edit

### AI-Assisted Editing

1. **Upload** your video
2. **Transcribe** - Click "Start Transcription" and wait for processing
3. **Prompt** - Enter instructions like "Keep parts about cooking"
4. **Generate** - Click "Generate Clips" to let AI select segments
5. **Review** - Check the selected clips on the timeline
6. **Export** - Download your automatically edited video

---

## Documentation

| Document | Description |
|----------|-------------|
| [Quick Start Guide](docs/QUICK_START.md) | Get editing in 5 minutes |
| [User Guide](docs/USER_GUIDE.md) | Complete tutorial with 10 use cases |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Technical documentation for developers |
| [Architecture](docs/ARCHITECTURE.md) | System design and data flow |
| [API Reference](docs/API_REFERENCE.md) | Detailed API documentation |
| [CLAUDE.md](CLAUDE.md) | Quick reference for AI assistants |

---

## Project Structure

```
ai-video-editor/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── page.tsx            # Main editor page
│   │   └── api/                # Backend API endpoints
│   ├── components/             # React UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript definitions
├── uploads/                    # Uploaded videos
├── temp/                       # Processing files
├── exports/                    # Exported videos
└── docs/                       # Documentation
```

---

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **AI:** Google Gemini API (clip selection)
- **Transcription:** OpenAI Whisper (local)
- **Video Processing:** FFMPEG

---

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Video won't upload | Check format: MP4, MOV, or WebM only |
| Transcription fails | Verify Whisper is installed: `whisper --help` |
| AI editing fails | Check GEMINI_API_KEY in `.env.local` |
| Export fails | Verify FFMPEG is installed: `ffmpeg -version` |
| Waveform not showing | Check browser console for errors |

---

## System Requirements

- **OS:** Windows, macOS, or Linux
- **RAM:** 8GB minimum (16GB recommended for large videos)
- **Storage:** Sufficient space for video files (3x video size during processing)
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

---

## License

This project is provided as-is for educational purposes.

---

## Support

For issues or questions:
1. Check the [User Guide](docs/USER_GUIDE.md) troubleshooting section
2. Review the [Developer Guide](docs/DEVELOPER_GUIDE.md) for technical issues
3. Check browser console and terminal for error messages
