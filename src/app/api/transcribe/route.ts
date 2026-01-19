import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/whisper';

export async function POST(request: NextRequest) {
  try {
    const { audioPath, model = 'small' } = await request.json();

    if (!audioPath) {
      return NextResponse.json(
        { error: 'Missing audioPath' },
        { status: 400 }
      );
    }

    // Transcribe using Whisper
    const transcript = await transcribeAudio(audioPath, model);

    return NextResponse.json(transcript);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
