'use client';

import { useState, useCallback } from 'react';
import { Mic, Wand2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transcript, TranscriptSegment, AIEditResult } from '@/types/transcript';
import { Clip } from '@/types/clip';
import { v4 as uuidv4 } from 'uuid';

interface AIEditPanelProps {
  videoId: string;
  filename: string;
  onClipsGenerated: (clips: Clip[]) => void;
}

export default function AIEditPanel({
  videoId,
  filename,
  onClipsGenerated,
}: AIEditPanelProps) {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [lastAIResult, setLastAIResult] = useState<AIEditResult | null>(null);

  const handleTranscribe = useCallback(async () => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Step 1: Extract audio from video
      const extractResponse = await fetch('/api/extract-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, filename }),
      });

      if (!extractResponse.ok) {
        const data = await extractResponse.json();
        throw new Error(data.error || 'Audio extraction failed');
      }

      const { localPath } = await extractResponse.json();

      // Step 2: Transcribe the audio
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioPath: localPath, model: 'small' }),
      });

      if (!transcribeResponse.ok) {
        const data = await transcribeResponse.json();
        throw new Error(data.error || 'Transcription failed');
      }

      const transcriptData: Transcript = await transcribeResponse.json();
      setTranscript(transcriptData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, [videoId, filename]);

  const handleAIEdit = useCallback(async () => {
    if (!transcript || !prompt.trim()) return;

    setIsProcessingAI(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.text,
          segments: transcript.segments,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'AI editing failed');
      }

      const result: AIEditResult = await response.json();
      setLastAIResult(result);

      console.log('AI Edit result:', result);

      // Convert AI result to clips
      if (result.clips && result.clips.length > 0) {
        let timelineStart = 0;
        const newClips: Clip[] = result.clips.map((clip) => {
          const duration = clip.end - clip.start;
          const newClip: Clip = {
            id: uuidv4(),
            sourceStart: clip.start,
            sourceEnd: clip.end,
            timelineStart,
            duration,
          };
          timelineStart += duration;
          return newClip;
        });

        console.log('Calling onClipsGenerated with:', newClips);
        onClipsGenerated(newClips);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI editing failed');
    } finally {
      setIsProcessingAI(false);
    }
  }, [transcript, prompt, onClipsGenerated]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          AI Edit
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Transcription section */}
        <div>
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center',
              isTranscribing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                {transcript ? 'Re-transcribe' : 'Start Transcription'}
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">Uses Whisper (local)</p>
        </div>

        {/* Transcript display */}
        {transcript && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Transcript ({transcript.segments.length} segments)
              </span>
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showFullTranscript ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show all
                  </>
                )}
              </button>
            </div>

            <div className={cn(
              'space-y-1 overflow-y-auto',
              showFullTranscript ? 'max-h-60' : 'max-h-24'
            )}>
              {(showFullTranscript ? transcript.segments : transcript.segments.slice(0, 3)).map((seg) => (
                <div key={seg.id} className="text-xs">
                  <span className="text-gray-500 font-mono">
                    [{formatTime(seg.start)} - {formatTime(seg.end)}]
                  </span>{' '}
                  <span className="text-gray-300">{seg.text}</span>
                </div>
              ))}
              {!showFullTranscript && transcript.segments.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{transcript.segments.length - 3} more segments...
                </p>
              )}
            </div>
          </div>
        )}

        {/* AI Editing section */}
        {transcript && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Editing Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., "Keep only the parts where they talk about AI" or "Remove all silent moments"'
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500"
                rows={3}
              />
            </div>

            <button
              onClick={handleAIEdit}
              disabled={isProcessingAI || !prompt.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center',
                isProcessingAI || !prompt.trim()
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isProcessingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Clips
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Result */}
        {lastAIResult && lastAIResult.clips.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-300 block mb-2">
              AI Selected {lastAIResult.clips.length} clips:
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {lastAIResult.clips.map((clip, i) => (
                <div key={i} className="text-xs">
                  <span className="text-green-400 font-mono">
                    [{formatTime(clip.start)} - {formatTime(clip.end)}]
                  </span>{' '}
                  <span className="text-gray-400">{clip.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
