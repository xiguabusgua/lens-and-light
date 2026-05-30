import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Save, Loader2, Search, TagIcon } from 'lucide-react';
import { AdminModal, AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, AdminInput, StatusBadge, AdminToast } from '@/admin/components';

interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
}

const initialFormState = { name: '', slug: '' };

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchTags(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags', { params: { search: searchQuery } });
      setTags(res.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTag(null);
    setFormData(initialFormState);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTag(null);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && !editingTag) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入标签名称';
    if (!formData.slug.trim()) newErrors.slug = '请输入 slug';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: formData.name.trim(), slug: formData.slug.trim() };
      if (editingTag) {
        await axios.put(`/api/tags/${editingTag.id}`, payload);
      } else {
        await axios.post('/api/tags', payload);
      }
      closeModal();
      fetchTags();
      setToast({ type: 'success', message: editingTag ? '标签已更新' : '标签已创建' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此标签吗？')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/tags/${id}`);
      fetchTags();
      setToast({ type: 'success', message: '标签已删除' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '删除失败' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] text-admin-text font-[Georgia,serif] mb-1">标签管理</h1>
          <p className="text-sm text-admin-text-dim">管理作品标签，共 {tags.length} 个标签</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 hover:bg-admin-accent-hover transition-colors"
        >
          <Plus size={16} /> 新建标签
        </button>
      </div>

      <div className="relative mb-5 max-w-[320px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-subtle" />
        <input
          type="text"
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-[34px] pr-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text/80 text-[13px] outline-none focus:border-admin-accent transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <Loader2 size={32} className="text-admin-accent animate-spin mx-auto" />
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <p className="text-base mb-2">
            {searchQuery ? '未找到匹配的标签' : '暂无标签'}
          </p>
          <p className="text-[13px]">
            {searchQuery ? '尝试更换搜索关键词' : '点击上方按钮创建第一个标签'}
          </p>
        </div>
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>名称</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh className="text-right">使用次数</AdminTh>
            <AdminTh className="text-right">操作</AdminTh>
          </AdminTHead>
          <tbody>
            {tags.map((tag, i) => (
              <AdminTr key={tag.id} index={i}>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <TagIcon size={14} className="text-admin-accent shrink-0" />
                    <span className="text-admin-text text-sm">{tag.name}</span>
                  </div>
                </AdminTd>
                <AdminTd>
                  <StatusBadge variant="neutral">{tag.slug}</StatusBadge>
                </AdminTd>
                <AdminTd className="text-right text-admin-text-dim text-sm">{tag.usage_count}次</AdminTd>
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(tag)}
                      className="p-1.5 rounded-md text-admin-text-dim hover:text-admin-text hover:bg-white/5 transition-colors"
                      aria-label="编辑标签"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      aria-label="删除标签"
                    >
                      {deletingId === tag.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <AdminModal
        open={showModal}
        onClose={closeModal}
        title={editingTag ? '编辑标签' : '新建标签'}
        width="max-w-md"
      >
        <AdminInput
          label="名称 *"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="如: 城市"
        />
        {errors.name && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.name}</p>}

        <AdminInput
          label="Slug *"
          value={formData.slug}
          onChange={e => updateField('slug', e.target.value)}
          placeholder="如: city"
          className="font-mono"
        />
        {errors.slug && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.slug}</p>}

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
