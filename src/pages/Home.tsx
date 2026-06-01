import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView as useInViewObserver } from 'react-intersection-observer';
import { ArrowRight, ChevronDown, Grid3X3, User, Mountain, Camera, Briefcase, Tag as TagIcon, Loader2, Play, Pause, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getFeaturedWorks } from '../data/works';
import type { Work } from '../data/works';
import { categories } from '../data/categories';
import { getCategoryLabel, formatDate, type ApiWork } from '@/lib/utils';
import axios from 'axios';
import ResponsiveImage from '@/components/ResponsiveImage';

// ============================================================
// Nanfu-Inspired Hero Section
// ============================================================

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
}

function LetterReveal({ text, className = '', delay = 0.2, stagger = 0.04 }: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const letters = text.split('').map((char, i) => (
    <span key={i} className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{
          delay: delay + i * stagger,
          duration: 0.6,
          type: 'spring',
          stiffness: 120,
          damping: 14,
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    </span>
  ));

  return <span className={`inline-block ${className}`}>{letters}</span>;
}

function LineDecoration({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-[1px] bg-accent origin-left ${className}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

function HeroSection() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 150]);
  const textY = useTransform(scrollY, [0, 600], [0, 60]);

  useEffect(() => {
    axios.get('/api/hero-slides', { params: { status: 'active', sort: 'sort_order' } })
      .then(res => {
        const data = res.data.data || [];
        setHeroSlides(data.length > 0 ? data : []);
      })
      .catch(() => { setHeroSlides([]); })
      .finally(() => setHeroLoading(false));
  }, []);

  // Auto-play slide switching
  useEffect(() => {
    if (heroSlides.length <= 1 || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(p => (p + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isAutoPlaying]);

  if (heroLoading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-primary flex items-center justify-center">
        <Loader2 size={40} className="text-accent animate-spin" />
      </section>
    );
  }

  if (heroSlides.length === 0) return null;

  const current = heroSlides[currentSlide];

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <ResponsiveImage
              src={current.image_url}
              alt={current.title}
              className="w-full h-full object-cover"
              priority={true}
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      </motion.div>

      {/* Content with parallax */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
        style={{ y: textY }}
      >
        {/* Subtitle label */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          {current.subtitle && (
            <span className="font-ui uppercase tracking-[0.3em] text-accent text-sm">
              {current.subtitle}
            </span>
          )}
        </motion.div>

        {/* Main title with letter reveal */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-4 max-w-5xl leading-tight">
          <LetterReveal text={current.title} delay={0.5} stagger={0.035} />
        </h1>

        {/* Decorative line */}
        <LineDecoration className="w-24 mx-auto mb-6" />

        {/* Description */}
        {current.description && (
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="font-body text-xl md:text-2xl italic text-white/80 max-w-2xl mb-10"
          >
            {current.description}
          </motion.p>
        )}

        {/* CTA Buttons */}
        {current.button_text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to={current.button_link || '/portfolio'}
              className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-white/40 text-white font-ui text-sm font-medium uppercase tracking-widest hover:bg-white hover:text-secondary transition-all duration-500"
            >
              {current.button_text}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-accent text-accent font-ui text-sm font-medium uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-500"
            >
              关于我
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Slide indicators */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? 'w-12 bg-accent'
                  : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play control */}
      {heroSlides.length > 1 && (
        <button
          onClick={() => setIsAutoPlaying(p => !p)}
          className="absolute bottom-32 right-8 z-20 p-2 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all"
          aria-label={isAutoPlaying ? '暂停' : '播放'}
        >
          {isAutoPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-white/40 select-none">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={20} className="text-accent/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================
// Nanfu-Inspired Horizontal Works Carousel
// ============================================================

function WorksCarousel() {
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 8 } })
      .then(res => { setWorks(res.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (works.length === 0 || isPaused || !inView) return;

    const speed = 1.2; // pixels per frame
    let running = true;

    const animate = (ts: number) => {
      if (!running) return;
      const delta = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      if (delta > 0 && delta < 100) {
        const container = scrollContainerRef.current;
        if (container) {
          const scrollLeft = container.scrollLeft;
          const maxScroll = container.scrollWidth - container.clientWidth;
          const newScroll = scrollLeft + (speed * delta) / 16;

          if (newScroll >= maxScroll) {
            container.scrollTo({ left: 0, behavior: 'instant' });
          } else {
            container.scrollTo({ left: newScroll, behavior: 'instant' });
          }
        }
      }

      autoScrollRef.current = requestAnimationFrame(animate);
    };

    autoScrollRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
    };
  }, [works.length, isPaused, inView]);

  const nextSlide = () => {
    setCurrentIndex(p => (p + 1) % works.length);
  };

  const prevSlide = () => {
    setCurrentIndex(p => (p - 1 + works.length) % works.length);
  };

  if (loading) {
    return (
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-accent animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (works.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">精选</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary mt-3 mb-4">作品集</h2>
          <div className="w-16 h-[1px] bg-accent mb-6" />
          <p className="font-body text-lg lg:text-xl italic text-secondary/70 max-w-xl">每一幅作品都是一个等待被讲述的故事</p>
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full border border-surface-light text-secondary/60 hover:text-accent hover:border-accent transition-all duration-300"
            aria-label="上一个"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full border border-surface-light text-secondary/60 hover:text-accent hover:border-accent transition-all duration-300"
            aria-label="下一个"
          >
            <ChevronRight size={20} />
          </button>
          <div className="flex-1 h-[1px] bg-surface-light mx-4" />
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-ui uppercase tracking-wider text-accent hover:text-accent-light transition-colors"
          >
            查看全部
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-6 lg:px-8"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left fade gradient */}
        <div className="flex-shrink-0 w-8 md:w-24" />

        {works.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex-shrink-0 w-[320px] md:w-[400px] scroll-snap-align-start"
          >
            <Link
              to={`/work/${work.id}`}
              className="block relative group overflow-hidden rounded-sm"
            >
              {/* Image with hover zoom */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <ResponsiveImage
                  src={work.thumbnail_url || work.image_url}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Category badge */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className="inline-block px-3 py-1 text-xs font-ui tracking-wider bg-accent/90 text-primary rounded-sm">
                    {getCategoryLabel(work.category)}
                  </span>
                </div>
              </div>

              {/* Card info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <h3 className="font-display text-xl text-white mb-2">{work.title}</h3>
                {work.tag_list && work.tag_list.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {work.tag_list.slice(0, 3).map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-ui text-white/60 bg-white/10 rounded-sm"
                      >
                        <TagIcon size={8} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover arrow indicator */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Right fade gradient */}
        <div className="flex-shrink-0 w-8 md:w-24" />
      </div>

      {/* Scroll progress indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-3">
          {works.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                idx === currentIndex ? 'w-12 bg-accent' : 'w-6 bg-surface-light'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Category Navigation
// ============================================================

function AnimatedTitle({ text }: { text: string }) {
  return (
    <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary">
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: Math.random() > 0.5 ? -30 : 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 + i * 0.05, duration: 0.6, type: 'spring', stiffness: 150, damping: 15 }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </h2>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  Grid3X3: <Grid3X3 className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

function CategoryNavigation() {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">浏览</span>
          <AnimatedTitle text="按主题分类" />
          <div className="w-16 h-[1px] bg-accent mx-auto mb-6" />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {categories.filter(c => c.id !== 'all').map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Link
                to={`/portfolio/${cat.id}`}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-surface-light font-ui text-sm text-secondary/80 hover:border-accent hover:text-accent transition-all duration-300 hover:-translate-y-1"
              >
                {iconMap[cat.icon]}
                <span>{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Step 3: Stats Counter Section (滚动触发的计数动画)
// ============================================================

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

function useCountUp(target: number, duration: number = 2000, startWhen: boolean = false) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!startWhen || hasStarted) return;
    setHasStarted(true);

    let startTime: number;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, startWhen, hasStarted]);

  return count;
}

function StatCounter({ stat, index }: { stat: StatItem; index: number }) {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.5 });
  const count = useCountUp(stat.value, 2000, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="text-center px-8"
    >
      {/* Number with accent color */}
      <div className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-accent mb-4">
        <span>{count.toLocaleString()}</span>
        <span className="text-4xl md:text-5xl">{stat.suffix}</span>
      </div>
      {/* Label */}
      <h3 className="font-ui text-lg uppercase tracking-widest text-secondary mb-2">{stat.label}</h3>
      {/* Description */}
      <p className="font-body text-base italic text-secondary/60 max-w-xs mx-auto">{stat.description}</p>
    </motion.div>
  );
}

function StatsSection() {
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 100 } })
      .then(res => { setWorks(res.data.data || []); })
      .catch(() => {});
  }, []);

  // Calculate stats dynamically from real data
  const workCount = works.length;
  // Assume 5+ years of experience if there are works
  const yearsCount = workCount > 0 ? Math.max(5, Math.floor(workCount / 10) + 3) : 5;
  // Calculate unique categories
  const uniqueCategories = new Set(works.map(w => w.category)).size || 4;

  const stats: StatItem[] = [
    {
      value: workCount || 48,
      suffix: '+',
      label: '作品',
      description: '每一幅作品都是一个故事',
    },
    {
      value: yearsCount,
      suffix: '年',
      label: '拍摄经历',
      description: '从胶片到数码，见证光影变迁',
    },
    {
      value: uniqueCategories,
      suffix: '+',
      label: '创作领域',
      description: '人像·风光·街拍·商业',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-surface-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          ref={ref}
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">关于我</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary mt-3 mb-4">用镜头记录世界</h2>
          <div className="w-16 h-[1px] bg-accent mx-auto" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {stats.map((stat, idx) => (
            <StatCounter key={stat.label} stat={stat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Step 4: Timeline Section (滚动触发的作品编年史)
// ============================================================

function TimelineSection() {
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 20 } })
      .then(res => { setWorks(res.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group works by year
  const groupedByYear = useMemo(() => {
    const sorted = [...works].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const groups: Record<string, ApiWork[]> = {};
    sorted.forEach(work => {
      const year = new Date(work.created_at).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(work);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [works]);

  if (loading) {
    return (
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-accent animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (works.length === 0) return null;

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">历程</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary mt-3 mb-4">作品编年</h2>
          <div className="w-16 h-[1px] bg-accent mx-auto mb-6" />
          <p className="font-body text-lg italic text-secondary/70 max-w-xl mx-auto">用时间串联每一次快门</p>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent via-accent/50 to-transparent" />

          {/* Year groups */}
          {groupedByYear.map(([year, yearWorks], yearIdx) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: yearIdx * 0.15 }}
              className="relative pl-12 md:pl-0 mb-16 last:mb-0"
            >
              {/* Year badge */}
              <div className="relative flex items-center mb-8">
                <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-accent border-4 border-primary shadow-lg z-10" />
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-accent">{year}</h3>
                </div>
              </div>

              {/* Works grid for this year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {yearWorks.map((work, idx) => (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: yearIdx * 0.15 + idx * 0.08 }}
                  >
                    <Link
                      to={`/work/${work.id}`}
                      className="block group relative overflow-hidden rounded-sm border border-surface-light hover:border-accent/50 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <ResponsiveImage
                          src={work.thumbnail_url || work.image_url}
                          alt={work.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-[10px] font-ui tracking-wider bg-accent/90 text-primary rounded-sm">
                            {getCategoryLabel(work.category)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-white/50 font-ui">
                            <Calendar size={10} />
                            {formatDate(work.created_at)}
                          </span>
                        </div>
                        <h4 className="font-display text-lg text-white leading-tight">{work.title}</h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-accent text-accent font-ui text-sm font-medium uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-500"
          >
            浏览完整作品集 <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Export
// ============================================================

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <WorksCarousel />
      <StatsSection />
      <TimelineSection />
      <CategoryNavigation />
    </main>
  );
}