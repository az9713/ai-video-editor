import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { extractAudioWaveform } from '@/lib/ffmpeg';

export async function POST(request: NextRequest) {
  try {
    const { videoId, filename } = await request.json();

    if (!videoId || !filename) {
      return NextResponse.json(
        { error: 'Missing videoId or filename' },
        { status: 400 }
      );
    }

    // Get the video file path
    const videoPath = path.join(process.cwd(), 'uploads', filename);

    // Extract waveform peaks
    const peaks = await extractAudioWaveform(videoPath);

    return NextResponse.json({ peaks });
  } catch (error) {
    console.error('Waveform extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Waveform extraction failed' },
      { status: 500 }
    );
  }
}
