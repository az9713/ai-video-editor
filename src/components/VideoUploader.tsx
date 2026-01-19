'use client';

import { useState, useCallback } from 'react';
import { Upload, Film, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoMetadata } from '@/types/clip';

interface VideoUploaderProps {
  onUploadComplete: (metadata: VideoMetadata) => void;
}

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload MP4, MOV, or WebM files.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 500MB.';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const metadata: VideoMetadata = await response.json();
      onUploadComplete(metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    uploadFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    uploadFile(file);
  }, []);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
        isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-600 hover:border-gray-500 bg-gray-900/50',
        isUploading && 'pointer-events-none opacity-60'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept=".mp4,.mov,.webm"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-300">Uploading video...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800">
            {isDragging ? (
              <Film className="w-8 h-8 text-blue-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-200">
              {isDragging ? 'Drop your video here' : 'Drag and drop a video'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (MP4, MOV, WebM - max 500MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
