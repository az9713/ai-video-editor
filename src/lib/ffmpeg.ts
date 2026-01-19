import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
}

export async function getVideoInfo(filepath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filepath
    ]);

    let stdout = '';
    let stderr = '';

    ffprobe.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobe.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === 'video');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const fps = videoStream.r_frame_rate ? eval(videoStream.r_frame_rate) : 30;

        resolve({
          duration: parseFloat(data.format?.duration || '0'),
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: Math.round(fps * 100) / 100,
          codec: videoStream.codec_name || 'unknown'
        });
      } catch (err) {
        reject(new Error('Failed to parse ffprobe output'));
      }
    });

    ffprobe.on('error', (err) => {
      reject(new Error(`ffprobe not found: ${err.message}`));
    });
  });
}

export async function extractAudioWaveform(
  inputPath: string,
  sampleRate: number = 8000
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-ac', '1',
      '-ar', sampleRate.toString(),
      '-f', 'f32le',
      '-acodec', 'pcm_f32le',
      'pipe:1'
    ]);

    const chunks: Buffer[] = [];
    let stderr = '';

    ffmpeg.stdout.on('data', (data) => {
      chunks.push(data);
    });

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg waveform extraction failed: ${stderr}`));
        return;
      }

      const buffer = Buffer.concat(chunks);
      const floats = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);

      // Downsample to reasonable number of peaks
      const targetPeaks = 1000;
      const samplesPerPeak = Math.ceil(floats.length / targetPeaks);
      const peaks: number[] = [];

      for (let i = 0; i < floats.length; i += samplesPerPeak) {
        let max = 0;
        for (let j = i; j < Math.min(i + samplesPerPeak, floats.length); j++) {
          const abs = Math.abs(floats[j]);
          if (abs > max) max = abs;
        }
        peaks.push(max);
      }

      resolve(peaks);
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });
  });
}

export async function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-vn',
      '-ar', '16000',
      '-ac', '1',
      '-y',
      outputPath
    ]);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Audio extraction failed: ${stderr}`));
        return;
      }
      resolve();
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });
  });
}

export async function cutClip(
  inputPath: string,
  outputPath: string,
  start: number,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use -ss after -i for accurate seeking, and re-encode for frame-accurate cuts
    // -c copy only works at keyframes, which causes inaccurate cuts
    const args = [
      '-i', inputPath,
      '-ss', start.toString(),
      '-t', duration.toString(),
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-y',
      outputPath
    ];

    console.log('FFMPEG cut command:', 'ffmpeg', args.join(' '));

    const ffmpeg = spawn('ffmpeg', args);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Clip cutting failed: ${stderr}`));
        return;
      }
      resolve();
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });
  });
}

export async function concatClips(
  clipPaths: string[],
  outputPath: string,
  tempDir: string
): Promise<void> {
  // Create concat list file
  const listPath = path.join(tempDir, 'concat_list.txt');
  const listContent = clipPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  await fs.writeFile(listPath, listContent);

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-c', 'copy',
      '-y',
      outputPath
    ]);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', async (code) => {
      // Clean up list file
      try {
        await fs.unlink(listPath);
      } catch {}

      if (code !== 0) {
        reject(new Error(`Concat failed: ${stderr}`));
        return;
      }
      resolve();
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });
  });
}

export async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}
