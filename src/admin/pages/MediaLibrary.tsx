import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Copy, Check, Image as ImageIcon, X,
  Loader2, AlertCircle, ExternalLink, Filter, Grid3x3, Link2,
  FolderOpen
} from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';
import { AdminToast } from '@/admin/components';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: 'upload' | 'external';
  size?: number;
  createdAt: string;
  source?: string;
}

type FilterType = 'all' | 'upload' | 'external';

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('/api/media');
      setItems(res.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)
    );

    if (fileArray.length === 0) {
      alert('请选择有效的图片文件（JPG/PNG/WebP/GIF）');
      return;
    }

    setUploading(true);
    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post('/api/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await fetchItems();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      alert(error.response?.data?.error || error.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/media/${id}`);
      setItems(items.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      alert(error.response?.data?.error || error.message || '删除失败');
    }
  };

  const copyUrl = async (url: string, id: string) => {
    const fullUrl = getFullImageUrl(url);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setToast({ type: 'success', message: 'URL 已复制到剪贴板' });
      setTimeout(() => setCopiedId(null), 2000);
      setTimeout(() => setToast(null), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setToast({ type: 'success', message: 'URL 已复制到剪贴板' });
      setTimeout(() => setCopiedId(null), 2000);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.type === filter);

  const uploadCount = items.filter(i => i.type === 'upload').length;
  const externalCount = items.filter(i => i.type === 'external').length;

  if (loading) {
    return (
      <div className="text-center py-20 px-5 text-admin-text-subtle">
        <Loader2 size={32} className="text-admin-accent animate-spin mx-auto" />
        <p className="mt-3 text-sm">加载媒体库...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] text-admin-text font-serif mb-1">媒体库</h1>
          <p className="text-sm text-admin-text-dim">
            管理所有图片资源 · 本地上传 {uploadCount} 张 · 外部引用 {externalCount} 张
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold cursor-pointer">
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            上传图片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${dragOver
            ? 'border-admin-accent bg-admin-accent/5'
            : 'border-admin-border bg-admin-card'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={40} className={`mx-auto mb-3 ${dragOver ? 'text-admin-accent' : 'text-admin-text-subtle'}`} />
        <p className={`text-[15px] mb-2 ${dragOver ? 'text-admin-accent' : 'text-admin-text-muted'}`}>
          拖拽图片到此处上传，或点击选择文件
        </p>
        <p className="text-xs text-admin-text-subtle">
          支持 JPG / PNG / WebP / GIF，单文件最大 10MB
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 px-5 py-4 bg-admin-raised rounded-xl border border-admin-border">
        <Filter size={16} className="text-admin-text-dim" />
        <button
          onClick={() => setFilter('all')}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] transition-all duration-200
            ${filter === 'all'
              ? 'bg-admin-accent/15 border border-admin-accent/30 text-admin-accent'
              : 'bg-transparent border border-transparent text-admin-text-muted'
            }
          `}
        >
          <Grid3x3 size={14} /> 全部 ({items.length})
        </button>
        <button
          onClick={() => setFilter('upload')}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] transition-all duration-200
            ${filter === 'upload'
              ? 'bg-admin-accent/15 border border-admin-accent/30 text-admin-accent'
              : 'bg-transparent border border-transparent text-admin-text-muted'
            }
          `}
        >
          <FolderOpen size={14} /> 本地上传 ({uploadCount})
        </button>
        <button
          onClick={() => setFilter('external')}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] transition-all duration-200
            ${filter === 'external'
              ? 'bg-admin-accent/15 border border-admin-accent/30 text-admin-accent'
              : 'bg-transparent border border-transparent text-admin-text-muted'
            }
          `}
        >
          <Link2 size={14} /> 外部链接 ({externalCount})
        </button>
      </div>

      {/* Image Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-admin-raised rounded-xl border border-admin-border overflow-hidden relative"
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.card-overlay');
                  if (overlay) (overlay as HTMLElement).style.opacity = '1';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.card-overlay');
                  if (overlay) (overlay as HTMLElement).style.opacity = '0';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div className="relative w-full pt-[75%] overflow-hidden bg-admin-table" onClick={() => setPreviewImage(item)}>
                  <img src={getFullImageUrl(item.url)} alt={item.filename} className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300" loading="lazy" />

                  <div className="card-overlay absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyUrl(item.url, item.id); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 border border-transparent rounded-lg text-white text-[13px] cursor-pointer"
                      title="复制URL"
                    >
                      {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(item); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 border border-transparent rounded-lg text-white text-[13px] cursor-pointer"
                      title="预览"
                    >
                      <ExternalLink size={16} />
                    </button>
                    {item.type === 'upload' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.id); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/30 border border-transparent rounded-lg text-white text-[13px] cursor-pointer"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-3.5 py-3">
                  <div className="text-xs text-admin-accent font-medium truncate mb-1" title={item.source}>{item.source || '未知来源'}</div>
                  <div className="text-[11px] text-admin-text-muted font-mono break-all leading-[1.4] mb-2 line-clamp-2" title={getFullImageUrl(item.url)}>{getFullImageUrl(item.url)}</div>
                  <div className="flex justify-between items-center text-[11px] text-admin-text-dim">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.type === 'upload' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {item.type === 'upload' ? '本地' : '外部'}
                    </span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>

                {deleteConfirm === item.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-0 left-0 right-0 p-3 bg-red-500/95 flex items-center justify-between gap-2"
                  >
                    <span className="text-[13px] text-white">确认删除此图片？</span>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 border border-white/30 rounded-md text-white bg-transparent cursor-pointer text-xs">取消</button>
                      <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1.5 bg-white text-red-400 border-none rounded-md text-xs font-semibold cursor-pointer">删除</button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-[60px] px-5 text-admin-text-subtle">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-base mb-2">
            {filter === 'all' ? '暂无图片资源' : filter === 'upload' ? '暂无本地上传的图片' : '暂无外部链接图片'}
          </p>
          <p className="text-[13px] text-admin-text-subtle">
            上传新图片开始使用媒体库
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-5"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[90vw] max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={getFullImageUrl(previewImage.url)} alt={previewImage.filename} className="max-w-full max-h-[85vh] rounded-lg object-contain" />
              <div className="mt-4 flex items-center gap-3 bg-admin-raised p-4 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-admin-text mb-1.5 truncate">{previewImage.filename}</div>
                  <div className="text-xs text-admin-text-dim font-mono break-all">{getFullImageUrl(previewImage.url)}</div>
                </div>
                <button onClick={() => copyUrl(previewImage.url, previewImage.id)} className="flex items-center gap-1.5 px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold cursor-pointer">
                  {copiedId === previewImage.id ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制URL</>}
                </button>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 size-9 rounded-full bg-white border-none text-black cursor-pointer flex items-center justify-center text-lg shadow-lg"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
