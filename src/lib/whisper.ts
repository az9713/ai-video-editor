import { spawn } from 'child_process';
import { TranscriptSegment, Transcript } from '@/types/transcript';

export async function transcribeAudio(
  audioPath: string,
  model: string = 'small'
): Promise<Transcript> {
  return new Promise((resolve, reject) => {
    const whisper = spawn('whisper', [
      audioPath,
      '--model', model,
      '--output_format', 'json',
      '--word_timestamps', 'True',
      '--output_dir', '.',
    ], {
      shell: true,
    });

    let stderr = '';

    whisper.stderr.on('data', (data) => {
      stderr += data.toString();
      // Log progress
      console.log('Whisper:', data.toString());
    });

    whisper.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`Whisper failed: ${stderr}`));
        return;
      }

      try {
        // Read the JSON output file
        const fs = await import('fs/promises');
        const path = await import('path');

        const baseName = path.basename(audioPath, path.extname(audioPath));
        const jsonPath = `${baseName}.json`;

        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const result = JSON.parse(jsonContent);

        // Clean up the JSON file
        try {
          await fs.unlink(jsonPath);
        } catch {}

        // Parse segments from Whisper output
        const segments: TranscriptSegment[] = (result.segments || []).map((seg: { id: number; start: number; end: number; text: string }, index: number) => ({
          id: index,
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
        }));

        resolve({
          segments,
          text: result.text || segments.map((s: TranscriptSegment) => s.text).join(' '),
          language: result.language || 'en',
        });
      } catch (err) {
        reject(new Error(`Failed to parse Whisper output: ${err}`));
      }
    });

    whisper.on('error', (err) => {
      reject(new Error(`Whisper not found. Please install it with: pip install openai-whisper. Error: ${err.message}`));
    });
  });
}
