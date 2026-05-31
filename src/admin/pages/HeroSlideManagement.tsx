import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  AlertCircle,
  X,
  Settings,
  Save
} from 'lucide-react';
import axios from 'axios';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  transition_effect: string;
  transition_speed: number;
  autoplay_delay: number;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const transitionEffects = [
  { value: 'fade', label: '淡入淡出', description: '平滑的透明度渐变过渡' },
  { value: 'slide', label: '滑动', description: '左右滑动切换' },
  { value: 'coverflow', label: '3D 翻转', description: '3D 透视翻转效果' },
  { value: 'cube', label: '立方体', description: '3D 立方体旋转' },
  { value: 'flip', label: '翻转', description: '3D 垂直翻转' },
  { value: 'cards', label: '卡片', description: '卡片滑动效果' },
];

function SlideForm({
  slide,
  onSave,
  onCancel,
  loading
}: {
  slide: Partial<HeroSlide> | null;
  onSave: (data: { title: string; subtitle: string; image_url: string; description: string; button_text: string; button_link: string; transition_effect: string; transition_speed: number; autoplay_delay: number; is_active: number }) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    image_url: slide?.image_url || '',
    description: slide?.description || '',
    button_text: slide?.button_text || '',
    button_link: slide?.button_link || '',
    transition_effect: slide?.transition_effect || 'fade',
    transition_speed: slide?.transition_speed || 1200,
    autoplay_delay: slide?.autoplay_delay || 5000,
    is_active: slide?.is_active !== undefined ? slide.is_active : 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-admin-card rounded-xl border border-admin-border shadow-2xl"
    >
      <div className="px-6 py-4 border-b border-admin-border-light flex items-center justify-between">
        <h3 className="text-lg font-medium text-admin-text">
          {slide?.id ? '编辑轮播图' : '添加轮播图'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-admin-raised text-admin-text-muted hover:text-admin-text transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">
              标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              placeholder="请输入标题"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">副标题</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              placeholder="例如: LIGHT, NATURE"
              maxLength={200}
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">
            图片 URL <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
            placeholder="https://picsum.photos/seed/example/1920/1280"
          />
          {formData.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden border border-admin-border-light max-h-48">
              <img
                src={formData.image_url}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm resize-none outline-none focus:border-admin-accent transition-colors"
            rows={3}
            placeholder="请输入描述内容"
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">按钮文字</label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              placeholder="例如: 探索更多"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">按钮链接</label>
            <input
              type="text"
              value={formData.button_link}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              placeholder="/portfolio"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-admin-text-dim mb-2">
            <Settings size={13} className="inline-block mr-1" />
            过渡动画
          </label>
          <div className="grid grid-cols-3 gap-2">
            {transitionEffects.map((effect) => (
              <button
                key={effect.value}
                onClick={() => setFormData({ ...formData, transition_effect: effect.value })}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  formData.transition_effect === effect.value
                    ? 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                    : 'border-admin-border-light hover:border-admin-accent text-admin-text-dim hover:text-admin-text'
                }`}
              >
                <div className="text-xs font-medium">{effect.label}</div>
                <div className="text-[10px] text-admin-text-subtle mt-0.5 truncate">{effect.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">动画速度 (ms)</label>
            <input
              type="number"
              value={formData.transition_speed}
              onChange={(e) => setFormData({ ...formData, transition_speed: parseInt(e.target.value) || 1000 })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              min={500}
              max={3000}
              step={100}
            />
            <p className="text-[10px] text-admin-text-subtle mt-1">推荐: 800-2000ms</p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-admin-text-dim mb-1.5">自动播放间隔 (ms)</label>
            <input
              type="number"
              value={formData.autoplay_delay}
              onChange={(e) => setFormData({ ...formData, autoplay_delay: parseInt(e.target.value) || 5000 })}
              className="w-full px-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors"
              min={3000}
              max={15000}
              step={500}
            />
            <p className="text-[10px] text-admin-text-subtle mt-1">推荐: 3000-8000ms</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormData({ ...formData, is_active: formData.is_active ? 0 : 1 })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              formData.is_active
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-admin-raised text-admin-text-dim border border-admin-border-light'
            }`}
          >
            {formData.is_active ? '已启用' : '已禁用'}
          </button>
          <p className="text-[12px] text-admin-text-subtle">禁用后该轮播图不会在首页显示</p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-admin-border-light flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-admin-text-dim hover:text-admin-text transition-colors cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={loading || !formData.title || !formData.image_url}
          className="px-4 py-2 text-sm bg-admin-accent text-admin-bg font-medium rounded hover:bg-admin-accent/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          保存
        </button>
      </div>
    </motion.div>
  );
}

export default function HeroSlideManagement() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hero-slides', { params: { sort: 'sort_order' } });
      setSlides(res.data.data || []);
      setError('');
    } catch (err) {
      setError('获取轮播图列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  // ...

  const handleSave = async (data: {
    title: string;
    subtitle: string;
    image_url: string;
    description: string;
    button_text: string;
    button_link: string;
    transition_effect: string;
    transition_speed: number;
    autoplay_delay: number;
    is_active: number;
  }) => {
    setSaving(true);
    try {
      if (editingSlide?.id) {
        await axios.put(`/api/hero-slides/${editingSlide.id}`, data);
      } else {
        await axios.post('/api/hero-slides', data);
      }
      setIsModalOpen(false);
      setEditingSlide(null);
      fetchSlides();
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个轮播图吗？')) return;
    try {
      await axios.delete(`/api/hero-slides/${id}`);
      fetchSlides();
    } catch (err) {
      setError('删除失败，请重试');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await axios.put(`/api/hero-slides/${slide.id}`, { is_active: slide.is_active ? 0 : 1 });
      fetchSlides();
    } catch (err) {
      setError('更新状态失败');
    }
  };

  const handleMoveSlide = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === slide.id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) {
      return;
    }
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...slides];
    const temp = newOrder[index];
    newOrder[index] = newOrder[swapIndex];
    newOrder[swapIndex] = temp;
    
    const orders = newOrder.map((s, i) => ({ id: s.id, sort_order: i }));
    
    try {
      await axios.put('/api/hero-slides/reorder', { orders });
      fetchSlides();
    } catch (err) {
      setError('排序更新失败');
    }
  };

  const openAddModal = () => {
    setEditingSlide(null);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] text-admin-text font-serif mb-1">轮播图管理</h2>
          <p className="text-sm text-admin-text-dim">管理首页轮播图，支持多种过渡动画效果</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-[18px] py-2 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-admin-accent/90 transition-all"
        >
          <Plus size={16} />
          添加轮播图
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-admin-accent animate-spin" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-admin-text-subtle">
          <div className="w-16 h-16 rounded-full border border-admin-border flex items-center justify-center mb-4">
            <Image size={24} />
          </div>
          <p className="text-base text-admin-text-dim mb-1">暂无轮播图</p>
          <p className="text-[13px]">点击"添加轮播图"开始创建</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`bg-admin-card border rounded-xl overflow-hidden transition-colors ${
                  slide.is_active ? 'border-admin-border' : 'border-admin-border-light/50'
                }`}
              >
                <div className="flex items-stretch">
                  <div className="w-12 flex items-center justify-center bg-admin-table border-r border-admin-border-light/50">
                    <span className="text-2xl font-serif text-admin-text-subtle">{index + 1}</span>
                  </div>

                  <div className="w-40 h-28 bg-admin-table overflow-hidden flex-shrink-0">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>

                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] text-admin-text font-medium truncate">{slide.title}</h3>
                      {slide.subtitle && (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] bg-admin-accent/10 text-admin-accent rounded border border-admin-accent/20">
                          {slide.subtitle}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-admin-text-dim line-clamp-1 mb-2">{slide.description || '暂无描述'}</p>
                    <div className="flex items-center gap-4 text-[11px] text-admin-text-subtle">
                      <span>{transitionEffects.find(e => e.value === slide.transition_effect)?.label || slide.transition_effect}</span>
                      <span>速度 {slide.transition_speed}ms</span>
                      <span>间隔 {slide.autoplay_delay}ms</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-admin-table border-l border-admin-border-light/30">
                    <div className="flex gap-0.5 mb-1">
                      <button
                        onClick={() => handleMoveSlide(slide, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded hover:bg-admin-raised disabled:opacity-30 transition-colors cursor-pointer"
                        title="上移"
                      >
                        <ArrowUp size={13} className="text-admin-text-dim" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(slide, 'down')}
                        disabled={index === slides.length - 1}
                        className="p-1.5 rounded hover:bg-admin-raised disabled:opacity-30 transition-colors cursor-pointer"
                        title="下移"
                      >
                        <ArrowDown size={13} className="text-admin-text-dim" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleActive(slide)}
                      className="p-1.5 rounded hover:bg-admin-raised transition-colors cursor-pointer"
                      title={slide.is_active ? '禁用' : '启用'}
                    >
                      {slide.is_active
                        ? <Eye size={13} className="text-emerald-500" />
                        : <EyeOff size={13} className="text-admin-text-dim" />
                      }
                    </button>

                    <button
                      onClick={() => openEditModal(slide)}
                      className="p-1.5 rounded hover:bg-admin-raised transition-colors cursor-pointer"
                      title="编辑"
                    >
                      <Edit2 size={13} className="text-admin-text-dim" />
                    </button>

                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="删除"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => { setIsModalOpen(false); setEditingSlide(null); }}
            />
            <div className="relative w-full max-w-xl z-10">
              <SlideForm
                slide={editingSlide}
                onSave={handleSave}
                onCancel={() => { setIsModalOpen(false); setEditingSlide(null); }}
                loading={saving}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
