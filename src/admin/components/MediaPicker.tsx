import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { X, Upload, Image as ImageIcon, ExternalLink, Loader2, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: 'upload' | 'external';
  size?: number;
  createdAt: string;
  source?: string;
}

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  onClose: () => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MediaPicker({ value, onChange, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'library' | 'url'>('library');
  const [customUrl, setCustomUrl] = useState('');
  const [selected, setSelected] = useState<string>(value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('/api/media');
      setItems(res.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(item =>
    item.filename.toLowerCase().includes(search.toLowerCase()) ||
    (item.source || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    );
    if (!fileArray.length) return;

    setUploading(true);
    try {
      for (const file of fileArray) {
        const form = new FormData();
        form.append('file', file);
        const res = await axios.post('/api/upload/image', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data.url || res.data.data?.url;
        if (url) {
          setSelected(url);
          setPreviewUrl(url);
        }
      }
      fetchItems();
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (url: string) => {
    setSelected(url);
    setPreviewUrl(url);
  };

  const handleConfirm = () => {
    if (tab === 'url' && customUrl) {
      onChange(customUrl);
    } else if (selected) {
      onChange(selected);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-admin-card border border-admin-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border-light shrink-0">
            <h2 className="text-base font-medium text-admin-text">选择图片</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-admin-raised text-admin-text-muted hover:text-admin-text transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 pb-3 border-b border-admin-border-light shrink-0">
            <button
              onClick={() => setTab('library')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                tab === 'library'
                  ? 'bg-admin-accent text-admin-primary'
                  : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-raised'
              }`}
            >
              <ImageIcon size={13} className="inline mr-1.5" />
              媒体库
            </button>
            <button
              onClick={() => setTab('url')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                tab === 'url'
                  ? 'bg-admin-accent text-admin-primary'
                  : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-raised'
              }`}
            >
              <ExternalLink size={13} className="inline mr-1.5" />
              图片地址
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {tab === 'library' ? (
              <>
                {/* Search + upload */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜索图片..."
                      className="w-full pl-9 pr-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 bg-admin-accent text-admin-primary rounded-lg text-xs font-medium hover:bg-admin-accent-light transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    上传图片
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handleUpload(e.target.files); e.target.value = ''; }} />
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-admin-text-muted" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {filtered.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.url)}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          selected === item.url
                            ? 'border-admin-accent ring-2 ring-admin-accent/30'
                            : 'border-admin-border-light hover:border-admin-accent/50'
                        }`}
                      >
                        <div className="aspect-[4/3] bg-admin-raised">
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="75"/><rect fill="%23222" width="100" height="75"/><text x="50" y="40" text-anchor="middle" fill="%23666" font-size="10">图片加载失败</text></svg>'; }}
                          />
                        </div>
                        {selected === item.url && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-admin-accent rounded-full flex items-center justify-center">
                            <Check size={12} className="text-admin-primary" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {loading === false && filtered.length === 0 && (
                  <div className="text-center py-12 text-admin-text-muted text-sm">
                    没有找到图片，请先上传
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
                  />
                </div>
                {previewUrl && (
                  <div className="rounded-lg overflow-hidden border border-admin-border-light max-h-64">
                    <img src={previewUrl} alt="预览" className="w-full h-full object-contain" onError={() => setPreviewUrl(null)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-admin-border-light shrink-0">
            {previewUrl ? (
              <div className="text-xs text-admin-text-muted truncate max-w-[300px]">{previewUrl}</div>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-admin-text-muted hover:text-admin-text transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={(!selected && !customUrl) || (tab === 'url' && !customUrl)}
                className="px-4 py-2 bg-admin-accent text-admin-primary text-sm font-medium rounded-lg hover:bg-admin-accent-light transition-colors disabled:opacity-40"
              >
                确认选择
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
