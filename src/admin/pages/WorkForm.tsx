import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Camera,
  Aperture,
  MapPin,
  Calendar,
  Tag as TagIcon,
  Search,
  Plus,
  Upload,
  FolderOpen,
  Link2,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';
import axios from 'axios';
import { getFullImageUrl } from '@/lib/utils';
import { AdminInput, AdminTextarea, AdminToast } from '@/admin/components';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const initialFormState = {
  title: '',
  category: '',
  description: '',
  story: '',
  imageUrl: '',
  camera: '',
  lens: '',
  aperture: '',
  shutter: '',
  iso: '',
  location: '',
  date: '',
  featured: false,
  sortOrder: 0,
  tagIds: [] as number[],
};

function TagSelector({
  selectedIds,
  onChange,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [createName, setCreateName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get('/api/tags').then(res => setAllTags(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowCreateInput(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredTags = search.trim()
    ? allTags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : allTags;

  const selectedTags = allTags.filter(t => selectedIds.includes(t.id));

  const toggleTag = (tagId: number) => {
    onChange(
      selectedIds.includes(tagId)
        ? selectedIds.filter(id => id !== tagId)
        : [...selectedIds, tagId]
    );
  };

  const removeTag = (tagId: number) => {
    onChange(selectedIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!createName.trim()) return;
    const slug = createName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '');
    try {
      const res = await axios.post('/api/tags', { name: createName.trim(), slug });
      const newTag: Tag = res.data.data;
      setAllTags(prev => [...prev, newTag]);
      onChange([...selectedIds, newTag.id]);
      setCreateName('');
      setShowCreateInput(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || '创建标签失败');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-admin-accent/12 text-admin-accent border border-admin-accent/20"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="bg-transparent border-0 text-admin-accent cursor-pointer p-0 flex leading-none"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-admin-text-dim" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="搜索或选择标签..."
          className="w-full py-3.5 pl-[22px] bg-transparent border-0 border-b border-admin-border-light text-admin-text text-[13px] outline-none transition-colors focus:border-admin-accent"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-admin-card border border-admin-border-light rounded-lg max-h-[200px] overflow-y-auto z-50 mt-1">
          {filteredTags.length === 0 && !search.trim() && (
            <div className="px-3.5 py-3 text-xs text-admin-text-dim">暂无标签</div>
          )}
          {filteredTags.length === 0 && search.trim() && (
            <button
              onClick={() => { setShowCreateInput(true); setShowDropdown(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 w-full bg-transparent border-0 text-admin-accent cursor-pointer text-xs"
            >
              <Plus size={14} /> 创建标签 "{search}"
            </button>
          )}
          {filteredTags.map(tag => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => { toggleTag(tag.id); setShowDropdown(false); }}
                className={`flex items-center gap-2 px-3.5 py-2 w-full border-0 cursor-pointer text-[13px] text-left ${isSelected ? 'bg-admin-accent/8 text-admin-accent' : 'bg-transparent text-admin-text-muted'}`}
              >
                <TagIcon size={12} className={isSelected ? 'opacity-100' : 'opacity-40'} />
                {tag.name}
                {isSelected && <span className="ml-auto text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {showCreateInput && (
        <div className="flex gap-2 mt-2">
          <input
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            placeholder="标签名称"
            onKeyDown={e => { if (e.key === 'Enter') handleCreateTag(); if (e.key === 'Escape') setShowCreateInput(false); }}
            autoFocus
            className="flex-1 px-2.5 py-1.5 bg-admin-table border border-admin-border-light rounded-md text-admin-text text-xs outline-none"
          />
          <button onClick={handleCreateTag} className="px-3 py-1.5 bg-admin-accent text-admin-bg border-none rounded-md text-xs cursor-pointer">创建</button>
          <button onClick={() => setShowCreateInput(false)} className="px-3 py-1.5 bg-transparent border border-admin-border-light text-admin-text-muted rounded-md text-xs cursor-pointer">取消</button>
        </div>
      )}
    </div>
  );
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: 'upload' | 'external';
  source?: string;
}

function ImagePicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [mode, setMode] = useState<'choose' | 'media' | 'upload'>('choose');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const res = await axios.get('/api/media');
      setMediaItems(res.data.data || []);
    } catch { } finally {
      setMediaLoading(false);
    }
  }, []);

  const openMediaLibrary = () => {
    setMode('media');
    fetchMedia();
  };

  const handleUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('仅支持 JPG/PNG/WebP/GIF 格式');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('图片大小不能超过 10MB');
      return;
    }

    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSelect(res.data.data.url);
      setMode('choose');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setUploadError(error.response?.data?.error || error.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const selectFromMedia = (url: string) => {
    onSelect(url);
    setMode('choose');
  };

  const submitUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onSelect(trimmed);
      setUrlInput('');
      setMode('choose');
    }
  };

  if (mode === 'choose') {
    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={openMediaLibrary}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            padding: '40px 20px', borderRadius: '12px',
            border: '2px dashed var(--admin-border)', background: 'transparent',
            color: 'var(--admin-accent)', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-accent)'; e.currentTarget.style.background = 'rgba(201,169,110,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <FolderOpen size={24} />
          <div style={{ textAlign: 'left' }}>
            <div>从媒体库选择</div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', marginTop: '4px' }}>浏览已上传的图片</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            padding: '40px 20px', borderRadius: '12px',
            border: '2px dashed var(--admin-border)', background: 'transparent',
            color: '#22c55e', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = 'rgba(34,197,94,0.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Upload size={24} />
          <div style={{ textAlign: 'left' }}>
            <div>本地上传</div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', marginTop: '4px' }}>JPG / PNG / WebP / GIF</div>
          </div>
        </button>
      </div>
    );
  }

  if (mode === 'media') {
    return (
      <div style={{ border: '1px solid var(--admin-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderOpen size={18} style={{ color: 'var(--admin-accent)' }} />
            <span style={{ fontSize: '14px', color: 'var(--admin-text)', fontWeight: 500 }}>媒体库</span>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-dim)' }}>({mediaItems.length} 张)</span>
          </div>
          <button type="button" onClick={() => setMode('choose')} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-muted)', cursor: 'pointer', fontSize: '12px' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-table)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="或直接粘贴图片 URL..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitUrl(); }}
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text)',
                fontSize: '13px', fontFamily: 'monospace', outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={submitUrl}
              disabled={!urlInput.trim()}
              style={{
                padding: '10px 16px', background: urlInput.trim() ? 'var(--admin-accent)' : 'var(--admin-border)',
                color: urlInput.trim() ? 'var(--admin-bg)' : 'var(--admin-text-dim)', border: 'none', borderRadius: '6px',
                fontSize: '13px', cursor: urlInput.trim() ? 'pointer' : 'default', fontWeight: 500
              }}
            >
              <Link2 size={14} />
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '12px' }}>
          {mediaLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-subtle)' }}>
              <Loader2 size={24} style={{ color: 'var(--admin-accent)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : mediaItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-subtle)' }}>
              <ImageIcon size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px' }}>媒体库为空，请先上传图片</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectFromMedia(item.url)}
                  style={{
                    position: 'relative', cursor: 'pointer', borderRadius: '8px',
                    overflow: 'hidden', border: '1px solid var(--admin-border)',
                    background: 'var(--admin-table)', transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--admin-accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border)'; }}
                >
                  <div style={{ paddingTop: '75%', position: 'relative' }}>
                    <img
                      src={getFullImageUrl(item.url)}
                      alt=""
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '6px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.source}>
                      {item.source || item.filename}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--admin-text-subtle)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.url}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(getFullImageUrl(item.url));
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      padding: '4px', background: 'rgba(0,0,0,0.6)', border: 'none',
                      borderRadius: '4px', color: 'var(--admin-text)', cursor: 'pointer'
                    }}
                  >
                    {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={16} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '14px', color: 'var(--admin-text)', fontWeight: 500 }}>本地上传</span>
        </div>
        <button type="button" onClick={() => { setMode('choose'); setUploadError(''); }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-muted)', cursor: 'pointer', fontSize: '12px' }}>
          <X size={14} />
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          borderRadius: '12px', border: '2px dashed',
          borderColor: dragOver ? '#22c55e' : 'var(--admin-border)',
          background: dragOver ? 'rgba(34,197,94,0.05)' : 'transparent',
          padding: '48px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        {uploading ? (
          <div>
            <Loader2 size={32} style={{ color: '#22c55e', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: 'var(--admin-text-muted)', marginTop: '12px' }}>正在上传...</p>
          </div>
        ) : (
          <>
            <Upload size={36} style={{ color: dragOver ? '#22c55e' : 'var(--admin-text-subtle)', margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: dragOver ? '#22c55e' : 'var(--admin-text-muted)', marginTop: '16px', fontWeight: 500 }}>
              点击或拖拽上传图片
            </p>
            <p style={{ fontSize: '12px', color: 'var(--admin-text-subtle)', marginTop: '8px' }}>
              支持 JPG / PNG / WebP / GIF，最大 10MB
            </p>
          </>
        )}
      </div>
      {uploadError && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{uploadError}</p>
      )}
    </div>
  );
}

export default function WorkForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [techExpanded, setTechExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(isEdit);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      axios
        .get(`/api/works/${id}`)
        .then(res => {
          const data = res.data.data;
          const tagList: Tag[] = data.tag_list || [];
          setFormData({
            title: data.title || '',
            category: data.category || '',
            description: data.description || '',
            story: data.story || '',
            imageUrl: data.image_url || '',
            camera: data.camera || '',
            lens: data.lens || '',
            aperture: data.aperture || '',
            shutter: data.shutter || '',
            iso: String(data.iso || ''),
            location: data.location || '',
            date: data.date || '',
            featured: !!data.featured,
            sortOrder: data.sort_order || 0,
            tagIds: tagList.map((t: Tag) => t.id),
          });
        })
        .catch(() => navigate('/admin/works'))
        .finally(() => setLoadingData(false));
    }
  }, [id, isEdit, navigate]);

  const updateField = (field: string, value: string | boolean | number | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = '请输入作品标题';
    if (!formData.imageUrl) newErrors.imageUrl = '请上传作品图片';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: string) => {
    if (!validate()) return;
    status === 'draft' ? setSaving(true) : setPublishing(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        story: formData.story.trim(),
        image_url: formData.imageUrl,
        camera: formData.camera.trim() || null,
        lens: formData.lens.trim() || null,
        aperture: formData.aperture.trim() || null,
        shutter: formData.shutter.trim() || null,
        iso: Number(formData.iso) || null,
        location: formData.location.trim() || null,
        date: formData.date || null,
        featured: status === 'featured',
        sort_order: formData.sortOrder,
        tag_ids: formData.tagIds,
        status,
      };
      if (isEdit && id) {
        await axios.put(`/api/works/${id}`, payload);
      } else {
        await axios.post('/api/works', payload);
      }
      navigate('/admin/works');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ message: error.response?.data?.error || error.message || '保存失败，请重试', type: 'error' });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="text-admin-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] text-admin-text font-serif mb-1">
            {isEdit ? '编辑作品' : '新建作品'}
          </h1>
          <p className="text-sm text-admin-text-dim/40 italic">
            {isEdit ? '修改作品信息与展示设置' : '添加新的摄影作品到您的作品集'}
          </p>
        </div>
        <button onClick={handleCancel} className="px-6 py-3 bg-transparent border border-admin-border text-admin-text-dim rounded-lg hover:border-admin-text-dim transition-colors flex items-center gap-1.5">
          <X size={16} /> 取消
        </button>
      </div>

      <form onSubmit={e => e.preventDefault()} noValidate>
        <section className="bg-admin-card rounded-xl border border-admin-border px-7 py-6">
          <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">基本信息</h2>

          <div className="mb-[18px]">
            <AdminInput
              label="标题"
              value={formData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="输入作品标题"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1.5">{errors.title}</p>}
          </div>

          <div className="mb-[18px]">
            <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">分类 <span className="text-red-400">*</span></label>
            <select
              value={formData.category}
              onChange={e => updateField('category', e.target.value)}
              className="w-full px-4 py-3.5 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none focus:border-admin-accent transition-colors cursor-pointer"
            >
              <option value="" className="bg-admin-card text-admin-text-dim">选择分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug} className="bg-admin-card text-admin-text">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-[18px]">
            <AdminTextarea
              label="描述"
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="简短描述该作品..."
            />
          </div>

          <div className="mb-[18px]">
            <AdminTextarea
              label="创作故事"
              rows={5}
              value={formData.story}
              onChange={e => updateField('story', e.target.value)}
              placeholder="讲述这张作品背后的故事..."
            />
          </div>
        </section>

        <section className="bg-admin-card rounded-xl border border-admin-border px-7 py-6 mt-6">
          <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">作品图片</h2>
          <div className="mb-[18px]">
            <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">图片 <span className="text-red-400">*</span></label>
            {!formData.imageUrl ? (
              <ImagePicker onSelect={(url) => updateField('imageUrl', url)} />
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-admin-border">
                <img src={formData.imageUrl} alt="" className="w-full max-h-[360px] object-contain bg-admin-table" />
                <button
                  onClick={() => updateField('imageUrl', '')}
                  className="absolute top-2.5 right-2.5 px-3 py-2 bg-black/70 border-none rounded-lg text-white cursor-pointer text-[13px] flex items-center gap-1.5"
                >
                  <X size={14} /> 移除
                </button>
              </div>
            )}
            {errors.imageUrl && <p className="text-red-400 text-xs mt-2.5">{errors.imageUrl}</p>}
          </div>
        </section>

        <section className="bg-admin-card rounded-xl border border-admin-border px-7 py-6 mt-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setTechExpanded(!techExpanded)}
            className="w-full flex items-center justify-between py-6 px-7 bg-transparent border-none text-admin-text cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Camera size={16} className="text-admin-accent" />
              <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">拍摄参数</h2>
            </div>
            {techExpanded ? <ChevronUp size={18} className="text-admin-text-dim/40" /> : <ChevronDown size={18} className="text-admin-text-dim/40" />}
          </button>

          {techExpanded && (
            <div className="px-7 pb-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="mb-[18px]">
                <AdminInput
                  label="相机"
                  value={formData.camera}
                  onChange={e => updateField('camera', e.target.value)}
                  placeholder="如: Sony A7R V"
                />
              </div>
              <div className="mb-[18px]">
                <AdminInput
                  label="镜头"
                  value={formData.lens}
                  onChange={e => updateField('lens', e.target.value)}
                  placeholder="如: 24-70mm f/2.8"
                />
              </div>
              <div className="mb-[18px]">
                <label className="flex items-center gap-1.5 text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">
                  <Aperture size={12} className="text-admin-text/35" /> 光圈
                </label>
                <input value={formData.aperture} onChange={e => updateField('aperture', e.target.value)} placeholder="如: f/2.8" className="w-full py-3.5 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-[15px] outline-none transition-colors focus:border-admin-accent" />
              </div>
              <div className="mb-[18px]">
                <AdminInput
                  label="快门速度"
                  value={formData.shutter}
                  onChange={e => updateField('shutter', e.target.value)}
                  placeholder="如: 1/250s"
                />
              </div>
              <div className="mb-[18px]">
                <AdminInput
                  label="ISO"
                  type="number"
                  value={formData.iso}
                  onChange={e => updateField('iso', e.target.value)}
                  placeholder="如: 100"
                />
              </div>
              <div className="mb-[18px]">
                <label className="flex items-center gap-1.5 text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">
                  <MapPin size={12} className="text-admin-text/35" /> 拍摄地点
                </label>
                <input value={formData.location} onChange={e => updateField('location', e.target.value)} placeholder="如: 上海陆家嘴" className="w-full py-3.5 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-[15px] outline-none transition-colors focus:border-admin-accent" />
              </div>
              <div className="mb-[18px] col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">
                  <Calendar size={12} className="text-admin-text/35" /> 拍摄日期
                </label>
                <input type="date" value={formData.date} onChange={e => updateField('date', e.target.value)} className="w-full py-3.5 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-[15px] outline-none transition-colors focus:border-admin-accent font-mono" />
              </div>
            </div>
          )}
        </section>

        <section className="bg-admin-card rounded-xl border border-admin-border px-7 py-6 mt-6">
          <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">展示设置</h2>

          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-admin-text/80">设为精选</span>
            <button
              type="button"
              onClick={() => updateField('featured', !formData.featured)}
              className={`relative w-11 h-6 rounded-full border-0 cursor-pointer p-0 transition-colors duration-200 ${formData.featured ? 'bg-admin-accent' : 'bg-admin-border-light'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${formData.featured ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="mb-[18px]">
            <AdminInput
              label="排序权重"
              type="number"
              value={String(formData.sortOrder)}
              onChange={e => updateField('sortOrder', Number(e.target.value))}
            />
          </div>
          <p className="text-[11px] text-admin-text/35 -mt-2.5 mb-[18px]">数值越大越靠前</p>

          <div className="mb-[18px]">
            <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">标签</label>
            <TagSelector
              selectedIds={formData.tagIds}
              onChange={(ids) => updateField('tagIds', ids)}
            />
          </div>
        </section>

        <div className="flex flex-col gap-2.5 pt-6 items-end">
          <div className="flex gap-2.5">
            <button type="button" onClick={() => handleSubmit('draft')} disabled={saving || publishing} className={`px-6 py-3 bg-transparent border border-admin-border text-admin-text-dim rounded-lg hover:border-admin-text-dim transition-colors flex items-center gap-1 ${saving || publishing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              保存草稿
            </button>
            <button type="button" onClick={() => handleSubmit(formData.featured ? 'featured' : 'active')} disabled={saving || publishing} className={`px-6 py-3 bg-admin-accent text-admin-bg rounded-lg font-semibold tracking-wider hover:bg-admin-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}>
              {publishing ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              发布作品
            </button>
          </div>
          <button type="button" onClick={handleCancel} className="px-6 py-3 bg-transparent border border-admin-border text-admin-text-dim rounded-lg hover:border-admin-text-dim transition-colors self-start">取消编辑</button>
        </div>
      </form>
    </div>
  );
}
