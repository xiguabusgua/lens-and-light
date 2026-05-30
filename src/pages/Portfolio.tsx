import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Pause, ChevronLeft, ChevronRight, Calendar, Clock, Camera, Tag as TagIcon, Loader2, Search, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { cn, getFullImageUrl, getCategoryLabel, handleApiError, type ApiWork } from '@/lib/utils';
import { getLayoutConfig, type LayoutMode } from '@/config/layout';
import ResponsiveImage from '@/components/ResponsiveImage';

interface Work extends ApiWork {}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  work_count: number;
}

function WorkCard({ work, className, style }: { work: Work; className?: string; style?: React.CSSProperties }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-sm cursor-pointer group', className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/work/${work.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-label={`查看作品：${work.title}`}
      style={style}
    >
      <ResponsiveImage
        src={work.thumbnail_url || work.image_url}
        alt={work.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        draggable={false}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-5 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="inline-block px-3 py-1 text-xs font-ui font-medium uppercase tracking-wider text-accent border border-accent/30 rounded-sm mb-2 w-fit">
          {getCategoryLabel(work.category)}
        </span>
        <h3 className="font-display text-lg text-white leading-snug">{work.title}</h3>
        {work.tag_list && work.tag_list.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {work.tag_list.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-ui text-white/60 bg-white/10 rounded-sm"
              >
                <TagIcon size={8} />
                {tag.name}
              </span>
            ))}
            {work.tag_list.length > 3 && (
              <span className="px-1 py-0.5 text-[10px] text-white/40">+{work.tag_list.length - 3}</span>
            )}
          </div>
        )}
        <motion.div
          className="flex items-center gap-2 mt-2 text-accent"
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: isHovered ? 0 : -8, opacity: isHovered ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        >
          <span className="text-xs font-ui uppercase tracking-widest">查看</span>
          <ArrowRight size={14} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function AutoScrollLayout({ filteredWorks, columnCount, gap }: { filteredWorks: Work[]; columnCount: number; gap: number }) {
  return <AutoScrollLayoutInner works={filteredWorks} count={columnCount} gap={gap} />;
}

function AutoScrollLayoutInner({ works, count, gap }: { works: Work[]; count: number; gap: number }) {
  const columns = useMemo(() => {
    const cols: Work[][] = Array.from({ length: count }, () => []);
    works.forEach((work, i) => cols[i % count].push(work));
    return cols;
  }, [works, count]);

  return (
    <div className="flex gap-4 md:gap-6 h-full" style={{ gap: `${gap}px` }}>
      {columns.map((columnWorks, colIndex) => (
        <AutoScrollColumn key={colIndex} works={columnWorks} columnIndex={colIndex} />
      ))}
    </div>
  );
}

function AutoScrollColumn({ works, columnIndex }: { works: Work[]; columnIndex: number }) {
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTsRef = useRef(performance.now());
  const offsetRef = useRef(0);

  const duplicated = useMemo(() => [...works, ...works], [works]);

  useEffect(() => {
    if (works.length === 0) return;

    const speed = columnIndex % 2 === 0 ? 35 : 26;
    let running = true;

    const animate = (ts: number) => {
      if (!running) return;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      if (!isPaused) {
        offsetRef.current += (speed * delta) / 1000;

        if (containerRef.current) {
          const contentH = containerRef.current.scrollHeight / 2;
          if (contentH > 0 && offsetRef.current >= contentH) {
            offsetRef.current = offsetRef.current % contentH;
          }
        }

        setOffset(offsetRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [works.length, isPaused, columnIndex]);

  return (
    <div
      className="flex-1 min-w-0 relative overflow-hidden h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="h-full overflow-hidden"
        style={{ willChange: 'contents' }}
      >
        <div
          className="pb-4 space-y-4"
          style={{
            transform: `translateY(-${offset}px)`,
            willChange: 'transform'
          }}
        >
          {duplicated.map((work, idx) => (
            <WorkCard key={`${work.id}-dup-${idx}`} work={work} className="aspect-[4/5]" />
          ))}
        </div>
      </div>

      {isPaused && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-sm rounded-full p-1.5 border border-accent/20">
          <Pause size={10} className="text-accent" />
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary via-primary/80 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary via-primary/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}

function MasonryLayout({ filteredWorks, gap }: { filteredWorks: Work[]; gap: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
      style={{ columnGap: `${gap}px` }}
    >
      {filteredWorks.map((work, index) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.06 }}
          className="break-inside-avoid mb-4"
          style={{ marginBottom: `${gap}px` }}
        >
          <WorkCard work={work} className="aspect-[3/4]" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function GridLayout({ filteredWorks, columnCount, gap }: { filteredWorks: Work[]; columnCount: number; gap: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columnCount}, 1fr)`, gap: `${gap}px` }}
    >
      {filteredWorks.map((work, index) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <WorkCard work={work} className="aspect-[4/5]" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function CarouselLayout({ filteredWorks }: { filteredWorks: Work[] }) {
  const [current, setCurrent] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);

  const next = () => setCurrent(p => (p + 1) % totalPages);
  const prev = () => setCurrent(p => (p - 1 + totalPages) % totalPages);

  const visibleWorks = filteredWorks.slice(current * itemsPerPage, (current + 1) * itemsPerPage);

  return (
    <div className="relative">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {visibleWorks.map((work, idx) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <WorkCard work={work} className="aspect-[4/5] rounded-lg" />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button onClick={prev} className="p-3 rounded-full bg-surface hover:bg-surface-light border border-surface transition-colors">
            <ChevronLeft size={20} className="text-secondary" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-accent w-6' : 'bg-secondary/30'}`}
              />
            ))}
          </div>
          <button onClick={next} className="p-3 rounded-full bg-surface hover:bg-surface-light border border-surface transition-colors">
            <ChevronRight size={20} className="text-secondary" />
          </button>
        </div>
      )}
    </div>
  );
}

function SingleLayout({ filteredWorks, gap }: { filteredWorks: Work[]; gap: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: `${gap}px` }}
    >
      {filteredWorks.map((work, index) => (
        <motion.div
          key={work.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.08 }}
        >
          <WorkCard work={work} className="aspect-[3/2] rounded-lg" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function formatDateStr(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}年${m}月`;
}

function TimelineLayout({ filteredWorks }: { filteredWorks: Work[] }) {
  const sorted = [...filteredWorks].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const groupByMonth = (works: Work[]) => {
    const groups: Record<string, Work[]> = {};
    works.forEach(w => {
      const key = formatMonth(w.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });
    return Object.entries(groups);
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '40px', maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ position: 'absolute', left: '16px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, rgba(201,169,110,0.6), rgba(45,45,45,0.8) 8%, rgba(45,45,45,0.8) 92%, rgba(201,169,110,0.6))' }} />

      {groupByMonth(sorted).map(([month, monthWorks], monthIdx, months) => (
        <motion.div
          key={month}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: monthIdx * 0.1 }}
          style={{ marginBottom: monthIdx < months.length - 1 ? '40px' : '0' }}
        >
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div className="bg-accent border-primary" style={{
              position: 'absolute', left: '-30px', top: '6px', width: '12px', height: '12px',
              borderRadius: '50%', borderWidth: '3px', borderStyle: 'solid',
              boxShadow: '0 0 12px rgba(201,169,110,0.3)'
            }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <h3 className="text-accent" style={{ fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 600 }}>{month}</h3>
              <span style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> {monthWorks.length} 个作品
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {monthWorks.map((work, idx) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: monthIdx * 0.1 + idx * 0.05 }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px', border: '1px solid #222', background: '#151515' }}>
                  <ResponsiveImage
                    src={work.thumbnail_url || work.image_url}
                    alt={work.title}
                    loading="lazy"
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', color: '#fff', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>{work.title}</h4>
                        <span style={{ fontSize: '10px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> {formatDateStr(work.created_at)}
                        </span>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
                        background: 'rgba(201,169,110,0.15)', color: '#c9a96e',
                        border: '1px solid rgba(201,169,110,0.25)'
                      }}>
                        {getCategoryLabel(work.category)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Portfolio() {
  const { category: urlCategory } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [activeTag, setActiveTag] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string; slug: string; work_count?: number }[]>([]);
  const [allWorks, setAllWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [config, setConfig] = useState(() => getLayoutConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchWorks = async (p = 1, append = false) => {
    const params: Record<string, string | number> = { status: 'active', limit: 12, page: p };
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeTag) params.tag = activeTag;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const res = await axios.get('/api/works', { params });
      const data = res.data.data || [];
      if (append) {
        setAllWorks(prev => [...prev, ...data]);
      } else {
        setAllWorks(data);
      }
      setHasMore(data.length === 12);
      setError('');
    } catch (err) {
      if (!append) setError(handleApiError(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const searchWorks = async (query: string) => {
    if (!query.trim()) {
      setDebouncedSearch('');
      fetchWorks(1, false);
      return;
    }
    setSearchLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { status: 'active', search: query.trim(), limit: 50 };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeTag) params.tag = activeTag;
      const res = await axios.get('/api/works', { params });
      setAllWorks(res.data.data || []);
      setHasMore(false);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => { fetchWorks(1, false); }, [activeCategory, activeTag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      setDebouncedSearch(q);
      if (q) {
        searchWorks(q);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    fetchWorks(1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWorks(nextPage, true);
  };

  useEffect(() => {
    Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/tags')
    ]).then(([catRes, tagRes]) => {
      setCategories(catRes.data.data || []);
      const tagData = (tagRes.data.data || []).map((t: any) => ({
        ...t,
        work_count: t.work_count || 0
      }));
      setTags(tagData);
    }).catch(() => {});
  }, []);

  const filteredWorks = useMemo(() => {
    if (activeCategory === 'all' && !debouncedSearch) return allWorks;
    if (debouncedSearch) return allWorks;
    return allWorks.filter(w => w.category === activeCategory);
  }, [allWorks, activeCategory, debouncedSearch]);

  useEffect(() => {
    const handler = () => setConfig(getLayoutConfig());
    window.addEventListener('storage', handler);
    window.addEventListener('layout-config-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('layout-config-change', handler);
    };
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      if (categoryId === 'all') navigate('/portfolio', { replace: true });
      else navigate(`/portfolio/${categoryId}`, { replace: true });
    },
    [navigate]
  );

  const renderLayout = () => {
    const common = { filteredWorks, columnCount: config.columns, gap: config.gap };
    switch (config.mode) {
      case 'masonry': return <MasonryLayout filteredWorks={filteredWorks} gap={config.gap} />;
      case 'grid': return <GridLayout filteredWorks={filteredWorks} columnCount={config.columns} gap={config.gap} />;
      case 'carousel': return <CarouselLayout filteredWorks={filteredWorks} />;
      case 'single': return <SingleLayout filteredWorks={filteredWorks} gap={config.gap} />;
      case 'timeline': return <TimelineLayout filteredWorks={filteredWorks} />;
      case 'auto-scroll': default:
        return (
          <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
            <AutoScrollLayout {...common} />
            <div className="absolute top-0 bottom-0 left-0 w-12 md:w-24 bg-gradient-to-r from-primary to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 bottom-0 right-0 w-12 md:w-24 bg-gradient-to-l from-primary to-transparent pointer-events-none z-20" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-semibold text-secondary font-serif mb-6">作品集</h1>
            <p className="text-xl lg:text-2xl italic text-secondary/70 font-serif">用光影书写视觉诗篇</p>
            <div className="w-16 h-[1px] bg-accent mx-auto mt-8" />
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="text-accent animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-secondary/60">{error}</p>
              <button onClick={() => fetchWorks(1, false)} className="btn-ghost">重试</button>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl mx-auto mb-10"
              >
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40 group-focus-within:text-accent transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索作品标题、描述、标签..."
                    className="w-full pl-12 pr-10 py-3.5 bg-surface border border-surface rounded-sm text-secondary placeholder-secondary/40 font-ui text-sm focus:outline-none focus:border-accent/50 focus:bg-surface-light transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-surface-light/10 rounded-full transition-colors"
                    >
                      <X size={16} className="text-secondary/50 hover:text-secondary" />
                    </button>
                  )}
                </div>
                {debouncedSearch && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-3 text-sm text-secondary/50"
                  >
                    找到 <span className="text-accent font-medium">{filteredWorks.length}</span> 个相关作品
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap justify-center gap-3 mb-14"
              >
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm uppercase tracking-wider transition-all duration-300',
                    activeCategory === 'all'
                      ? 'bg-accent text-primary'
                      : 'bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent'
                  )}
                >
                  <span>全部</span>
                  <span className={cn('text-xs', activeCategory === 'all' ? 'text-primary/60' : 'text-accent/60')}>{allWorks.length}</span>
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm uppercase tracking-wider transition-all duration-300',
                        isActive
                          ? 'bg-accent text-primary'
                          : 'bg-transparent border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className={cn('text-xs', isActive ? 'text-primary/60' : 'text-accent/60')}>{cat.work_count}</span>
                    </button>
                  );
                })}
              </motion.div>

              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="flex flex-wrap justify-center gap-2 mb-14"
                >
                  <button
                    onClick={() => setActiveTag('')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs uppercase tracking-wider transition-all duration-300',
                      !activeTag
                        ? 'bg-secondary text-primary'
                        : 'bg-transparent border border-secondary/20 text-secondary/50 hover:border-secondary/40 hover:text-secondary/70'
                    )}
                  >
                    <TagIcon size={14} />
                    <span>全部标签</span>
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setActiveTag(prev => prev === tag.slug ? '' : tag.slug)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs transition-all duration-300',
                        activeTag === tag.slug
                          ? 'bg-accent text-primary'
                          : 'bg-transparent border border-accent/30 text-accent/70 hover:bg-accent/10 hover:border-accent/50'
                      )}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {filteredWorks.length > 0 ? (
                  <motion.div key={activeCategory + config.mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    {renderLayout()}
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
                    <div className="w-20 h-20 rounded-full border border-surface flex items-center justify-center mb-6">
                      <Camera size={28} className="text-surface" />
                    </div>
                    <p className="text-lg text-secondary/50 italic font-serif mb-2">暂无作品</p>
                    <p className="text-sm text-secondary/30 tracking-wide">该分类下还没有添加作品</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {hasMore && !debouncedSearch && filteredWorks.length > 0 && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 border border-accent/50 text-accent font-ui text-sm uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300 rounded-sm disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <><Loader2 size={16} className="animate-spin" /> 加载中...</>
                    ) : (
                      '加载更多'
                    )}
                  </button>
                </div>
              )}

              {searchLoading && (
                <div className="text-center mt-8">
                  <Loader2 size={24} className="text-accent animate-spin mx-auto" />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}