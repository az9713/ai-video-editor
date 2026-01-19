# AI Video Editor - Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Project Architecture](#project-architecture)
5. [Understanding the Codebase](#understanding-the-codebase)
6. [Core Technologies Explained](#core-technologies-explained)
7. [Step-by-Step Development Workflow](#step-by-step-development-workflow)
8. [Adding New Features](#adding-new-features)
9. [Debugging Guide](#debugging-guide)
10. [Testing Guide](#testing-guide)
11. [Deployment Guide](#deployment-guide)
12. [Glossary](#glossary)

---

## Introduction

### What is This Project?

This is a web-based video editor that runs in your browser. It allows users to:
- Upload videos and see them on a timeline
- Cut videos at specific points
- Delete unwanted sections
- Use AI to automatically find and select relevant parts
- Export the edited video

### Who is This Guide For?

This guide is for developers who:
- Have programming experience (C, C++, Java, Python, etc.)
- Are new to web development
- Want to understand how this project works
- Want to add new features or fix bugs

### What Will You Learn?

By the end of this guide, you will understand:
- How web applications work (frontend vs backend)
- How React and Next.js structure code
- How this specific video editor works
- How to make changes and add features

---

## Prerequisites

### Required Software

Before you can work on this project, you need to install several tools. Here's exactly what you need and how to get each one:

#### 1. Node.js (JavaScript Runtime)

**What is it?** Node.js lets you run JavaScript code outside of a web browser. It's required for running the development server and building the application.

**Installation Steps:**

**Windows:**
1. Go to https://nodejs.org/
2. Download the "LTS" (Long Term Support) version
3. Run the installer
4. Accept all defaults
5. Verify installation by opening Command Prompt and typing:
   ```bash
   node --version
   ```
   You should see something like `v20.x.x`

**macOS:**
```bash
# If you have Homebrew installed:
brew install node

# Or download from https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Git (Version Control)

**What is it?** Git tracks changes to your code and lets you collaborate with others.

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Accept all defaults (the default options are fine)
4. Verify: Open Git Bash and type `git --version`

**macOS:**
```bash
# Git comes with Xcode Command Line Tools
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install git
```

#### 3. FFMPEG (Video Processing)

**What is it?** FFMPEG is a command-line tool that can read, write, and manipulate video files. Our application uses it to cut and merge video clips.

**Windows:**
1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download "ffmpeg-release-essentials.zip"
3. Extract the ZIP file to `C:\ffmpeg`
4. Add to PATH:
   - Press Windows + X, click "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path", click "Edit"
   - Click "New", add `C:\ffmpeg\bin`
   - Click OK on all dialogs
5. Open a NEW Command Prompt and verify:
   ```bash
   ffmpeg -version
   ```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

#### 4. Python (For Whisper Transcription)

**What is it?** Python is needed to run OpenAI's Whisper, which converts speech in videos to text.

**Windows:**
1. Go to https://www.python.org/downloads/
2. Download Python 3.10 or newer
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Verify:
   ```bash
   python --version
   ```

**macOS/Linux:**
Python usually comes pre-installed. Verify with:
```bash
python3 --version
```

#### 5. OpenAI Whisper

**What is it?** Whisper is an AI model that converts speech to text. We use it locally (it runs on your computer, not in the cloud).

**Installation (all platforms):**
```bash
pip install openai-whisper
```

**Verify installation:**
```bash
whisper --help
```

**Note:** The first time you use Whisper, it will download model files (about 1GB for the "small" model). This is normal.

#### 6. A Code Editor

**Recommended:** Visual Studio Code (VS Code)
1. Download from https://code.visualstudio.com/
2. Install these extensions (click the Extensions icon in the sidebar):
   - "ESLint" - helps find code errors
   - "Tailwind CSS IntelliSense" - helps with styling
   - "Prettier" - formats your code nicely

#### 7. Gemini API Key

**What is it?** This is a password-like string that lets your application use Google's Gemini AI.

**How to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with a Google account
3. Click "Create API Key"
4. Copy the key (it looks like `AIza...`)
5. Save it somewhere safe - you'll need it during setup

---

## Environment Setup

Now that you have all the prerequisites, let's set up the project.

### Step 1: Get the Code

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and navigate to where you want the project:

```bash
# Create a folder for your projects (if you don't have one)
mkdir ~/projects
cd ~/projects

# If you're cloning from a repository:
git clone <repository-url>
cd ai-video-editor

# Or if you already have the code, just navigate to it:
cd /path/to/ai-video-editor
```

### Step 2: Install Dependencies

**What are dependencies?** They are pre-written code packages that our project uses. Instead of writing everything from scratch, we use libraries that others have created.

```bash
# This reads package.json and installs all required packages
npm install
```

This will take a minute or two. You'll see a `node_modules` folder appear - this contains all the downloaded packages.

**Troubleshooting:**
- If you see permission errors on Mac/Linux, try `sudo npm install`
- If you see network errors, check your internet connection
- If a specific package fails, try `npm install` again

### Step 3: Configure Environment Variables

**What are environment variables?** They are configuration values that your application reads at runtime. We use them for secrets like API keys.

1. In the project root, find the file `.env.local` (or create it):
   ```bash
   # On Windows (in Command Prompt):
   notepad .env.local

   # On Mac/Linux:
   nano .env.local
   ```

2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Save the file

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore` to prevent this.

### Step 4: Verify Setup

Run the development server:

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
```

Open your web browser and go to http://localhost:3000

You should see the AI Video Editor interface with a drag-and-drop upload area.

**To stop the server:** Press Ctrl+C in the terminal.

---

## Project Architecture

### The Big Picture

This application has two main parts:

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  (What the user sees and interacts with)                    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Video     │  │  Timeline   │  │  AI Panel   │         │
│  │   Player    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  React Components (written in TypeScript/JSX)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP Requests
                    (fetch API)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
│  (Runs on your computer, handles heavy processing)          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Upload    │  │  Transcribe │  │   Export    │         │
│  │   API       │  │   API       │  │   API       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  Next.js API Routes (written in TypeScript)                 │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   FFMPEG    │  │   Whisper   │  │   Gemini    │         │
│  │  (videos)   │  │   (audio)   │  │    (AI)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  External Tools (run as subprocesses)                       │
└─────────────────────────────────────────────────────────────┘
```

### Frontend vs Backend

**Frontend (Client-Side):**
- Runs in the user's web browser
- Handles the user interface (buttons, video player, timeline)
- Sends requests to the backend when it needs data
- Location in code: `src/components/`, `src/hooks/`

**Backend (Server-Side):**
- Runs on the server (your computer during development)
- Handles file uploads, video processing, AI calls
- Returns data to the frontend
- Location in code: `src/app/api/`

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # The main page (http://localhost:3000/)
│   ├── layout.tsx         # Wrapper around all pages
│   ├── globals.css        # Global CSS styles
│   └── api/               # Backend API routes
│       ├── upload/        # /api/upload endpoint
│       │   └── route.ts   # Handles POST requests
│       ├── waveform/      # /api/waveform endpoint
│       ├── extract-audio/ # /api/extract-audio endpoint
│       ├── transcribe/    # /api/transcribe endpoint
│       ├── ai-edit/       # /api/ai-edit endpoint
│       ├── export/        # /api/export endpoint
│       └── video/         # /api/video/[...path] endpoint
│
├── components/            # React UI components
│   ├── Editor.tsx        # Main container, brings everything together
│   ├── VideoUploader.tsx # Drag-and-drop upload zone
│   ├── VideoPlayer.tsx   # Video playback with controls
│   ├── Timeline.tsx      # Timeline visualization
│   ├── TimelineClip.tsx  # Individual clip on timeline
│   ├── Playhead.tsx      # The red line showing current time
│   ├── AIEditPanel.tsx   # Transcription and AI editing UI
│   └── ExportButton.tsx  # Export button with progress
│
├── hooks/                 # Custom React hooks (reusable logic)
│   ├── useVideoEditor.ts # Main state management
│   ├── useKeyboardShortcuts.ts
│   └── useWaveform.ts
│
├── lib/                   # Utility functions
│   ├── ffmpeg.ts         # FFMPEG command wrappers
│   ├── whisper.ts        # Whisper command wrapper
│   ├── gemini.ts         # Gemini API client
│   └── utils.ts          # Helper functions
│
└── types/                 # TypeScript type definitions
    ├── clip.ts           # Clip and VideoMetadata types
    └── transcript.ts     # Transcript types
```

---

## Understanding the Codebase

### How React Components Work

React components are like building blocks. Each component is a function that returns what should be displayed.

**Example - A Simple Component:**

```tsx
// This is a React component
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Using it:
<Greeting name="Developer" />
// Renders: <h1>Hello, Developer!</h1>
```

**Our Components:**

1. **Editor.tsx** - The boss component
   - Contains all other components
   - Manages the overall application state
   - Coordinates between video player, timeline, and AI panel

2. **VideoPlayer.tsx** - Plays the video
   - Wraps the HTML5 `<video>` element
   - Provides custom controls (play, pause, volume)
   - Exposes methods like `seekTo(time)` to other components

3. **Timeline.tsx** - Shows the clips
   - Displays a visual representation of the video
   - Shows clip blocks that can be selected
   - Includes the waveform visualization

4. **AIEditPanel.tsx** - AI features
   - Transcription button and status
   - Text input for AI prompts
   - Displays AI-selected clips

### How State Works

**What is State?** State is data that can change over time. When state changes, React automatically updates the UI.

```tsx
// Simple state example
const [count, setCount] = useState(0);

// count = 0 initially
// setCount(1) changes it to 1
// The UI automatically updates to show 1
```

**Our Main State (in useVideoEditor.ts):**

```tsx
// Video being edited
const [video, setVideo] = useState<VideoMetadata | null>(null);

// Array of clips on the timeline
const [clips, setClips] = useState<Clip[]>([]);

// Which clip is currently selected
const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

// Current playhead position in seconds
const [playheadTime, setPlayheadTime] = useState(0);

// Is the video currently playing?
const [isPlaying, setIsPlaying] = useState(false);

// Timeline zoom level
const [zoom, setZoom] = useState(1);
```

### How API Routes Work

API routes handle requests from the frontend. They're like functions that respond to HTTP requests.

**Example - Upload API Route:**

```tsx
// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';

// This function runs when someone sends a POST request to /api/upload
export async function POST(request: NextRequest) {
  // 1. Get the uploaded file from the request
  const formData = await request.formData();
  const file = formData.get('video');

  // 2. Save the file to disk
  // ... (file saving code)

  // 3. Get video information using FFMPEG
  const videoInfo = await getVideoInfo(filepath);

  // 4. Send back the result
  return NextResponse.json({
    id: 'abc123',
    duration: 60.5,
    width: 1920,
    height: 1080
  });
}
```

**How Frontend Calls API:**

```tsx
// In a React component
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData  // Contains the video file
});

const data = await response.json();
console.log(data.duration);  // 60.5
```

### Understanding TypeScript

TypeScript is JavaScript with types. Types help catch errors before your code runs.

**Example:**

```tsx
// Without types (JavaScript)
function add(a, b) {
  return a + b;
}
add("hello", 5);  // "hello5" - probably not what you wanted!

// With types (TypeScript)
function add(a: number, b: number): number {
  return a + b;
}
add("hello", 5);  // ERROR! TypeScript catches this before running
```

**Our Type Definitions (src/types/clip.ts):**

```tsx
// This defines what a "Clip" looks like
export interface Clip {
  id: string;           // Every clip has a unique ID
  sourceStart: number;  // Where in the original video this clip starts
  sourceEnd: number;    // Where in the original video this clip ends
  timelineStart: number; // Where on the timeline this clip appears
  duration: number;     // How long the clip is
}

// Now TypeScript will check that all Clip objects have these properties
const myClip: Clip = {
  id: "clip1",
  sourceStart: 10,
  sourceEnd: 20,
  timelineStart: 0,
  duration: 10
};
```

---

## Core Technologies Explained

### Next.js

**What is it?** A framework built on top of React that adds:
- Server-side rendering (faster page loads)
- API routes (backend in the same project)
- File-based routing (files become URLs)

**File-based routing example:**
- `src/app/page.tsx` → `http://localhost:3000/`
- `src/app/about/page.tsx` → `http://localhost:3000/about`
- `src/app/api/upload/route.ts` → `http://localhost:3000/api/upload`

### React

**What is it?** A library for building user interfaces using components.

**Key concepts:**

1. **Components** - Reusable UI building blocks
2. **Props** - Data passed from parent to child components
3. **State** - Data that changes over time
4. **Hooks** - Functions that let you use React features

**Common Hooks:**
```tsx
// useState - for storing changing data
const [value, setValue] = useState(initialValue);

// useEffect - for side effects (like fetching data)
useEffect(() => {
  // This runs after the component renders
  fetchData();
}, [dependency]); // Re-runs when dependency changes

// useRef - for accessing DOM elements
const videoRef = useRef<HTMLVideoElement>(null);
// Later: videoRef.current.play()

// useCallback - for creating stable function references
const handleClick = useCallback(() => {
  // This function won't be recreated on every render
}, [dependencies]);
```

### Tailwind CSS

**What is it?** A CSS framework that provides utility classes for styling.

**Instead of writing CSS:**
```css
.button {
  background-color: blue;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

**You write classes directly:**
```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

**Common Tailwind classes:**
- `bg-{color}-{shade}` - Background color (e.g., `bg-blue-500`)
- `text-{color}` - Text color (e.g., `text-white`)
- `p-{size}` - Padding (e.g., `p-4` = 16px)
- `m-{size}` - Margin
- `flex` - Display flex
- `grid` - Display grid
- `rounded-{size}` - Border radius
- `hover:` - Styles on hover (e.g., `hover:bg-blue-600`)

### FFMPEG

**What is it?** A command-line tool for video/audio processing.

**How we use it (in src/lib/ffmpeg.ts):**

```tsx
import { spawn } from 'child_process';

// Get video information
export async function getVideoInfo(filepath: string) {
  return new Promise((resolve, reject) => {
    // This runs: ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filepath
    ]);

    // Collect the output
    let stdout = '';
    ffprobe.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // When the command finishes
    ffprobe.on('close', (code) => {
      const data = JSON.parse(stdout);
      resolve({
        duration: data.format.duration,
        width: data.streams[0].width,
        height: data.streams[0].height
      });
    });
  });
}
```

### Whisper

**What is it?** OpenAI's speech-to-text model that runs locally.

**How we use it:**
```tsx
// We run whisper as a command-line process
const whisper = spawn('whisper', [
  audioPath,           // Input audio file
  '--model', 'small',  // Use the "small" model
  '--output_format', 'json',  // Output as JSON
  '--word_timestamps', 'True' // Include timing for each word
]);
```

### Gemini API

**What is it?** Google's AI model that we use for understanding transcripts and selecting clips.

**How we use it (in src/lib/gemini.ts):**

```tsx
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  tools: [{ functionDeclarations: [selectClipsFunction] }]
});

// Send the transcript and get back clip selections
const result = await model.generateContent(prompt);
```

---

## Step-by-Step Development Workflow

### Making Your First Change

Let's walk through adding a simple feature: changing the button color.

**Step 1: Start the Development Server**
```bash
cd ai-video-editor
npm run dev
```

**Step 2: Open the Project in VS Code**
```bash
code .
```

**Step 3: Find the File to Edit**

Let's change the "Cut" button color from orange to green.

1. Open `src/components/Editor.tsx`
2. Find the Cut button (use Ctrl+F to search for "Cut (C)")
3. You'll see something like:
   ```tsx
   className="... bg-orange-600 hover:bg-orange-700 ..."
   ```

**Step 4: Make the Change**

Change `orange` to `green`:
```tsx
className="... bg-green-600 hover:bg-green-700 ..."
```

**Step 5: See the Result**

Save the file. Next.js automatically refreshes the browser, and you'll see the green button.

**Step 6: Verify It Works**

1. Upload a video
2. Click the green Cut button (or press C)
3. Verify the cut functionality still works

### The Development Cycle

1. **Make a change** to a file
2. **Save** the file
3. **Check the browser** - it auto-refreshes
4. **Check the terminal** - for server errors
5. **Check browser console** - for client errors (F12 in browser)
6. **Test the feature** - make sure it works
7. **Commit your changes** - save to Git

### Using Git

```bash
# See what files you changed
git status

# See the actual changes
git diff

# Stage changes for commit
git add src/components/Editor.tsx

# Commit with a message
git commit -m "Change Cut button color from orange to green"

# Push to remote repository (if you have one)
git push
```

---

## Adding New Features

### Example 1: Adding a New Button

Let's add a "Mute Video" button.

**Step 1: Plan**
- Where should the button go? (Editor.tsx, next to other buttons)
- What should it do? (Toggle video mute)
- What state do we need? (isMuted boolean)

**Step 2: Add State**

In `src/components/Editor.tsx`, add state for muting:

```tsx
// Near the top of the Editor component
const [isMuted, setIsMuted] = useState(false);
```

**Step 3: Add the Button**

Find the button group and add:

```tsx
<button
  onClick={() => setIsMuted(!isMuted)}
  className={cn(
    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
    isMuted
      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
      : 'bg-gray-700 hover:bg-gray-600 text-white'
  )}
>
  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
  {isMuted ? 'Unmute' : 'Mute'}
</button>
```

**Step 4: Connect to Video**

Pass the muted state to VideoPlayer:

```tsx
<VideoPlayer
  ref={videoPlayerRef}
  src={video.filepath}
  muted={isMuted}  // Add this prop
  // ... other props
/>
```

**Step 5: Update VideoPlayer**

In `src/components/VideoPlayer.tsx`:

1. Add the prop to the interface:
   ```tsx
   interface VideoPlayerProps {
     src: string;
     muted?: boolean;  // Add this
     // ... other props
   }
   ```

2. Use the prop:
   ```tsx
   <video
     ref={videoRef}
     src={src}
     muted={muted}  // Add this
     // ... other attributes
   />
   ```

### Example 2: Adding a New API Route

Let's add an API route that returns the number of clips.

**Step 1: Create the Route File**

Create `src/app/api/clip-count/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the clips from the request body
    const { clips } = await request.json();

    // Return the count
    return NextResponse.json({
      count: clips.length,
      totalDuration: clips.reduce((sum, clip) => sum + clip.duration, 0)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to count clips' },
      { status: 500 }
    );
  }
}
```

**Step 2: Call It from the Frontend**

```tsx
const response = await fetch('/api/clip-count', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clips })
});

const data = await response.json();
console.log(`You have ${data.count} clips totaling ${data.totalDuration} seconds`);
```

### Example 3: Adding a New Hook

Let's create a hook for tracking undo history.

**Step 1: Create the Hook File**

Create `src/hooks/useUndoHistory.ts`:

```tsx
'use client';

import { useState, useCallback } from 'react';

interface UseUndoHistoryReturn<T> {
  current: T;
  set: (value: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoHistory<T>(initialValue: T): UseUndoHistoryReturn<T> {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  const current = history[index];

  const set = useCallback((value: T) => {
    // Remove any "future" history and add new value
    const newHistory = history.slice(0, index + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  }, [index, history.length]);

  return {
    current,
    set,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1
  };
}
```

**Step 2: Use the Hook**

```tsx
const {
  current: clips,
  set: setClips,
  undo: undoClips,
  redo: redoClips,
  canUndo,
  canRedo
} = useUndoHistory<Clip[]>([initialClip]);
```

---

## Debugging Guide

### Common Problems and Solutions

#### Problem: "Module not found" Error

**Symptom:**
```
Error: Cannot find module './SomeComponent'
```

**Causes:**
1. Typo in the import path
2. File doesn't exist
3. Wrong file extension

**Solutions:**
1. Check the exact file path and name
2. Make sure the file exists
3. Use proper relative paths (`./` for same folder, `../` for parent)

#### Problem: "FFMPEG not found"

**Symptom:**
```
Error: ffmpeg not found: spawn ffmpeg ENOENT
```

**Solutions:**
1. Verify FFMPEG is installed: `ffmpeg -version`
2. Check PATH environment variable includes FFMPEG
3. Restart your terminal after installing
4. On Windows, restart VS Code after changing PATH

#### Problem: "Whisper not found"

**Symptom:**
```
Error: Whisper not found. Please install it with: pip install openai-whisper
```

**Solutions:**
1. Install Whisper: `pip install openai-whisper`
2. Make sure Python's Scripts folder is in PATH
3. Try `pip3 install openai-whisper` if using pip3

#### Problem: White Screen / Nothing Renders

**Steps to Debug:**
1. Open browser console (F12)
2. Look for red error messages
3. Common causes:
   - Missing `'use client'` directive in a component using hooks
   - Undefined variable being accessed
   - Import error

#### Problem: API Returns 500 Error

**Steps to Debug:**
1. Check terminal for server-side error messages
2. Add console.log statements to the API route:
   ```tsx
   console.log('Request body:', await request.json());
   ```
3. Check that all required data is being sent

### Using Browser DevTools

**Opening DevTools:** Press F12 or right-click → "Inspect"

**Console Tab:**
- See JavaScript errors in red
- See console.log output
- Filter by "Errors" to focus on problems

**Network Tab:**
- See all API requests
- Click a request to see:
  - Request headers and body
  - Response data
  - Timing information

**React DevTools (install extension):**
- See component hierarchy
- Inspect component props and state
- Track state changes

### Adding Debug Logging

**In React Components:**
```tsx
console.log('Current clips:', clips);
console.log('Selected clip:', selectedClipId);

// Use useEffect to log when state changes
useEffect(() => {
  console.log('Playhead moved to:', playheadTime);
}, [playheadTime]);
```

**In API Routes:**
```tsx
export async function POST(request: NextRequest) {
  console.log('=== API: /api/upload ===');
  console.log('Method:', request.method);

  const formData = await request.formData();
  console.log('Files received:', formData.keys());

  // ... rest of code
}
```

---

## Testing Guide

### Manual Testing Checklist

Before committing changes, test these scenarios:

**Upload Flow:**
- [ ] Drag and drop a video file
- [ ] Click to browse and select a file
- [ ] Try uploading an invalid file (e.g., .txt) - should show error
- [ ] Upload a large file (test loading state)

**Video Playback:**
- [ ] Video plays when clicking play button
- [ ] Video pauses when clicking pause
- [ ] Volume slider works
- [ ] Clicking on the progress bar seeks to that time
- [ ] Fullscreen toggle works

**Timeline:**
- [ ] Clips appear on the timeline
- [ ] Clicking on timeline seeks the video
- [ ] Zoom slider changes timeline scale
- [ ] Clips show correct duration labels

**Editing:**
- [ ] Press C to cut at playhead position
- [ ] Click a clip to select it (shows highlight)
- [ ] Press Delete to remove selected clip
- [ ] Clips snap together after deletion
- [ ] Reset button restores original clip

**AI Features:**
- [ ] Transcribe button works
- [ ] Transcription text appears
- [ ] AI edit prompt accepts input
- [ ] Generate clips produces results
- [ ] Clips update on timeline after AI edit

**Export:**
- [ ] Export button is disabled when no clips
- [ ] Export shows progress
- [ ] Downloaded file plays correctly
- [ ] Clips are in correct order in export

### Writing Automated Tests

**Location:** `__tests__/` or files ending in `.test.ts`

**Example Test:**

```tsx
// src/lib/utils.test.ts
import { formatTime } from './utils';

describe('formatTime', () => {
  it('formats 0 seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00.00');
  });

  it('formats 90 seconds correctly', () => {
    expect(formatTime(90)).toBe('1:30.00');
  });

  it('formats fractional seconds', () => {
    expect(formatTime(65.5)).toBe('1:05.50');
  });
});
```

**Running Tests:**
```bash
npm test
```

---

## Deployment Guide

### Building for Production

```bash
# Create optimized production build
npm run build

# This creates a .next folder with the built application
```

### Running in Production Mode

```bash
# After building
npm start
```

### Deploying to Vercel (Recommended)

1. Create account at https://vercel.com/
2. Connect your Git repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

**Important:** This app requires server-side processing (FFMPEG, Whisper), so it won't work on static hosting. Use:
- Vercel (with serverless functions)
- Your own server with Node.js
- Docker container

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

# Install FFMPEG
RUN apk add --no-cache ffmpeg

# Install Python and Whisper
RUN apk add --no-cache python3 py3-pip
RUN pip3 install openai-whisper

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ai-video-editor .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key ai-video-editor
```

---

## Glossary

### Web Development Terms

| Term | Definition |
|------|------------|
| **Frontend** | The part of an application that runs in the browser and users interact with |
| **Backend** | The server-side part that handles data processing, APIs, and database operations |
| **API** | Application Programming Interface - a way for different parts of software to communicate |
| **REST API** | A style of API using HTTP methods (GET, POST, PUT, DELETE) |
| **HTTP Request** | A message sent from client to server asking for something |
| **HTTP Response** | A message sent from server to client with the result |
| **JSON** | JavaScript Object Notation - a format for structuring data |
| **Component** | A reusable piece of UI in React |
| **State** | Data that can change over time in a React component |
| **Props** | Data passed from a parent component to a child component |
| **Hook** | A function that lets you use React features in function components |
| **Callback** | A function passed as an argument to be called later |
| **Promise** | An object representing a future value (from async operations) |
| **async/await** | Syntax for working with Promises in a cleaner way |

### Project-Specific Terms

| Term | Definition |
|------|------------|
| **Clip** | A segment of the video defined by start and end times |
| **Timeline** | The visual representation of clips over time |
| **Playhead** | The current position in the video, shown as a vertical line |
| **Waveform** | Visual representation of audio amplitude over time |
| **Transcription** | Converting speech in video to text |
| **Semantic Editing** | Using AI to understand content meaning for editing |

### Tool-Specific Terms

| Term | Definition |
|------|------------|
| **npm** | Node Package Manager - installs and manages JavaScript packages |
| **package.json** | File listing project dependencies and scripts |
| **node_modules** | Folder containing all installed packages |
| **TypeScript** | JavaScript with static typing |
| **JSX/TSX** | Syntax that lets you write HTML-like code in JavaScript/TypeScript |
| **Tailwind** | A utility-first CSS framework |
| **FFMPEG** | Command-line tool for video/audio processing |
| **Whisper** | OpenAI's speech-to-text AI model |
| **Gemini** | Google's AI model used for understanding text |

---

## Getting Help

### Documentation Resources

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **FFMPEG:** https://ffmpeg.org/documentation.html

### Asking Questions

When asking for help:
1. Describe what you're trying to do
2. Show the error message (exact text)
3. Show the relevant code
4. List what you've already tried

### Common Beginner Mistakes

1. **Forgetting 'use client'** - Add to any component using useState/useEffect
2. **Modifying state directly** - Always use the setter function
3. **Forgetting await** - Async functions need await when calling
4. **Import path typos** - Check exact file paths and names
5. **Missing dependencies** - Run `npm install` after pulling changes
