# AI Video Editor - Quick Start Guide

Get editing in 5 minutes! This guide assumes you've already installed the application.

---

## Start the Application

```bash
cd ai-video-editor
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 5-Minute Editing Tutorial

### 1. Upload Your Video
- Drag and drop your video onto the upload area
- Or click to browse your files

### 2. Make a Cut
- Play the video or click on the timeline to position the playhead
- Press **C** to cut at that position

### 3. Delete Unwanted Parts
- Click a clip to select it (it turns bright blue)
- Press **Delete** to remove it
- Clips automatically snap together

### 4. Export
- Click the blue **Export Video** button
- Wait for processing
- File downloads automatically

**That's it! You've edited your first video!**

---

## Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Spacebar** | Play/Pause |
| **C** | Cut at playhead |
| **Delete** | Remove selected clip |

---

## Using AI Editing

1. **Click "Start Transcription"** - Wait for speech-to-text
2. **Enter instructions** - Like "Keep parts about cooking"
3. **Click "Generate Clips"** - AI selects relevant segments
4. **Export** - Download your edited video

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Video won't upload | Check format: MP4, MOV, or WebM only |
| Transcription fails | Install Whisper: `pip install openai-whisper` |
| AI editing fails | Check Gemini API key in `.env.local` |
| Export fails | Make sure FFMPEG is installed |

---

## Need More Help?

- **User Guide:** `docs/USER_GUIDE.md` - Full tutorial with 10 use cases
- **Developer Guide:** `docs/DEVELOPER_GUIDE.md` - Technical documentation

---

Happy editing!
