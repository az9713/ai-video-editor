# AI Video Editor - User Guide

## Table of Contents

1. [Welcome](#welcome)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Quick Start Guide](#quick-start-guide)
5. [Understanding the Interface](#understanding-the-interface)
6. [Basic Editing Operations](#basic-editing-operations)
7. [AI-Powered Editing](#ai-powered-editing)
8. [Exporting Your Video](#exporting-your-video)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Tutorial: 10 Use Cases](#tutorial-10-use-cases)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Welcome

Welcome to the AI Video Editor! This application helps you edit videos quickly using both traditional cutting tools and artificial intelligence. Whether you want to trim a video, remove unwanted sections, or automatically find the most relevant parts of your footage, this editor has you covered.

### What Can You Do With This Editor?

- **Upload videos** in common formats (MP4, MOV, WebM)
- **Cut videos** at precise points
- **Delete sections** you don't want
- **Use AI** to automatically find and select relevant clips based on what's being said
- **Export** your edited video as a new file

### No Video Editing Experience Required

This guide assumes you've never edited a video before. We'll walk you through everything step by step.

---

## System Requirements

Before using this application, make sure your computer meets these requirements:

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| Operating System | Windows 10, macOS 10.15, or Linux (Ubuntu 20.04) |
| RAM | 4 GB |
| Storage | 2 GB free space (plus space for your videos) |
| Internet | Required for AI features |
| Browser | Chrome, Firefox, Safari, or Edge (latest version) |

### Recommended for Better Performance

| Component | Recommendation |
|-----------|----------------|
| RAM | 8 GB or more |
| CPU | 4 cores or more |
| Storage | SSD (for faster processing) |

### Supported Video Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| MP4 | .mp4 | Most common format, recommended |
| QuickTime | .mov | Common on Mac |
| WebM | .webm | Web-optimized format |

### Video Size Limits

- **Maximum file size:** 500 MB
- **Recommended:** Under 100 MB for best performance
- **Longer videos** (1+ hours) will take longer to process

---

## Installation

Follow these steps to get the AI Video Editor running on your computer.

### Step 1: Download Required Software

You need to install some programs before the editor will work. Don't worry if these names sound unfamiliar—just follow the steps below.

#### 1.1 Install Node.js

Node.js runs the application on your computer.

**Windows:**
1. Go to https://nodejs.org/
2. Click the big green "LTS" button to download
3. Open the downloaded file and click "Next" through the installer
4. When finished, restart your computer

**Mac:**
1. Go to https://nodejs.org/
2. Click the "LTS" button
3. Open the downloaded `.pkg` file
4. Follow the installer instructions

**To verify it installed correctly:**
1. Open Command Prompt (Windows) or Terminal (Mac)
2. Type `node --version` and press Enter
3. You should see a version number like `v20.10.0`

#### 1.2 Install FFMPEG

FFMPEG processes your video files.

**Windows:**
1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download "ffmpeg-release-essentials.zip"
3. Create a folder called `ffmpeg` in your C: drive
4. Extract the ZIP contents into `C:\ffmpeg`
5. Add FFMPEG to your system PATH:
   - Press the Windows key, type "environment variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables..."
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add `C:\ffmpeg\bin`
   - Click "OK" on all windows
6. Restart your computer

**Mac:**
1. Open Terminal
2. If you don't have Homebrew, install it by pasting this and pressing Enter:
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Then install FFMPEG:
   ```
   brew install ffmpeg
   ```

**To verify:** Open a new command prompt/terminal and type `ffmpeg -version`

#### 1.3 Install Python and Whisper (Optional - for AI transcription)

If you want to use the AI transcription feature, you need Python and Whisper.

**Windows:**
1. Go to https://www.python.org/downloads/
2. Download the latest Python 3.x version
3. Run the installer
4. **IMPORTANT:** Check the box "Add Python to PATH"
5. Click "Install Now"
6. After installation, open Command Prompt and type:
   ```
   pip install openai-whisper
   ```

**Mac:**
1. Python usually comes pre-installed
2. Open Terminal and type:
   ```
   pip3 install openai-whisper
   ```

### Step 2: Get a Gemini API Key (Optional - for AI editing)

If you want to use the AI editing feature, you need a free API key from Google.

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (it looks like a long string of letters and numbers)
5. Keep this key safe—you'll need it in the next step

### Step 3: Set Up the Application

1. Open Command Prompt (Windows) or Terminal (Mac)
2. Navigate to where you have the project files:
   ```
   cd path/to/ai-video-editor
   ```
3. Install the application dependencies:
   ```
   npm install
   ```
   (This may take a few minutes)

4. Configure your API key:
   - Find the file `.env.local` in the project folder
   - Open it with Notepad (Windows) or TextEdit (Mac)
   - Replace `your_gemini_api_key_here` with your actual API key
   - Save the file

### Step 4: Start the Application

1. In your command prompt/terminal, type:
   ```
   npm run dev
   ```
2. Wait until you see "Ready in..." message
3. Open your web browser
4. Go to http://localhost:3000
5. You should see the AI Video Editor!

**To stop the application:** Press Ctrl+C in the command prompt/terminal.

---

## Quick Start Guide

Here's how to edit your first video in under 5 minutes!

### 1. Upload Your Video

1. Open the application (http://localhost:3000)
2. You'll see a large box that says "Drag and drop a video"
3. Either:
   - **Drag** a video file from your computer onto this box, OR
   - **Click** the box to open a file browser and select your video

4. Wait for the upload to complete (you'll see a loading spinner)

### 2. Cut Out a Section

1. After upload, you'll see your video and a timeline below it
2. **Play** the video using the play button
3. **Pause** when you reach the part you want to remove
4. Look at the timeline—your position is shown by a red line (the playhead)
5. Press the **C** key on your keyboard to make a cut
6. Move to where you want the removal to end
7. Press **C** again to make another cut
8. **Click** on the middle section (the part to remove) to select it
9. Press the **Delete** key to remove it
10. The remaining clips will automatically snap together!

### 3. Export Your Edited Video

1. Click the blue **"Export Video"** button on the right side
2. Wait for processing (this may take a moment)
3. Your browser will automatically download the edited video
4. Find the file in your Downloads folder and play it!

**Congratulations!** You've just edited your first video!

---

## Understanding the Interface

Let's explore each part of the editor:

```
┌────────────────────────────────────────────────────────────────────┐
│  AI Video Editor                              [New Project]        │
├───────────────────────────────────────┬────────────────────────────┤
│                                       │                            │
│  ┌─────────────────────────────────┐ │  ┌────────────────────────┐│
│  │                                 │ │  │    AI Edit             ││
│  │        VIDEO PLAYER             │ │  │                        ││
│  │                                 │ │  │  [Start Transcription] ││
│  │                                 │ │  │                        ││
│  │  ▶ ─────────────── 🔊 ⛶        │ │  │  Enter instructions... ││
│  └─────────────────────────────────┘ │  │                        ││
│                                       │  │  [Generate Clips]      ││
│  ┌─────────────────────────────────┐ │  └────────────────────────┘│
│  │ Zoom: ─●───── 100%   0:30/2:00  │ │                            │
│  ├─────────────────────────────────┤ │  ┌────────────────────────┐│
│  │ |.....|.....|.....|.....|.....| │ │  │   Export Video         ││
│  │ ▓▓▓▓▓▓▓▓▓█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │  │   2 clips to merge     ││
│  │           ↑                     │ │  └────────────────────────┘│
│  │       PLAYHEAD                  │ │                            │
│  └─────────────────────────────────┘ │  ┌────────────────────────┐│
│                                       │  │   Video Info           ││
│  [Cut (C)] [Delete Selected] [Reset]  │  │   Duration: 2:00       ││
│                                       │  │   Resolution: 1920x1080││
└───────────────────────────────────────┴────────────────────────────┘
```

### Video Player (Top Left)

The large area where your video plays.

- **Play/Pause Button (▶/⏸):** Start or stop playback
- **Progress Bar:** Click anywhere to jump to that time
- **Volume Control (🔊):** Adjust or mute sound
- **Fullscreen Button (⛶):** Make video fill your screen

### Timeline (Below Video)

Shows your video as clips on a timeline.

- **Time Ruler:** Shows seconds/minutes across the top
- **Clips:** Colored blocks representing video sections
- **Waveform:** Light blue pattern showing audio levels
- **Playhead:** Red vertical line showing current position
- **Zoom Slider:** Make the timeline bigger or smaller

### Quick Action Buttons

- **Cut (C):** Split the clip at the current position
- **Delete Selected:** Remove the currently selected clip
- **Reset:** Undo all edits and restore original video

### AI Edit Panel (Top Right)

Use artificial intelligence to find specific content.

- **Start Transcription:** Convert speech to text
- **Instructions Box:** Tell the AI what to keep
- **Generate Clips:** Let AI select relevant parts

### Export Button (Right Side)

Save your edited video.

- Shows how many clips will be merged
- Click to process and download

### Video Info (Bottom Right)

Shows details about your uploaded video:
- Filename
- Duration
- Resolution
- Frame rate
- Codec

---

## Basic Editing Operations

### Cutting a Video

"Cutting" means splitting one clip into two clips at a specific point.

**Using the Keyboard (Recommended):**
1. Play or scrub to the desired position
2. Press the **C** key

**Using the Button:**
1. Position the playhead where you want to cut
2. Click the **"Cut (C)"** button

**Tips:**
- You can't cut at the very start or end of a clip
- Cuts must be at least 0.1 seconds apart
- The playhead shows exactly where the cut will happen

### Selecting a Clip

Before you can delete a clip, you need to select it.

**To Select:**
- Click on any clip in the timeline

**When Selected:**
- The clip turns brighter blue
- A border appears around it

**To Deselect:**
- Click on an empty area of the timeline

### Deleting a Clip

Remove unwanted sections from your video.

**Using the Keyboard:**
1. Click to select the clip you want to remove
2. Press the **Delete** key (or Backspace)

**Using the Button:**
1. Select the clip
2. Click **"Delete Selected"**

**What Happens:**
- The selected clip is removed
- Remaining clips automatically move to fill the gap
- The timeline adjusts to the new shorter duration

### Resetting All Edits

Start over with the original video.

1. Click the **"Reset"** button
2. All cuts are undone
3. You're back to the original single clip

### Navigating the Timeline

**Click to Seek:**
- Click anywhere on the timeline to jump to that time

**Drag the Playhead:**
- Click and drag the red playhead line

**Zoom In/Out:**
- Use the zoom slider at the top of the timeline
- Hold Ctrl and scroll your mouse wheel

**Scroll the Timeline:**
- If zoomed in, scroll horizontally to see more

### Playing and Pausing

**Keyboard:**
- Press **Spacebar** to toggle play/pause

**Mouse:**
- Click the play/pause button in the video player
- Click directly on the video

---

## AI-Powered Editing

The AI features help you automatically find and keep relevant parts of your video based on what's being said.

### Step 1: Transcribe the Video

Before AI can help, it needs to know what's being said in your video.

1. In the **AI Edit** panel, click **"Start Transcription"**
2. Wait for processing (this can take several minutes for long videos)
3. You'll see the text appear with timestamps

**Example Output:**
```
[0:00 - 0:05] Hello everyone, welcome to today's video
[0:05 - 0:12] We're going to talk about cooking pasta
[0:12 - 0:20] First, let's start by boiling some water
```

**Tips:**
- The first transcription may take extra time as Whisper downloads the model
- Clear audio produces better results
- English works best; other languages may have lower accuracy

### Step 2: Enter Your Instructions

Tell the AI what content you want to keep.

**Examples of Good Instructions:**
- "Keep only the parts about cooking techniques"
- "Find all mentions of the company name"
- "Keep the introduction and conclusion"
- "Remove all the off-topic tangents"
- "Keep segments where they discuss pricing"

**Tips for Better Results:**
- Be specific about what you want
- Use keywords that appear in the transcript
- Don't ask for things that aren't in the video

### Step 3: Generate Clips

1. After entering instructions, click **"Generate Clips"**
2. The AI analyzes the transcript
3. It returns a list of time ranges that match your request
4. Your timeline automatically updates with the selected clips

**Understanding the Results:**
```
AI Selected 3 clips:
[0:12 - 0:45] Introduction to pasta cooking
[1:30 - 2:15] How to cook al dente
[3:00 - 3:30] Final plating tips
```

### Refining Your Selection

Not happy with the AI's choices? You can:

1. **Manually adjust:** Use cut and delete to fine-tune
2. **Try again:** Enter different instructions and click "Generate Clips"
3. **Reset:** Click "Reset" to start over

---

## Exporting Your Video

When you're happy with your edits, export the final video.

### How to Export

1. Review your clips in the timeline
2. Make sure they're in the order you want
3. Click the blue **"Export Video"** button
4. Wait for processing (you'll see a loading indicator)
5. The download will start automatically

### What Happens During Export

1. **Cutting:** Each clip is extracted from the original video
2. **Merging:** All clips are combined into one file
3. **Saving:** The final file is saved to the exports folder
4. **Downloading:** Your browser downloads the file

### Export Time Estimates

| Video Length | Clips | Approximate Time |
|--------------|-------|------------------|
| 1 minute | 2 | 5-10 seconds |
| 5 minutes | 5 | 30-60 seconds |
| 30 minutes | 10 | 2-5 minutes |
| 1 hour+ | 20+ | 10+ minutes |

### Finding Your Exported File

- Check your browser's Downloads folder
- The file is named `exported_video_[timestamp].mp4`
- You can rename it after downloading

### Tips for Best Results

- Shorter clips export faster
- Fewer clips means faster processing
- Original video quality is preserved

---

## Keyboard Shortcuts

Master these shortcuts to edit faster!

| Key | Action |
|-----|--------|
| **Spacebar** | Play / Pause video |
| **C** | Cut at current playhead position |
| **Delete** or **Backspace** | Delete selected clip |
| **Left Arrow** | Move playhead back slightly |
| **Right Arrow** | Move playhead forward slightly |
| **Ctrl + Scroll** | Zoom timeline in/out |

### Shortcut Tips

- Shortcuts only work when you're not typing in a text field
- The most used shortcut is **C** for cutting
- Combine with mouse clicks for fastest editing

---

## Tutorial: 10 Use Cases

Here are 10 practical exercises to help you learn the editor. Each one builds on skills from the previous ones.

### Use Case 1: Remove the Beginning (Trim Start)

**Scenario:** Your video has 10 seconds of blank space at the start that you want to remove.

**Steps:**
1. Upload your video
2. Press **Spacebar** to play
3. When the real content starts (around 10 seconds), pause
4. Press **C** to cut
5. Click on the first clip (the blank part)
6. Press **Delete**
7. Export!

**What You Learned:** Basic cutting and deleting at the start.

---

### Use Case 2: Remove the End (Trim End)

**Scenario:** You want to remove everything after the 2-minute mark.

**Steps:**
1. Upload your video
2. Move the playhead to exactly 2:00 (click on the timeline or drag)
3. Press **C** to cut
4. Click on the second clip (everything after 2:00)
5. Press **Delete**
6. Export!

**What You Learned:** Trimming from the end of a video.

---

### Use Case 3: Remove a Middle Section

**Scenario:** There's a mistake between 1:00 and 1:30 that you want to remove.

**Steps:**
1. Upload your video
2. Move playhead to 1:00
3. Press **C** to cut
4. Move playhead to 1:30
5. Press **C** to cut again
6. Click on the middle clip (1:00-1:30)
7. Press **Delete**
8. The remaining clips snap together!
9. Export

**What You Learned:** Removing a specific section from the middle.

---

### Use Case 4: Keep Only One Section

**Scenario:** You only want to keep the content between 2:00 and 3:00.

**Steps:**
1. Upload your video
2. Cut at 2:00 (move there, press **C**)
3. Cut at 3:00 (move there, press **C**)
4. You now have three clips
5. Delete the first clip (before 2:00)
6. Delete the last clip (after 3:00)
7. Only the middle section remains
8. Export

**What You Learned:** Isolating a specific segment.

---

### Use Case 5: Remove Multiple Mistakes

**Scenario:** There are three "um" moments at 0:30, 1:45, and 3:00 that you want to remove.

**Steps:**
1. Upload your video
2. Find the first "um" at 0:30
3. Cut slightly before and after it
4. Delete that tiny clip
5. Repeat for 1:45 and 3:00
6. Export

**Tip:** Work backwards (start with 3:00) so your time references don't change as you delete!

**What You Learned:** Making multiple precise cuts.

---

### Use Case 6: AI Transcription

**Scenario:** You have a lecture video and want to see all the text.

**Steps:**
1. Upload your video
2. Click **"Start Transcription"**
3. Wait for processing
4. Read through the transcript
5. Use it to find specific topics

**What You Learned:** Converting speech to searchable text.

---

### Use Case 7: AI Clip Selection - Keep a Topic

**Scenario:** You have a 10-minute cooking video but only want the parts about "sauce."

**Steps:**
1. Upload your video
2. Click **"Start Transcription"**
3. In the instructions box, type: "Keep only the parts where they discuss sauce or mention sauce"
4. Click **"Generate Clips"**
5. Review the selected clips
6. Export

**What You Learned:** Using AI to find content by topic.

---

### Use Case 8: AI Clip Selection - Remove Tangents

**Scenario:** Your podcast recording has off-topic discussions you want to remove.

**Steps:**
1. Upload your video
2. Transcribe it
3. Type instructions: "Keep only the parts directly related to the main topic. Remove any off-topic tangents or casual conversation."
4. Generate clips
5. Review and adjust if needed
6. Export

**What You Learned:** Using AI to filter out unwanted content.

---

### Use Case 9: Create a Highlight Reel

**Scenario:** You have a long gameplay video and want to create a 2-minute highlights video.

**Steps:**
1. Upload your video
2. Transcribe if there's commentary
3. Type instructions: "Select the most exciting moments, funny comments, or impressive gameplay segments. Total should be about 2 minutes."
4. Generate clips
5. Review and delete any clips that aren't exciting enough
6. Export

**What You Learned:** Using AI for creative content curation.

---

### Use Case 10: Combine Manual and AI Editing

**Scenario:** You want AI to find relevant parts, then manually fine-tune the results.

**Steps:**
1. Upload your video
2. Transcribe it
3. Use AI to generate an initial selection: "Keep parts about product features"
4. Review the clips
5. Use **C** to trim clips that have extra content at the start/end
6. Delete any clips that aren't actually relevant
7. Make any final adjustments
8. Export

**What You Learned:** Combining AI assistance with manual precision.

---

## Troubleshooting

### Video Won't Upload

**Symptoms:**
- Error message appears
- Upload gets stuck
- Nothing happens when you drop a file

**Solutions:**
1. Check file format (must be MP4, MOV, or WebM)
2. Check file size (must be under 500 MB)
3. Try a different video file
4. Refresh the page and try again

### Video Won't Play

**Symptoms:**
- Black screen
- Audio but no video
- Video freezes

**Solutions:**
1. Try a different browser (Chrome recommended)
2. Make sure the file isn't corrupted (try playing in VLC)
3. Re-upload the video

### Transcription Fails

**Symptoms:**
- Error message about Whisper
- "Whisper not found"

**Solutions:**
1. Make sure Python is installed
2. Install Whisper: `pip install openai-whisper`
3. Restart the application

### AI Edit Doesn't Work

**Symptoms:**
- "GEMINI_API_KEY not configured"
- AI returns no clips

**Solutions:**
1. Get an API key from Google
2. Add it to `.env.local` file
3. Restart the application
4. Try clearer instructions

### Export Fails

**Symptoms:**
- Error during export
- Download never starts

**Solutions:**
1. Make sure FFMPEG is installed
2. Check you have free disk space
3. Try with fewer clips
4. Try a shorter video

### Application Won't Start

**Symptoms:**
- Error when running `npm run dev`
- Port 3000 already in use

**Solutions:**
1. Run `npm install` again
2. Try a different port: `npm run dev -- -p 3001`
3. Close other applications using port 3000
4. Restart your computer

---

## FAQ

### General Questions

**Q: Is my video uploaded to the internet?**
A: No! All processing happens on your computer. Your videos never leave your machine.

**Q: What video formats work best?**
A: MP4 files with H.264 codec work best. Most phone and camera recordings use this format.

**Q: Can I edit audio files?**
A: Not directly. This editor is designed for video. For audio, consider using a tool like Audacity.

**Q: Is there an undo feature?**
A: Currently, you can click "Reset" to undo all changes. Individual undo/redo is a planned feature.

**Q: How long can my video be?**
A: There's no hard limit, but videos over 30 minutes may be slow to process. For best results, keep videos under 10 minutes.

### AI Features

**Q: How accurate is the transcription?**
A: Whisper is quite accurate for clear English audio. Accuracy decreases with:
- Background noise
- Multiple speakers talking simultaneously
- Strong accents
- Non-English languages

**Q: Does AI editing require internet?**
A: Yes, the AI clip selection uses Google's Gemini API, which requires internet. Transcription (Whisper) runs locally.

**Q: How do I get better AI results?**
A:
- Use specific keywords that appear in the transcript
- Be clear about what to keep vs. remove
- Try different phrasings if results aren't good

### Technical Questions

**Q: Why is transcription so slow?**
A: The first time you transcribe, Whisper downloads a model (about 1 GB). Subsequent transcriptions are faster.

**Q: Can I edit 4K videos?**
A: Yes, but they'll take longer to process. Consider downscaling very large files first.

**Q: Why does export take so long?**
A: FFMPEG needs to:
1. Cut each clip from the original video
2. Merge all clips together
This is computationally intensive, especially for long videos.

**Q: Where are my exported videos saved?**
A: They're saved in the `exports/` folder in the project directory, then your browser downloads them.

---

## Tips for Best Results

1. **Start with shorter videos** while learning
2. **Save often** - export after significant edits
3. **Use keyboard shortcuts** for faster editing
4. **Transcribe first** to find content by searching the text
5. **Be specific** with AI instructions
6. **Work in order** - edit beginning to end
7. **Preview before exporting** - play through your clips
8. **Keep original files** - never delete your source video

---

## Getting Help

If this guide doesn't solve your problem:

1. Check the terminal/command prompt for error messages
2. Try restarting the application
3. Make sure all prerequisites are installed
4. Try with a different video file

---

Thank you for using AI Video Editor! Happy editing!
