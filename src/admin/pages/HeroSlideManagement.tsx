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
  onSave: (data: any) => void;
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
      className="bg-admin-surface border border-admin-border rounded-lg shadow-xl"
    >
      <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          {slide?.id ? '编辑轮播图' : '添加轮播图'}
        </h3>
        <button onClick={onCancel} className="text-admin-text-muted hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
            标题 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
            placeholder="请输入标题"
            maxLength={200}
          />
        </div>

        {/* 副标题 */}
        <div>
          <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
            副标题
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
            placeholder="例如: LIGHT, NATURE 等"
            maxLength={200}
          />
        </div>

        {/* 图片 URL */}
        <div>
          <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
            图片 URL <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
            placeholder="https://picsum.photos/seed/example/1920/1280"
          />
          {formData.image_url && (
            <div className="mt-2 rounded overflow-hidden border border-admin-border max-h-[200px]">
              <img 
                src={formData.image_url} 
                alt="预览" 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
            描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm resize-none"
            rows={3}
            placeholder="请输入描述内容"
            maxLength={500}
          />
        </div>

        {/* 按钮 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
              按钮文字
            </label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
              placeholder="例如: 探索更多"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
              按钮链接
            </label>
            <input
              type="text"
              value={formData.button_link}
              onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
              className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
              placeholder="/portfolio"
            />
          </div>
        </div>

        {/* 过渡动画 */}
        <div>
          <label className="block text-sm font-medium text-admin-text-muted mb-2">
            <Settings size={14} className="inline-block mr-1" />
            过渡动画
          </label>
          <div className="grid grid-cols-3 gap-2">
            {transitionEffects.map((effect) => (
              <button
                key={effect.value}
                onClick={() => setFormData({ ...formData, transition_effect: effect.value })}
                className={`p-2.5 rounded border text-left transition-all ${
                  formData.transition_effect === effect.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-admin-border hover:border-admin-border-light text-admin-text-muted'
                }`}
              >
                <div className="text-xs font-medium">{effect.label}</div>
                <div className="text-[10px] text-admin-text-muted/60 mt-0.5 truncate">{effect.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 动画参数 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
              动画速度 (ms)
            </label>
            <input
              type="number"
              value={formData.transition_speed}
              onChange={(e) => setFormData({ ...formData, transition_speed: parseInt(e.target.value) || 1000 })}
              className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
              min={500}
              max={3000}
              step={100}
            />
            <p className="text-[10px] text-admin-text-muted/60 mt-1">推荐: 800-2000ms</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text-muted mb-1.5">
              自动播放间隔 (ms)
            </label>
            <input
              type="number"
              value={formData.autoplay_delay}
              onChange={(e) => setFormData({ ...formData, autoplay_delay: parseInt(e.target.value) || 5000 })}
              className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded text-white text-sm"
              min={3000}
              max={15000}
              step={500}
            />
            <p className="text-[10px] text-admin-text-muted/60 mt-1">推荐: 3000-8000ms</p>
          </div>
        </div>

        {/* 状态 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormData({ ...formData, is_active: formData.is_active ? 0 : 1 })}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              formData.is_active 
                ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
            }`}
          >
            {formData.is_active ? '已启用' : '已禁用'}
          </button>
          <p className="text-xs text-admin-text-muted/60">禁用后该轮播图不会在首页显示</p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-admin-border flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-admin-text-muted hover:text-white transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={loading || !formData.title || !formData.image_url}
          className="px-4 py-2 text-sm bg-accent text-primary font-medium rounded hover:bg-accent-light transition-all disabled:opacity-50 flex items-center gap-2"
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

  const handleSave = async (data: any) => {
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-white">首页轮播图管理</h2>
          <p className="text-sm text-admin-text-muted mt-1">管理首页顶部轮播图，支持多种过渡动画效果</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-accent text-primary rounded font-medium hover:bg-accent-light transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          添加轮播图
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-600/10 border border-red-600/20 rounded flex items-center gap-2 text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      ) : (
        <>
          {/* 轮播图列表 */}
          <div className="space-y-4">
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-admin-surface border rounded-lg overflow-hidden ${
                    slide.is_active ? 'border-admin-border' : 'border-admin-border/30 opacity-60'
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* 序号 */}
                    <div className="w-12 flex items-center justify-center bg-admin-surface-light">
                      <span className="text-2xl font-bold text-admin-text-muted/30">{index + 1}</span>
                    </div>

                    {/* 图片预览 */}
                    <div className="w-48 h-28 bg-admin-surface-light overflow-hidden flex-shrink-0">
                      <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-white">{slide.title}</h3>
                        {slide.subtitle && (
                          <span className="px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded border border-accent/20">
                            {slide.subtitle}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-admin-text-muted line-clamp-1 mb-2">{slide.description || '暂无描述'}</p>
                      <div className="flex items-center gap-4 text-xs text-admin-text-muted/60">
                        <span className="flex items-center gap-1">
                          <Image size={12} />
                          {transitionEffects.find(e => e.value === slide.transition_effect)?.label || slide.transition_effect}
                        </span>
                        <span>速度: {slide.transition_speed}ms</span>
                        <span>间隔: {slide.autoplay_delay}ms</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col items-center gap-1 px-3 py-2 bg-admin-surface-light/30">
                      {/* 上下移动 */}
                      <div className="flex gap-1 mb-2">
                        <button
                          onClick={() => handleMoveSlide(slide, 'up')}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-admin-surface-light rounded disabled:opacity-30 transition-colors"
                          title="上移"
                        >
                          <ArrowUp size={14} className="text-admin-text-muted" />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(slide, 'down')}
                          disabled={index === slides.length - 1}
                          className="p-1.5 hover:bg-admin-surface-light rounded disabled:opacity-30 transition-colors"
                          title="下移"
                        >
                          <ArrowDown size={14} className="text-admin-text-muted" />
                        </button>
                      </div>

                      {/* 状态切换 */}
                      <button
                        onClick={() => handleToggleActive(slide)}
                        className="p-1.5 hover:bg-admin-surface-light rounded transition-colors"
                        title={slide.is_active ? '禁用' : '启用'}
                      >
                        {slide.is_active ? (
                          <Eye size={14} className="text-green-400" />
                        ) : (
                          <EyeOff size={14} className="text-admin-text-muted" />
                        )}
                      </button>

                      {/* 编辑 */}
                      <button
                        onClick={() => openEditModal(slide)}
                        className="p-1.5 hover:bg-admin-surface-light rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={14} className="text-admin-text-muted" />
                      </button>

                      {/* 删除 */}
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-1.5 hover:bg-red-600/20 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {slides.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-admin-text-muted">
              <Image size={48} className="mb-4 text-admin-text-muted/30" />
              <p className="text-lg">暂无轮播图</p>
              <p className="text-sm mt-2">点击"添加轮播图"开始创建</p>
            </div>
          )}
        </>
      )}

      {/* 编辑/添加模态框 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-2xl z-10">
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
