'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { UploadCloud, X, FileText } from 'lucide-react';

interface Props {
  file: File | null | undefined;
  onFileChange: (file: File | null) => void;
}

export function FileUpload({ file, onFileChange }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted[0]) onFileChange(accepted[0]); },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (file) {
    return (
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <FileText className="w-5 h-5 text-brand flex-shrink-0" />
        <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
        <button
          type="button"
          onClick={() => onFileChange(null)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          'flex flex-col items-center justify-center gap-3 py-8 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
          isDragActive
            ? 'border-brand bg-brand/5'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        )}
      >
        <input {...getInputProps()} />
        <div className={clsx('w-10 h-10 flex items-center justify-center rounded-full', isDragActive ? 'bg-brand/10' : 'bg-gray-100')}>
          <UploadCloud className={clsx('w-5 h-5', isDragActive ? 'text-brand' : 'text-gray-500')} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Choose a file or drag &amp; drop it here
          </p>
          <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, PDF, TXT upto 10MB</p>
        </div>
        <button
          type="button"
          className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-medium py-1.5 px-5 rounded-full transition-colors"
        >
          Browse Files
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
