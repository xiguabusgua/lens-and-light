import { useState, useMemo, useCallback } from 'react';
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
import { Plus, Search, Grid3X3, List, Star, Calendar, GripVertical, Check, Loader2 } from 'lucide-react';
import { works as worksData, getCategoryName, Work } from '@/data/works';
import { AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, StatusBadge, AdminToast } from '@/admin/components';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}年${m}月`;
}

function SortableWorkCard({
  work,
  navigate,
  isSortMode,
  isDragging
}: {
  work: Work;
  navigate: ReturnType<typeof useNavigate>;
  isSortMode: boolean;
  isDragging: boolean;
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
      className={`
        relative bg-admin-card rounded-xl border overflow-hidden
        transition-colors duration-300
        ${isSortableDragging ? 'border-admin-accent/50 shadow-lg' : 'border-admin-border hover:border-admin-accent'}
      `}
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
          src={work.imageUrl}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {work.featured && (
          <Star size={14} fill="#c9a96e" className="absolute top-3 right-3 text-admin-accent" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge variant="accent">{getCategoryName(work.category)}</StatusBadge>
        </div>
        <h3 className="text-[15px] text-admin-text mb-3 leading-[1.4]">{work.title}</h3>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/works/${work.id}/edit`)}
            className="flex-1 py-[7px] bg-admin-card border border-admin-border-light rounded-md text-admin-text-muted cursor-pointer text-xs transition-all duration-200 hover:text-admin-text hover:border-admin-border"
            aria-label="编辑"
          >编辑 ✏️</button>
          <button
            onClick={() => navigate(`/gallery/${work.id}`)}
            className="py-[7px] px-[14px] bg-transparent border border-admin-border-light rounded-md text-admin-text-muted cursor-pointer text-xs transition-all duration-200 hover:text-admin-text hover:border-admin-border"
            aria-label="查看"
          >查看 👁</button>
        </div>
      </div>
    </div>
  );
}

function DragOverlayCard({ work }: { work: Work | null }) {
  if (!work) return null;

  return (
    <div className="bg-admin-card rounded-xl border border-admin-accent/50 overflow-hidden shadow-2xl rotate-[2deg]">
      <div className="relative pt-[125%]">
        <img
          src={work.imageUrl}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {work.featured && (
          <Star size={14} fill="#c9a96e" className="absolute top-3 right-3 text-admin-accent" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge variant="accent">{getCategoryName(work.category)}</StatusBadge>
        </div>
        <h3 className="text-[15px] text-admin-text mb-3 leading-[1.4]">{work.title}</h3>
      </div>
    </div>
  );
}

export default function WorksList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState(false);
  const [worksOrder, setWorksOrder] = useState<Work[]>(worksData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (workId: number) => {
    if (!confirm('确定要删除这个作品吗？此操作不可撤销。')) return;
    setDeletingId(workId);
    try {
      await axios.delete(`/api/works/${workId}`);
      setWorksOrder(prev => prev.filter(w => w.id !== workId));
      showToast('success', '作品已删除');
    } catch (error) {
      showToast('error', '删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() =>
    activeCategory === 'all'
      ? worksOrder
      : worksOrder.filter(w => w.category === activeCategory),
    [activeCategory, worksOrder]
  );

  const searched = useMemo(() =>
    searchQuery.trim()
      ? filtered.filter(w => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : filtered,
    [searchQuery, filtered]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = worksOrder.findIndex(w => w.id === active.id);
    const newIndex = worksOrder.findIndex(w => w.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(worksOrder, oldIndex, newIndex);
    setWorksOrder(newOrder);

    setSaving(true);
    try {
      await axios.put('/api/works/reorder', {
        ids: newOrder.map(w => w.id)
      });
      showToast('success', '排序已保存');
    } catch (error) {
      showToast('error', '保存失败，请重试');
      setWorksOrder(worksOrder);
    } finally {
      setSaving(false);
    }
  }, [worksOrder, showToast]);

  const sortedByDate = useMemo(() =>
    [...searched].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [searched]
  );

  const groupByMonth = useCallback((works: Work[]) => {
    const groups: Record<string, Work[]> = {};
    works.forEach(w => {
      const key = formatMonth(w.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });
    return Object.entries(groups);
  }, []);

  const activeWork = activeId
    ? worksOrder.find(w => w.id === activeId) || null
    : null;

  return (
    <div>
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[28px] text-admin-text font-serif mb-1">作品管理</h1>
          <p className="text-sm text-admin-text-dim">共 {filtered.length} 个作品</p>
        </div>

        <div className="flex gap-2 items-center">
          {/* Sort Mode Toggle */}
          <button
            onClick={() => setSortMode(!sortMode)}
            aria-label="排序"
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] cursor-pointer transition-all duration-200
              ${sortMode
                ? 'bg-admin-accent/15 border border-admin-accent text-admin-accent'
                : 'bg-admin-raised border border-admin-border-light text-admin-text-muted'
              }
            `}
          >
            <GripVertical size={16} />
            {sortMode ? '退出排序' : '排序模式'}
          </button>

          {/* Category Filter */}
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="px-3.5 py-2 bg-admin-raised border border-admin-border-light rounded-lg text-admin-text-muted text-[13px] outline-none cursor-pointer"
          >
            <option value="all">全部分类</option>
            <option value="portrait">人像</option>
            <option value="landscape">风景</option>
            <option value="street">街拍</option>
            <option value="commercial">商业</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-admin-raised rounded-lg border border-admin-border-light p-[3px]">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="网格视图"
              className={`
                p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]
                ${viewMode === 'grid' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted'}
              `}
            ><Grid3X3 size={16} /></button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="表格视图"
              className={`
                p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]
                ${viewMode === 'table' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted'}
              `}
            ><List size={16} /></button>
            <button
              onClick={() => setViewMode('timeline')}
              aria-label="时间线视图"
              className={`
                p-1.5 px-3 border-none rounded-md cursor-pointer text-[13px]
                ${viewMode === 'timeline' ? 'bg-admin-accent text-admin-bg' : 'bg-transparent text-admin-text-muted'}
              `}
            ><Calendar size={16} /></button>
          </div>

          {/* Search */}
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

          {/* New Button */}
          <button
            onClick={() => navigate('/admin/works/new')}
            className="flex items-center gap-1.5 px-[18px] py-2 bg-admin-accent text-admin-bg border-none rounded-lg text-[13px] font-semibold cursor-pointer tracking-wide"
          >
            <Plus size={16} /> 新建作品
          </button>
        </div>
      </div>

      {/* Sort Mode Active Banner */}
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

      {/* Content */}
      {searched.length === 0 ? (
        <div className="text-center py-20 px-5 text-admin-text-subtle">
          <p className="text-base mb-2">暂无匹配的作品</p>
          <p className="text-[13px]">尝试更换筛选条件或搜索关键词</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View with Drag & Drop */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={searched.map(w => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {searched.map(work => (
                <motion.div
                  key={work.id}
                  layout
                  initial={false}
                  animate={sortMode ? { cursor: 'grab' } : { cursor: 'default' }}
                  whileHover={sortMode ? { scale: 1.02 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <SortableWorkCard
                    work={work}
                    navigate={navigate}
                    isSortMode={sortMode}
                    isDragging={activeId === work.id}
                  />
                </motion.div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            <DragOverlayCard work={activeWork} />
          </DragOverlay>
        </DndContext>
      ) : viewMode === 'table' ? (
        /* Table View */
        <AdminTable>
          <AdminTHead>
            <AdminTh>ID</AdminTh>
            <AdminTh>缩略图</AdminTh>
            <AdminTh>标题</AdminTh>
            <AdminTh>分类</AdminTh>
            <AdminTh>状态</AdminTh>
            <AdminTh className="text-right">操作</AdminTh>
          </AdminTHead>
          <tbody>
            {searched.map((work, i) => (
              <AdminTr key={work.id} index={i}>
                <AdminTd className="font-mono text-[13px] text-admin-text-dim">#{work.id}</AdminTd>
                <AdminTd>
                  <img src={work.imageUrl} alt="" className="size-12 object-cover rounded-md" />
                </AdminTd>
                <AdminTd>
                  <span className="text-sm text-admin-text-muted">{work.title}</span>
                  {work.featured && <Star size={12} fill="#c9a96e" className="text-admin-accent ml-1.5 align-middle inline" />}
                </AdminTd>
                <AdminTd>
                  <StatusBadge variant="accent">{getCategoryName(work.category)}</StatusBadge>
                </AdminTd>
                <AdminTd>
                  <StatusBadge variant={work.featured ? 'warning' : 'success'}>
                    {work.featured ? '精选' : '已发布'}
                  </StatusBadge>
                </AdminTd>
                <AdminTd className="text-right">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/admin/works/${work.id}/edit`)}
                      className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted hover:text-admin-text cursor-pointer"
                      aria-label="编辑"
                    >✏️</button>
                    <button
                      onClick={() => navigate(`/gallery/${work.id}`)}
                      className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted hover:text-admin-text cursor-pointer"
                      aria-label="查看"
                    >👁</button>
                    <button
                      onClick={() => handleDelete(work.id)}
                      disabled={deletingId === work.id}
                      className={`p-1.5 rounded-md bg-transparent border-none text-red-400 hover:text-red-300 cursor-pointer ${deletingId === work.id ? 'opacity-50' : ''}`}
                      aria-label="删除"
                    >{deletingId === work.id ? '⏳' : '🗑'}</button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        /* Timeline View */
        <div className="relative pl-8 max-w-[800px]">
          {/* Vertical line */}
          <div
            className="absolute left-3 top-0 bottom-0 w-0.5"
            style={{ background: 'linear-gradient(to bottom, #c9a96e, #2d2d2d 10%, #2d2d2d 90%, #c9a96e)' }}
          />

          {groupByMonth(sortedByDate).map(([month, monthWorks], monthIdx) => (
            <div key={month} className={monthIdx < groupByMonth(sortedByDate).length - 1 ? 'mb-8' : ''}>
              {/* Month header */}
              <div className="relative mb-4">
                <div className="absolute -left-[26px] top-1 size-3 rounded-full bg-admin-accent border-[3px] border-admin-bg" />
                <h3 className="text-base text-admin-accent font-semibold">{month}</h3>
                <p className="text-xs text-admin-text-dim mt-0.5">{monthWorks.length} 个作品</p>
              </div>

              {/* Works in this month */}
              <div className="flex flex-col gap-3">
                {monthWorks.map(work => (
                  <div
                    key={work.id}
                    className="flex gap-4 p-4 bg-admin-card rounded-[10px] border border-admin-border transition-colors items-start hover:border-admin-accent"
                  >
                    {/* Thumbnail */}
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      className="w-20 h-[60px] object-cover rounded-lg shrink-0"
                      loading="lazy"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-[15px] text-admin-text leading-[1.3]">{work.title}</h4>
                        {work.featured && <Star size={14} fill="#c9a96e" className="text-admin-accent shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge variant="accent">{getCategoryName(work.category)}</StatusBadge>
                        <span className="text-[11px] text-admin-text-subtle flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(work.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        <button
                          onClick={() => navigate(`/admin/works/${work.id}/edit`)}
                          className="py-1 px-3 bg-admin-card border border-admin-border-light rounded-[5px] text-admin-text-muted cursor-pointer text-[11px] hover:text-admin-text hover:border-admin-border transition-colors"
                          aria-label="编辑"
                        >编辑 ✏️</button>
                        <button
                          onClick={() => navigate(`/gallery/${work.id}`)}
                          className="py-1 px-3 bg-transparent border border-admin-border-light rounded-[5px] text-admin-text-muted cursor-pointer text-[11px] hover:text-admin-text hover:border-admin-border transition-colors"
                          aria-label="查看"
                        >查看 👁</button>
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
