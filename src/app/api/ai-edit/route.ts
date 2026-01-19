import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscriptForEditing } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { transcript, segments, prompt } = await request.json();

    if (!transcript || !segments || !prompt) {
      return NextResponse.json(
        { error: 'Missing transcript, segments, or prompt' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Analyze transcript and get clip recommendations
    const result = await analyzeTranscriptForEditing(transcript, prompt, segments);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI edit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI editing failed' },
      { status: 500 }
    );
  }
}
