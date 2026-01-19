import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { extractAudio, ensureDir } from '@/lib/ffmpeg';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp');

export async function POST(request: NextRequest) {
  try {
    const { videoId, filename } = await request.json();

    if (!videoId || !filename) {
      return NextResponse.json(
        { error: 'Missing videoId or filename' },
        { status: 400 }
      );
    }

    // Ensure temp directory exists
    await ensureDir(TEMP_DIR);

    // Get the video file path
    const actualFilename = filename.split('/').pop() || filename;
    const videoPath = path.join(process.cwd(), 'uploads', actualFilename);

    // Generate output path
    const audioId = uuidv4();
    const audioFilename = `${audioId}.mp3`;
    const audioPath = path.join(TEMP_DIR, audioFilename);

    // Extract audio
    await extractAudio(videoPath, audioPath);

    return NextResponse.json({
      audioId,
      audioPath: `/api/video/temp/${audioFilename}`,
      localPath: audioPath,
    });
  } catch (error) {
    console.error('Audio extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Audio extraction failed' },
      { status: 500 }
    );
  }
}
