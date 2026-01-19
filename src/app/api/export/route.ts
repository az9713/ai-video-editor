import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { cutClip, concatClips, ensureDir } from '@/lib/ffmpeg';
import { Clip } from '@/types/clip';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const EXPORTS_DIR = path.join(process.cwd(), 'exports');

export async function POST(request: NextRequest) {
  const clipPaths: string[] = [];

  try {
    const { videoFilename, clips } = await request.json() as {
      videoFilename: string;
      clips: Clip[];
    };

    if (!videoFilename || !clips || clips.length === 0) {
      return NextResponse.json(
        { error: 'Missing videoFilename or clips' },
        { status: 400 }
      );
    }

    // Ensure directories exist
    await ensureDir(TEMP_DIR);
    await ensureDir(EXPORTS_DIR);

    // Get the source video path
    const actualFilename = videoFilename.split('/').pop() || videoFilename;
    const sourcePath = path.join(process.cwd(), 'uploads', actualFilename);

    // Check if source exists
    try {
      await fs.access(sourcePath);
    } catch {
      return NextResponse.json(
        { error: 'Source video not found' },
        { status: 404 }
      );
    }

    // Cut each clip
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipPath = path.join(TEMP_DIR, `clip_${i}_${uuidv4()}.mp4`);
      clipPaths.push(clipPath);

      console.log(`Cutting clip ${i}:`, {
        sourceStart: clip.sourceStart,
        sourceEnd: clip.sourceEnd,
        duration: clip.duration,
        clipPath
      });

      await cutClip(sourcePath, clipPath, clip.sourceStart, clip.duration);
    }

    // Generate output filename
    const exportId = uuidv4();
    const outputFilename = `export_${exportId}.mp4`;
    const outputPath = path.join(EXPORTS_DIR, outputFilename);

    // If only one clip, just copy it
    if (clipPaths.length === 1) {
      // Check temp clip size
      const tempStats = await fs.stat(clipPaths[0]);
      console.log('Temp clip size:', tempStats.size, 'bytes');
      await fs.copyFile(clipPaths[0], outputPath);
    } else {
      // Concat all clips
      await concatClips(clipPaths, outputPath, TEMP_DIR);
    }

    // Clean up temp clip files
    for (const clipPath of clipPaths) {
      try {
        await fs.unlink(clipPath);
      } catch {}
    }

    return NextResponse.json({
      exportId,
      filename: outputFilename,
      downloadUrl: `/api/video/exports/${outputFilename}`,
    });
  } catch (error) {
    // Clean up temp files on error
    for (const clipPath of clipPaths) {
      try {
        await fs.unlink(clipPath);
      } catch {}
    }

    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
