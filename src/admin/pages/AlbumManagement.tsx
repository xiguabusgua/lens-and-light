import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Save, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '@/lib/utils';
import { AdminModal, AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, AdminInput, AdminTextarea, AdminToast } from '@/admin/components';

interface Album {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  work_count: number;
  created_at: string;
  updated_at: string;
  first_work_image?: string;
}

const initialFormState = {
  title: '',
  slug: '',
  description: '',
};

export default function AlbumManagement() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await axios.get('/api/albums');
      const albumList: Album[] = res.data.data || [];

      const albumsWithCovers = await Promise.all(
        albumList.map(async (album) => {
          if (album.work_count > 0) {
            try {
              const worksRes = await axios.get(`/api/albums/${album.slug}/works`, { params: { limit: 1 } });
              const works = worksRes.data.data || [];
              if (works.length > 0) {
                return {
                  ...album,
                  first_work_image: works[0].image_url || works[0].thumbnail_url
                };
              }
            } catch (err) {
            }
          }
          return album;
        })
      );

      setAlbums(albumsWithCovers);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingAlbum(null);
    setFormData(initialFormState);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      slug: album.slug,
      description: album.description || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAlbum(null);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !editingAlbum) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = '请输入相册标题';
    if (!formData.slug.trim()) newErrors.slug = '请输入 slug';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      };

      if (editingAlbum) {
        await axios.put(`/api/albums/${editingAlbum.id}`, payload);
      } else {
        await axios.post('/api/albums', payload);
      }

      closeModal();
      fetchAlbums();
      setToast({ type: 'success', message: editingAlbum ? '相册已更新' : '相册已创建' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此相册吗？删除后无法恢复！')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/albums/${id}`);
      fetchAlbums();
      setToast({ type: 'success', message: '相册已删除' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '删除失败' });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const coverUrl = (album: Album) => album.cover_image || album.first_work_image;

  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] text-admin-text font-[Georgia,serif] mb-1">相册管理</h1>
          <p className="text-sm text-admin-text-dim">管理相册列表，共 {albums.length} 个相册</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 hover:bg-admin-accent-hover transition-colors"
        >
          <Plus size={16} /> 新建相册
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <Loader2 size={32} className="text-admin-accent animate-spin mx-auto" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <ImageIcon size={48} className="text-admin-text-subtle mx-auto mb-4" />
          <p className="text-base mb-2">暂无相册</p>
          <p className="text-[13px]">点击上方按钮创建第一个相册</p>
        </div>
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>封面</AdminTh>
            <AdminTh>标题</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>描述</AdminTh>
            <AdminTh className="text-right">作品数</AdminTh>
            <AdminTh className="text-right">创建时间</AdminTh>
            <AdminTh className="text-right">操作</AdminTh>
          </AdminTHead>
          <tbody>
            {albums.map((album, i) => {
              const imgUrl = coverUrl(album);
              return (
                <AdminTr key={album.id} index={i}>
                  <AdminTd>
                    <div
                      className="w-12 h-12 rounded-lg bg-admin-raised flex items-center justify-center overflow-hidden bg-cover bg-center"
                      style={imgUrl ? { backgroundImage: `url(${getFullImageUrl(imgUrl)})` } : { backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' }}
                    >
                      {!imgUrl && <ImageIcon size={20} className="text-admin-text-subtle" />}
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <span className="text-sm text-admin-text font-[Georgia,serif]">{album.title}</span>
                  </AdminTd>
                  <AdminTd>
                    <span className="text-[11px] text-admin-text-subtle font-mono">/{album.slug}</span>
                  </AdminTd>
                  <AdminTd>
                    {album.description ? (
                      <span className="text-xs text-admin-text-dim truncate block max-w-[180px]">{album.description}</span>
                    ) : (
                      <span className="text-xs text-admin-text-subtle">-</span>
                    )}
                  </AdminTd>
                  <AdminTd className="text-right">
                    <span className="text-sm text-admin-text-dim flex items-center justify-end gap-1">
                      <ImageIcon size={12} /> {album.work_count} 个作品
                    </span>
                  </AdminTd>
                  <AdminTd className="text-right">
                    <span className="text-[11px] text-admin-text-subtle">{formatDate(album.created_at)}</span>
                  </AdminTd>
                  <AdminTd className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/albums/${album.slug}`)}
                        className="p-1.5 rounded-md text-admin-text-dim hover:text-admin-text hover:bg-white/5 transition-colors"
                        title="查看前台"
                        aria-label="查看前台"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(album)}
                        className="p-1.5 rounded-md text-admin-text-dim hover:text-admin-text hover:bg-white/5 transition-colors"
                        aria-label="编辑相册"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        disabled={deletingId === album.id}
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        aria-label="删除相册"
                      >
                        {deletingId === album.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </AdminTd>
                </AdminTr>
              );
            })}
          </tbody>
        </AdminTable>
      )}

      <AdminModal
        open={showModal}
        onClose={closeModal}
        title={editingAlbum ? '编辑相册' : '新建相册'}
        width="max-w-lg"
      >
        <AdminInput
          label="标题 *"
          value={formData.title}
          onChange={e => updateField('title', e.target.value)}
          placeholder="如: 2024年度精选"
        />
        {errors.title && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.title}</p>}

        <AdminInput
          label="Slug *"
          value={formData.slug}
          onChange={e => updateField('slug', e.target.value)}
          placeholder="如: 2024-collection"
          className="font-mono"
        />
        {errors.slug && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.slug}</p>}

        <AdminTextarea
          label="描述"
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          placeholder="相册描述..."
          rows={3}
        />

        <div className="mb-5">
          <label className="block text-xs text-admin-text-muted mb-2 font-medium tracking-wide">封面图片</label>
          <div className="p-4 bg-admin-accent/10 border border-admin-accent/20 rounded-lg flex items-center gap-3">
            <ImageIcon size={20} className="text-admin-accent shrink-0" />
            <p className="text-[13px] text-admin-text-muted m-0 leading-relaxed">
              封面将自动使用相册中<strong className="text-admin-accent">第一张作品</strong>的图片。
              <br />
              <span className="text-xs text-admin-text-dim">添加作品到相册后，封面会自动更新</span>
            </p>
          </div>
          {editingAlbum && coverUrl(editingAlbum) && (
            <div className="mt-3 rounded-lg overflow-hidden h-[140px] bg-admin-table">
              <img
                src={getFullImageUrl(coverUrl(editingAlbum)!)}
                alt="当前封面"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 justify-end mt-2">
          <button
            onClick={closeModal}
            className="px-[18px] py-2.5 bg-transparent border border-admin-border-light text-admin-text/70 rounded-lg text-[13px] cursor-pointer flex items-center gap-1.5 hover:text-admin-text hover:border-admin-border transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 hover:bg-admin-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            保存
          </button>
        </div>
      </AdminModal>

      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
