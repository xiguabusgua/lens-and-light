import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Save, Loader2, Grid3X3, User, Mountain, Camera, Briefcase, FileImage } from 'lucide-react';
import { AdminModal, AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, AdminInput, AdminTextarea, AdminToast } from '@/admin/components';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  work_count: number;
}

const ICON_OPTIONS = [
  { value: 'Grid3X3', icon: Grid3X3, label: '网格' },
  { value: 'User', icon: User, label: '人物' },
  { value: 'Mountain', icon: Mountain, label: '风景' },
  { value: 'Camera', icon: Camera, label: '相机' },
  { value: 'Briefcase', icon: Briefcase, label: '商业' },
  { value: 'FileImage', icon: FileImage, label: '图片' },
];

const initialFormState = {
  name: '',
  slug: '',
  description: '',
  icon: 'Grid3X3',
  sort_order: 0,
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCategory(null);
    setFormData(initialFormState);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon,
      sort_order: cat.sort_order,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && !editingCategory) {
      const slug = (value as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入分类名称';
    if (!formData.slug.trim()) newErrors.slug = '请输入 slug';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon,
        sort_order: formData.sort_order,
      };

      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, payload);
      } else {
        await axios.post('/api/categories', payload);
      }

      closeModal();
      fetchCategories();
      setToast({ type: 'success', message: editingCategory ? '分类已更新' : '分类已创建' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此分类吗？')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
      setToast({ type: 'success', message: '分类已删除' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ type: 'error', message: error.response?.data?.error || error.message || '删除失败' });
    } finally {
      setDeletingId(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.value === iconName);
    const Icon = option?.icon || Grid3X3;
    return <Icon size={18} className="text-admin-accent" />;
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] text-admin-text font-[Georgia,serif] mb-1">分类管理</h1>
          <p className="text-sm text-admin-text-dim">管理作品分类，共 {categories.length} 个分类</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 hover:bg-admin-accent-hover transition-colors"
        >
          <Plus size={16} /> 新建分类
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <Loader2 size={32} className="text-admin-accent animate-spin mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <p className="text-base mb-2">暂无分类</p>
          <p className="text-[13px]">点击上方按钮创建第一个分类</p>
        </div>
      ) : (
        <AdminTable>
          <AdminTHead>
            <AdminTh>图标</AdminTh>
            <AdminTh>名称</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>描述</AdminTh>
            <AdminTh className="text-right">作品数</AdminTh>
            <AdminTh className="text-right">排序</AdminTh>
            <AdminTh className="text-right">操作</AdminTh>
          </AdminTHead>
          <tbody>
            {categories.map((cat, i) => (
              <AdminTr key={cat.id} index={i}>
                <AdminTd>
                  <div className="w-10 h-10 rounded-lg bg-admin-accent/10 flex items-center justify-center">
                    {getIconComponent(cat.icon)}
                  </div>
                </AdminTd>
                <AdminTd>
                  <span className="text-sm text-admin-text font-[Georgia,serif]">{cat.name}</span>
                </AdminTd>
                <AdminTd>
                  <span className="text-[11px] text-admin-text-subtle font-mono">/{cat.slug}</span>
                </AdminTd>
                <AdminTd>
                  {cat.description ? (
                    <span className="text-xs text-admin-text-dim truncate block max-w-[200px]">{cat.description}</span>
                  ) : (
                    <span className="text-xs text-admin-text-subtle">-</span>
                  )}
                </AdminTd>
                <AdminTd className="text-right text-sm text-admin-text-dim">{cat.work_count} 个作品</AdminTd>
                <AdminTd className="text-right">
                  <span className="text-[11px] text-admin-text-subtle font-mono">#{cat.sort_order}</span>
                </AdminTd>
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-md text-admin-text-dim hover:text-admin-text hover:bg-white/5 transition-colors"
                      aria-label="编辑分类"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      aria-label="删除分类"
                    >
                      {deletingId === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
        title={editingCategory ? '编辑分类' : '新建分类'}
        width="max-w-lg"
      >
        <AdminInput
          label="名称 *"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="如: 风光"
        />
        {errors.name && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.name}</p>}

        <AdminInput
          label="Slug *"
          value={formData.slug}
          onChange={e => updateField('slug', e.target.value)}
          placeholder="如: landscape"
          className="font-mono"
        />
        {errors.slug && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.slug}</p>}

        <AdminTextarea
          label="描述"
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          placeholder="分类描述..."
          rows={2}
        />

        <div className="mb-5">
          <label className="block text-xs text-admin-text-muted mb-2 font-medium tracking-wide">图标</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map(opt => {
              const IconComp = opt.icon;
              const isActive = formData.icon === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateField('icon', opt.value)}
                  className={`flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-lg text-[10px] cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-admin-accent/15 border border-admin-accent text-admin-accent'
                      : 'bg-admin-table border border-admin-border-light text-admin-text-dim'
                  }`}
                >
                  <IconComp size={18} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AdminInput
          label="排序"
          type="number"
          value={formData.sort_order}
          onChange={e => updateField('sort_order', parseInt(e.target.value) || 0)}
          min={0}
          className="w-[120px] font-mono"
        />

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
