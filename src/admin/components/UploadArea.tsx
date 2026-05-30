import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface UploadAreaProps {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function UploadArea({ value, onChange }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return '仅支持 JPG、PNG 或 WebP 格式图片';
    }
    if (file.size > MAX_SIZE) {
      return '图片大小不能超过 10MB';
    }
    return null;
  };

  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setError('');

    try {
      const res = await axios.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: () => {},
      });
      onChange(res.data.url);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="block font-ui text-sm text-secondary/70 uppercase tracking-wider font-medium">
        作品图片 <span className="text-red-400">*</span>
      </label>

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-8 lg:p-12
            flex flex-col items-center justify-center gap-4 min-h-[280px]
            transition-all duration-300
            ${
              dragActive
                ? 'border-accent bg-accent/5 scale-[1.01]'
                : 'border-surface-light hover:border-accent/50 hover:bg-surface/20'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleChange}
            className="hidden"
            aria-label="选择图片文件"
          />

          {uploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 size={40} className="text-accent animate-spin" />
              <p className="font-ui text-sm text-secondary/70">正在上传...</p>
              <div className="w-48 h-1.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                />
              </div>
            </motion.div>
          ) : (
            <>
              <div className={`p-4 rounded-2xl transition-colors duration-300 ${
                dragActive ? 'bg-accent/15' : 'bg-surface/50'
              }`}>
                <Upload size={32} className={dragActive ? 'text-accent' : 'text-secondary/40'} />
              </div>
              <div className="text-center">
                <p className={`font-ui text-sm font-medium transition-colors ${
                  dragActive ? 'text-accent' : 'text-secondary/70'
                }`}>
                  点击或拖拽上传图片
                </p>
                <p className="font-ui text-xs text-secondary/40 mt-1.5 tracking-wide">
                  支持 JPG / PNG / WebP，最大 10MB
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-surface-light/50">
          <img
            src={value}
            alt="已上传的作品预览"
            className="w-full h-auto max-h-[360px] object-contain bg-surface-dark"
          />
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleRemove}
              className="p-2 bg-black/70 hover:bg-red-500/90 rounded-lg backdrop-blur-sm transition-colors"
              aria-label="删除图片"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs font-ui text-white/90">
              <ImageIcon size={12} /> 已上传
            </span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm font-ui text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
