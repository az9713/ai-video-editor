import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getVideoInfo, ensureDir } from '@/lib/ffmpeg';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, MOV, or WebM files.' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    await ensureDir(UPLOADS_DIR);

    // Generate unique filename
    const id = uuidv4();
    const ext = path.extname(file.name) || '.mp4';
    const filename = `${id}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Get video metadata using ffprobe
    const videoInfo = await getVideoInfo(filepath);

    return NextResponse.json({
      id,
      filename: file.name,
      filepath: `/api/video/uploads/${filename}`,
      duration: videoInfo.duration,
      width: videoInfo.width,
      height: videoInfo.height,
      fps: videoInfo.fps,
      codec: videoInfo.codec
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
