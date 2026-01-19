import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const filePath = path.join(process.cwd(), ...pathParts);

    // Security: ensure the file is within allowed directories
    const allowedDirs = ['uploads', 'exports', 'temp'];
    const requestedDir = pathParts[0];
    if (!allowedDirs.includes(requestedDir)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if file exists
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get file extension and set content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Handle range requests for video streaming
    const range = request.headers.get('range');
    const fileSize = stats.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = await readFile(filePath);
      const chunk = file.slice(start, end + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
        },
      });
    }

    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Video serve error:', error);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
