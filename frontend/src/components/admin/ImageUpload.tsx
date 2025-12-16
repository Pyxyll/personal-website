'use client';

import { useState, useRef, useCallback } from 'react';
import { imagesApi } from '@/lib/api';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string | null;
  label?: string;
  type?: 'featured' | 'content';
  className?: string;
}

export function ImageUpload({
  onUpload,
  currentImage,
  label = 'Upload Image',
  type = 'content',
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError('');
    setIsUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const response = await imagesApi.upload(file, type);
      setPreview(response.url);
      onUpload(response.url);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload image');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  }, [type, onUpload, currentImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

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
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload]);

  return (
    <div className={className}>
      <label className="block text-sm text-muted-foreground mb-1">
        {label}
      </label>

      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}

      {preview ? (
        <div className="relative border border-border bg-background p-2">
          <img
            src={preview}
            alt="Preview"
            className={`object-cover ${type === 'featured' ? 'w-32 h-32' : 'max-w-full max-h-48'}`}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-foreground"
              disabled={isUploading}
            >
              [Change]
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-300"
              disabled={isUploading}
            >
              [Remove]
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed p-6 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-foreground bg-foreground/5'
              : 'border-border hover:border-muted-foreground'
            }
            ${isUploading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {isUploading ? (
            <span className="text-muted-foreground">Uploading...</span>
          ) : (
            <>
              <span className="text-muted-foreground block">
                Drag & drop an image here
              </span>
              <span className="text-muted-foreground text-sm">
                or click to browse
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
