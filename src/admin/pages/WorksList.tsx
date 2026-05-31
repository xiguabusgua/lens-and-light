import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, Grid3X3, List, Star, Calendar, GripVertical, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { cn, getCategoryLabel, handleApiError, formatDate, formatMonth, type ApiWork } from '@/lib/utils';

// Toast component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border',
        type === 'success'
          ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
          : 'bg-red-950 border-red-800 text-red-300'
      )}
    >
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function StatusBadge({ variant = 'default', children }: { variant?: 'success' | 'warning' | 'accent' | 'default'; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    accent: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    default: 'bg-admin-raised text-admin-text-muted border-admin-border-light',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border', styles[variant])}>
      {children}
    </span>
  );
}

function SortableWorkCard({
  work,
  navigate,
  isSortMode,
}: {
  work: ApiWork;
  navigate: ReturnType<typeof useNavigate>;
  isSortMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: work.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-admin-card rounded-xl border overflow-hidden',
        'transition-colors duration-300',
        isSortableDragging ? 'border-admin-accent/50 shadow-lg' : 'border-admin-border hover:border-admin-accent'
      )}
    >
      {isSortMode && !isSortableDragging && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 left-3 z-10 size-8 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors"
        >
          <GripVertical size={16} className="text-admin-accent" />
        </div>
      )}

      <div className="relative pt-[125%]">
        <img
          src={work.thumbnail_url || work.image_url}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {work.featured === 1 && (
          <Star size={14} fill="#c9a96e" className="absolute top-3 right-3 text-admin-accent" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge variant="accent">{getCategoryLabel(work.category)}</StatusBadge>
        </div>
        <h3 className="text-[15px] text-admin-text mb-3 leading-[1.4]">{work.title}</h3>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/works/${work.id}/edit`)}
            className="flex-1 py-[7px] bg-admin-card border border-admin-border-light rounded-md text-admin-text-muted cursor-pointer text-xs transition-all duration-200 hover:text-admin-text hover:border-admin-border"
          >编辑 ✏️</button>
          <button
            onClick={() => navigate(`/work/${work.id}`)}
            className="py-[7px] px-[14px] bg-transparent border border-admin-border-light rounded-md text-admin-text-muted cursor-pointer text-xs transition-all duration-200 hover:text-admin-text hover:border-admin-border"
          >查看 👁</button>
        </div>
      </div>
    </div>
  );
}

function DragOverlayCard({ work }: { work: ApiWork | null }) {
  if (!work) return null;
  return (
    <div className="bg-admin-card rounded-xl border border-admin-accent/50 overflow-hidden shadow-2xl rotate-[2deg]">
      <div className="relative pt-[125%]">
        <img src={work.thumbnail_url || work.image_url} alt={work.title} className="absolute inset-0 w-full h-full object-cover" />
        {work.featured === 1 && <Star size={14} fill="#c9a96e" className="absolute top-3 right-3 text-admin-accent" />}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge variant="accent">{getCategoryLabel(work.category)}</StatusBadge>
        </div>
        <h3 className="text-[15px] text-admin-text mb-3 leading-[1.4]">{work.title}</h3>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { slug: 'portrait', name: '人像' },
  { slug: 'landscape', name: '风景' },
  { slug: 'street', name: '街拍' },
  { slug: 'commercial', name: '商业' },
];

export default function WorksList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState(false);
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch works from API
  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await axios.get('/api/works', { params: { status: 'active', sort: 'sort_order', order: 'asc', limit: 100 } });
      setWorks(res.data.data || []);
    } catch (err) {
      setFetchError(handleApiError(err, '加载作品列表失败，请刷新重试'));
      setToast({ type: 'error', message: '加载作品失败，请检查网络或服务器' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  const handleDelete = async (workId: number) => {
    if (!confirm('确定要删除这个作品吗？此操作不可撤销。')) return;
    setDeletingId(workId);
    try {
      await axios.delete(`/api/works/${workId}`);
      setWorks(prev => prev.filter(w => w.id !== workId));
      setToast({ type: 'success', message: '作品已删除' });
    } catch (err) {
      setToast({ type: 'error', message: handleApiError(err, '删除失败，请重试') });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() =>
    activeCategory === 'all' ? works : works.filter(w => w.category === activeCategory),
    [works, activeCategory]
  );

  const searched = useMemo(() =>
    searchQuery.trim()
      ? filtered.filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : filtered,
    [searchQuery, filtered]
  );

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const currentWorks = works; // capture to avoid stale closure
    const oldIndex = currentWorks.findIndex(w => w.id === active.id);
    const newIndex = currentWorks.findIndex(w => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(currentWorks, oldIndex, newIndex);
    setWorks(newOrder);

    const orders = newOrder.map((w, i) => ({ id: w.id, sort_order: i }));

    setSaving(true);
    try {
      await axios.put('/api/works/reorder', { orders });
      setToast({ type: 'success', message: '排序已保存' });
    } catch (err) {
      setToast({ type: 'error', message: handleApiError(err, '保存失败，已恢复原顺序') });
      setWorks(currentWorks);
    } finally {
      setSaving(false);
    }
  }, []); // works captured inside via currentWorks

  const sortedByDate = useMemo(() =>
    [...searched].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [searched]
  );

  const groupByMonth = useCallback((ws: ApiWork[]) => {
    const groups: Record<string, ApiWork[]> = {};
    ws.forEach(w => {
      const key = formatMonth(w.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });
    return Object.entries(groups);
  }, []);

  const activeWork = activeId ? works.find(w => w.id === activeId) || null : null;

  return (
    <div>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[28px] text-admin-text font-serif mb-1">作品管理</h1>
          <p className="text-sm text-admin-text-dim">共 {filtered.length} 个作品</p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSortMode(!sortMode)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] cursor-pointer transition-all duration-200',
              sortMode ? 'bg-admin-accent/15 border border-admin-accent text-admin-accent' : 'bg-admin-raised border border-admin-border-light text-admin-text-muted'
            )}
          >
            <GripVertical size={16} />
            {sortMode ? '退出排序' : '排序模式'}
          </button>

          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="px-3.5 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text-muted text-[13px] outline-none cursor-pointer"
          >
            <option value="all">全部分类</option>
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          <div className="flex bg-admin-raised rounded-lg border border-admin-border-light p-[3px]">
            <button onClick={() => setViewMode('grid')} className={cn('p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]', viewMode === 'grid' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted')}><Grid3X3 size={16} /></button>
            <button onClick={() => setViewMode('table')} className={cn('p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]', viewMode === 'table' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted')}><List size={16} /></button>
            <button onClick={() => setViewMode('timeline')} className={cn('p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]', viewMode === 'timeline' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted')}><Calendar size={16} /></button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-subtle" />
            <input
              type="text"
              placeholder="搜索作品..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-[180px] pl-9 pr-3 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text-muted text-[13px] outline-none"
            />
          </div>

          <button
            onClick={() => navigate('/admin/works/new')}
            className="flex items-center gap-1.5 px-[18px] py-2 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold cursor-pointer tracking-wide"
          >
            <Plus size={16} /> 新建作品
          </button>
        </div>
      </div>

      {/* Sort Mode Banner */}
      <AnimatePresence>
        {sortMode && viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 px-5 py-3 rounded-[10px] flex items-center gap-2.5 border border-admin-accent/30"
            style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.1), rgba(201,169,110,0.05))' }}
          >
            <div className="flex items-center justify-center size-6 rounded-full bg-admin-accent/20">
              <GripVertical size={14} className="text-admin-accent" />
            </div>
            <span className="text-sm text-admin-accent font-medium">拖拽排序模式已开启</span>
            <span className="text-xs text-admin-text-muted ml-auto">拖拽作品卡片调整顺序，松开后自动保存</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving Indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-admin-raised border border-admin-border-light rounded-lg shadow-lg z-50"
          >
            <Loader2 size={16} className="animate-spin text-admin-accent" />
            <span className="text-sm text-admin-text-muted">正在保存排序...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-admin-accent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && fetchError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-admin-text-muted">{fetchError}</p>
          <button onClick={fetchWorks} className="px-5 py-2 bg-admin-accent text-admin-bg rounded-lg text-sm font-medium cursor-pointer hover:bg-admin-accent/90 transition-colors">
            重试
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !fetchError && searched.length === 0 && (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <p className="text-base mb-2">暂无匹配的作品</p>
          <p className="text-[13px]">尝试更换筛选条件或搜索关键词</p>
        </div>
      )}

      {/* Content */}
      {!loading && !fetchError && searched.length > 0 && viewMode === 'grid' && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={searched.map(w => w.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {searched.map(work => (
                <motion.div key={work.id} layout initial={false} animate={sortMode ? { cursor: 'grab' } : { cursor: 'default' }} whileHover={sortMode ? { scale: 1.02 } : {}} transition={{ duration: 0.2 }}>
                  <SortableWorkCard work={work} navigate={navigate} isSortMode={sortMode} />
                </motion.div>
              ))}
            </div>
          </SortableContext>
          <DragOverlay><DragOverlayCard work={activeWork} /></DragOverlay>
        </DndContext>
      )}

      {!loading && !fetchError && searched.length > 0 && viewMode === 'table' && (
        <div className="bg-admin-table rounded-xl border border-admin-border-light overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border-light">
                <th className="text-left px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">缩略图</th>
                <th className="text-left px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">标题</th>
                <th className="text-left px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">分类</th>
                <th className="text-left px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">状态</th>
                <th className="text-right px-4 py-3 text-[12px] text-admin-text-dim font-medium uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {searched.map((work, i) => (
                <tr key={work.id} className={cn('border-b border-admin-border-light/50 hover:bg-admin-raised/50 transition-colors', i % 2 === 0 ? 'bg-admin-card' : 'bg-admin-table')}>
                  <td className="px-4 py-3 font-mono text-[13px] text-admin-text-dim">#{work.id}</td>
                  <td className="px-4 py-3"><img src={work.thumbnail_url || work.image_url} alt="" className="size-12 object-cover rounded-md" /></td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-admin-text-muted">{work.title}</span>
                    {work.featured === 1 && <Star size={12} fill="#c9a96e" className="text-admin-accent ml-1.5 align-middle inline" />}
                  </td>
                  <td className="px-4 py-3"><StatusBadge variant="accent">{getCategoryLabel(work.category)}</StatusBadge></td>
                  <td className="px-4 py-3"><StatusBadge variant={work.featured ? 'warning' : 'success'}>{work.featured ? '精选' : '已发布'}</StatusBadge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => navigate(`/admin/works/${work.id}/edit`)} className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted hover:text-admin-text cursor-pointer">✏️</button>
                      <button onClick={() => navigate(`/work/${work.id}`)} className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted hover:text-admin-text cursor-pointer">👁</button>
                      <button
                        onClick={() => handleDelete(work.id)}
                        disabled={deletingId === work.id}
                        className={cn('p-1.5 rounded-md bg-transparent border-none text-red-400 hover:text-red-300 cursor-pointer', deletingId === work.id ? 'opacity-50' : '')}
                      >{deletingId === work.id ? '⏳' : '🗑'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !fetchError && searched.length > 0 && viewMode === 'timeline' && (
        <div className="relative pl-8 max-w-[800px]">
          <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #c9a96e, #2d2d2d 10%, #2d2d2d 90%, #c9a96e)' }} />
          {groupByMonth(sortedByDate).map(([month, monthWorks], monthIdx) => (
            <div key={month} className={monthIdx < groupByMonth(sortedByDate).length - 1 ? 'mb-8' : ''}>
              <div className="relative mb-4">
                <div className="absolute -left-[26px] top-1 size-3 rounded-full bg-admin-accent border-[3px] border-admin-bg" />
                <h3 className="text-base text-admin-accent font-semibold">{month}</h3>
                <p className="text-xs text-admin-text-dim mt-0.5">{monthWorks.length} 个作品</p>
              </div>
              <div className="flex flex-col gap-3">
                {monthWorks.map(work => (
                  <div key={work.id} className="flex gap-4 p-4 bg-admin-card rounded-[10px] border border-admin-border transition-colors items-start hover:border-admin-accent">
                    <img src={work.thumbnail_url || work.image_url} alt={work.title} className="w-20 h-[60px] object-cover rounded-lg shrink-0" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-[15px] text-admin-text leading-[1.3]">{work.title}</h4>
                        {work.featured === 1 && <Star size={14} fill="#c9a96e" className="text-admin-accent shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge variant="accent">{getCategoryLabel(work.category)}</StatusBadge>
                        <span className="text-[11px] text-admin-text-subtle flex items-center gap-1"><Calendar size={10} /> {formatDate(work.created_at)}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        <button onClick={() => navigate(`/admin/works/${work.id}/edit`)} className="py-1 px-3 bg-admin-card border border-admin-border-light rounded-[5px] text-admin-text-muted cursor-pointer text-[11px] hover:text-admin-text hover:border-admin-border transition-colors">编辑 ✏️</button>
                        <button onClick={() => navigate(`/work/${work.id}`)} className="py-1 px-3 bg-transparent border border-admin-border-light rounded-[5px] text-admin-text-muted cursor-pointer text-[11px] hover:text-admin-text hover:border-admin-border transition-colors">查看 👁</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}