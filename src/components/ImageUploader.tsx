'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { Upload, X, GripVertical, Star } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  projectId: string;
  adminToken: string;
}

export default function ImageUploader({ images, onChange, projectId, adminToken }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError('');
    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        newUrls.push(url);
      } else {
        const { error: msg } = await res.json().catch(() => ({ error: 'Upload failed' }));
        setError(msg);
      }
    }

    if (newUrls.length > 0) onChange([...images, ...newUrls]);
    setUploading(false);
  }

  function removeImage(url: string) {
    onChange(images.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      {/* Drag-drop / click zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={20} className="mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-500">
          {uploading ? 'Uploading…' : 'Drop photos here or click to select'}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP · max 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Reorderable thumbnail grid */}
      {images.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">
            Drag to reorder · first image is the hero
          </p>
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={onChange}
            className="space-y-2"
          >
            {images.map((url, i) => (
              <Reorder.Item key={url} value={url} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-2 cursor-grab active:cursor-grabbing">
                <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={url} alt="" fill className="object-cover" sizes="48px" />
                </div>
                <div className="flex-1 min-w-0">
                  {i === 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 mb-0.5">
                      <Star size={10} fill="currentColor" /> Hero image
                    </span>
                  )}
                  <p className="text-xs text-slate-400 truncate">{url.split('/').pop()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="p-1 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
