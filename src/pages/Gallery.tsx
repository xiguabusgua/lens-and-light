import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo, type Variants } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowLeft,
  Camera,
  Aperture,
  Timer,
  Sun,
  MapPin,
  Calendar,
  Sparkles,
  FlipHorizontal2,
  ZoomIn,
  ArrowUpDown,
  Tag as TagIcon,
  Loader2,
} from 'lucide-react';
import { cn, handleApiError, getResponsiveImage } from '@/lib/utils';
import axios from 'axios';

interface Work {
  id: number;
  title: string;
  category: string;
  image_url: string;
  thumbnail_url: string | null;
  description: string | null;
  story: string | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter: string | null;
  iso: number | null;
  location: string | null;
  date: string | null;
  featured: number;
  tag_list: Array<{ id: number; name: string; slug: string }>;
}

type TransitionMode = 'dissolve' | 'flip' | 'zoom' | 'slide';

const DISSOLVE_DURATION = 0.8;
const FLIP_DURATION = 0.7;
const ZOOM_DURATION = 0.6;
const SLIDE_DURATION = 0.65;

const dissolveVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(8px)',
  },
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    filter: 'blur(4px)',
  },
};

const flipVariants: Variants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0.5,
  }),
  center: {
    rotateY: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0.5,
  }),
};

const zoomVariants = {
  enter: {
    scale: 0.5,
    opacity: 0,
    rotate: -3,
  },
  center: {
    scale: 1,
    opacity: 1,
    rotate: 0,
  },
  exit: {
    scale: 1.8,
    opacity: 0,
    rotate: 3,
  },
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? '100%' : '-100%',
    opacity: 0.8,
  }),
};

const modeConfig: Record<TransitionMode, {
  label: string;
  icon: typeof Sparkles;
  variants: Variants;
  duration: number;
}> = {
  dissolve: {
    label: '溶解',
    icon: Sparkles,
    variants: dissolveVariants,
    duration: DISSOLVE_DURATION,
  },
  flip: {
    label: '翻转',
    icon: FlipHorizontal2,
    variants: flipVariants,
    duration: FLIP_DURATION,
  },
  zoom: {
    label: '缩放',
    icon: ZoomIn,
    variants: zoomVariants,
    duration: ZOOM_DURATION,
  },
  slide: {
    label: '滑动',
    icon: ArrowUpDown,
    variants: slideVariants,
    duration: SLIDE_DURATION,
  },
};

const MODE_ORDER: TransitionMode[] = ['dissolve', 'flip', 'zoom', 'slide'];

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

const panelMobileVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
};

function EnhancedSkeleton() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[90vw] max-w-5xl aspect-[16/10] bg-surface-dark rounded-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-surface-light/5 to-surface-dark" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/20 to-transparent"
        initial={{ y: '-100%' }}
        animate={{ y: '100%' }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '3px' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-ui text-xs uppercase tracking-[0.3em] text-secondary/30">
          Loading{dots}
        </span>
      </div>
    </div>
  );
}

function ImageShine() {
  return (
    <motion.div
      className="absolute inset-0 rounded-sm pointer-events-none z-10"
      initial={{ x: '-100%' }}
      animate={{ x: '200%' }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
    >
      <div
        className="h-full w-1/3"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)',
          filter: 'blur(2px)',
        }}
      />
    </motion.div>
  );
}

function TransitionModeSelector({
  currentMode,
  onModeChange,
}: {
  currentMode: TransitionMode;
  onModeChange: (mode: TransitionMode) => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-1" role="group" aria-label="切换动画模式">
      {MODE_ORDER.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isActive = currentMode === mode;
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={cn(
              'relative p-2 rounded-md transition-all duration-300',
              'hover:bg-surface-light/10 focus:outline-none focus:ring-1 focus:ring-accent/40',
              isActive && 'bg-surface-light/10'
            )}
            aria-label={`切换到${config.label}模式`}
            aria-pressed={isActive}
            title={`${config.label}模式 (按 ${MODE_ORDER.indexOf(mode) + 1})`}
          >
            <Icon
              size={14}
              className={cn(
                'transition-colors duration-300',
                isActive ? 'text-accent' : 'text-secondary/40 hover:text-secondary/70'
              )}
            />
            {isActive && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function TechnicalTable({ work }: { work: Work }) {
  const rows = [
    { label: '相机', value: work.camera, icon: Camera },
    { label: '镜头', value: work.lens, icon: Aperture },
    { label: '光圈', value: work.aperture, icon: Aperture },
    { label: '快门', value: work.shutter, icon: Timer },
    { label: 'ISO', value: work.iso ? String(work.iso) : null, icon: Sun },
    { label: '地点', value: work.location, icon: MapPin },
    { label: '日期', value: work.date, icon: Calendar },
  ].filter(r => r.value);

  return (
    <div className="border-t border-b border-surface-light/20 divide-y divide-surface-light/10">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2.5 px-1">
          <div className="flex items-center gap-2 text-secondary/50">
            <row.icon size={13} />
            <span className="font-ui text-xs uppercase tracking-wider">{row.label}</span>
          </div>
          <span className="font-body text-sm text-secondary/80">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function InfoPanel({
  work,
  isOpen,
  onClose,
  isMobile,
}: {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              variants={panelMobileVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[61] max-h-[75vh] overflow-y-auto rounded-t-xl bg-primary-light border-t border-surface-light/20 p-6 lg:hidden"
            >
              <InfoPanelContent work={work} onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      variants={panelVariants}
      initial="hidden"
      animate={isOpen ? 'visible' : 'hidden'}
      transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex fixed top-0 right-0 bottom-0 w-[420px] z-[55] flex-col bg-primary-light border-l border-surface-light/20 overflow-y-auto"
    >
      <InfoPanelContent work={work} onClose={onClose} />
    </motion.aside>
  );
}

function InfoPanelContent({
  work,
  onClose,
}: {
  work: Work;
  onClose: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-ui text-xs uppercase tracking-[0.25em] text-accent">作品详情</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-surface-light/10 transition-colors"
          aria-label="关闭信息面板"
        >
          <X size={18} className="text-secondary/60" />
        </button>
      </div>

      <div>
        <span className="inline-block px-3 py-1 text-xs font-ui font-medium uppercase tracking-wider text-accent border border-accent/30 rounded-sm mb-4">
          {work.category}
        </span>
        <h2 className="font-display text-2xl text-secondary leading-snug">{work.title}</h2>
        {work.description && (
          <p className="font-body text-base text-secondary/70 mt-4 leading-relaxed italic">
            {work.description}
          </p>
        )}
      </div>

      {work.tag_list && work.tag_list.length > 0 && (
        <div>
          <h4 className="font-ui text-xs uppercase tracking-[0.2em] text-secondary/40 mb-3">标签</h4>
          <div className="flex flex-wrap gap-2">
            {work.tag_list.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-ui tracking-wide text-secondary/60 bg-surface-dark/50 rounded-sm border border-surface-light/10"
              >
                <TagIcon size={10} />
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-ui text-xs uppercase tracking-[0.2em] text-secondary/40 mb-3">拍摄参数</h4>
        <TechnicalTable work={work} />
      </div>

      {work.story && (
        <div>
          <h4 className="font-ui text-xs uppercase tracking-[0.2em] text-secondary/40 mb-3">创作故事</h4>
          <div className="font-body text-secondary/70 leading-loose space-y-4">
            {work.story.split('\n').map((paragraph, i) => (
              <p key={i} className="indent-8">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Gallery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [direction, setDirection] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('dissolve');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [showShine, setShowShine] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const imageRef = useRef<HTMLDivElement>(null);

  const currentId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 100 } })
      .then(res => setWorks(res.data.data || []))
      .catch(err => setError(handleApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const currentIndex = useMemo(() => works.findIndex((w) => w.id === currentId), [currentId, works]);
  const currentWork = useMemo(() => works.find((w) => w.id === currentId), [currentId, works]);
  const activeConfig = useMemo(() => modeConfig[transitionMode], [transitionMode]);

  const goTo = useCallback(
    (newDirection: number) => {
      if (works.length === 0) return;
      setDirection(newDirection);
      setImageLoaded(false);
      setShowShine(false);
      const nextIndex = (currentIndex + newDirection + works.length) % works.length;
      navigate(`/gallery/${works[nextIndex].id}`, { replace: true });
    },
    [currentIndex, works.length, navigate]
  );

  const goPrev = useCallback(() => goTo(-1), [goTo]);
  const goNext = useCallback(() => goTo(1), [goTo]);
  const handleClose = useCallback(() => navigate('/portfolio'), [navigate]);
  const togglePanel = useCallback(() => setPanelOpen((prev) => !prev), []);

  const cycleMode = useCallback(() => {
    const idx = MODE_ORDER.indexOf(transitionMode);
    const nextIdx = (idx + 1) % MODE_ORDER.length;
    setTransitionMode(MODE_ORDER[nextIdx]);
  }, [transitionMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Escape':
          e.preventDefault();
          if (panelOpen) {
            setPanelOpen(false);
          } else {
            handleClose();
          }
          break;
        case '1':
          setTransitionMode('dissolve');
          break;
        case '2':
          setTransitionMode('flip');
          break;
        case '3':
          setTransitionMode('zoom');
          break;
        case '4':
          setTransitionMode('slide');
          break;
        case 't':
        case 'T':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            cycleMode();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext, handleClose, panelOpen, cycleMode, transitionMode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    setPanelOpen(false);
    setImageLoaded(false);
    setShowShine(false);
  }, [id]);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => setShowShine(true), 50);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 80;
      if (info.offset.x > threshold) goPrev();
      else if (info.offset.x < -threshold) goNext();
    },
    [goPrev, goNext]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center gap-4">
        <p className="font-body text-lg text-red-400">{error}</p>
        <button onClick={() => navigate('/portfolio')} className="btn-ghost">返回作品集</button>
      </div>
    );
  }

  if (!currentWork) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center">
        <p className="font-body text-lg text-secondary/50 italic">作品未找到</p>
        <button
          onClick={() => navigate('/portfolio')}
          className="btn-ghost mt-6 absolute bottom-16"
        >
          返回作品集
        </button>
      </div>
    );
  }

  const isFlipMode = transitionMode === 'flip';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 80% 60% at ${mousePos.x}% ${mousePos.y}%, rgba(30,28,26,1) 0%, rgba(6,5,5,1) 70%)`,
      }}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-label={`查看作品：${currentWork.title}`}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          animation: 'noiseShift 0.3s steps(2) infinite',
        }}
      />

      <style>{`
        @keyframes noiseShift {
          0% { background-position: 0 0; }
          50% { background-position: 64px 64px; }
          100% { background-position: 0 0; }
        }
      `}</style>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 z-[58] p-3 rounded-full bg-surface/30 hover:bg-surface/60 backdrop-blur-sm transition-all duration-300 group"
        aria-label="关闭灯箱"
      >
        <X size={22} className="text-secondary/70 group-hover:text-secondary transition-colors" />
      </button>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative px-4 sm:px-8 lg:pr-[420px]">
        {/* Prev Button */}
        <button
          onClick={goPrev}
          className={cn(
            'absolute left-3 sm:left-6 z-[57] p-3 rounded-full',
            'bg-surface/20 hover:bg-surface/50 backdrop-blur-sm',
            'transition-all duration-300 opacity-60 hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-accent/50'
          )}
          aria-label="上一张"
        >
          <ChevronLeft size={24} className="text-secondary" />
        </button>

        {/* Image Container */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentWork.id}
            custom={direction}
            variants={activeConfig.variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'tween',
              duration: activeConfig.duration,
              ease: [0.4, 0, 0.2, 1],
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            ref={imageRef}
            className={cn(
              'relative w-[90vw] max-w-5xl max-h-[85vh]',
              isFlipMode && 'style-flat'
            )}
            style={
              isFlipMode
                ? { perspective: '1000px', transformStyle: 'preserve-3d' as const }
                : undefined
            }
          >
            {!imageLoaded && <EnhancedSkeleton />}
            <motion.img
              {...getResponsiveImage(currentWork.image_url)}
              alt={currentWork.title}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? [0.98, 1.01, 1] : 1,
              }}
              transition={{
                opacity: { duration: 0.4, ease: 'easeOut' },
                scale: { duration: 0.45, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] },
              }}
              className={cn(
                'max-h-[85vh] w-auto max-w-[90vw] object-contain rounded-sm relative z-[1]',
                isFlipMode && 'backface-hidden'
              )}
              style={isFlipMode ? { backfaceVisibility: 'hidden' as const } : undefined}
            />
            {imageLoaded && showShine && <ImageShine />}
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <button
          onClick={goNext}
          className={cn(
            'absolute right-3 sm:right-6 z-[57] p-3 rounded-full lg:right-[436px]',
            'bg-surface/20 hover:bg-surface/50 backdrop-blur-sm',
            'transition-all duration-300 opacity-60 hover:opacity-100',
            'focus:outline-none focus:ring-2 focus:ring-accent/50'
          )}
          aria-label="下一张"
        >
          <ChevronRight size={24} className="text-secondary" />
        </button>

        {/* Desktop Info Toggle */}
        <button
          onClick={togglePanel}
          className={cn(
            'hidden lg:flex absolute left-6 bottom-6 z-[57]',
            'p-3 rounded-full items-center justify-center gap-2',
            'bg-surface/20 hover:bg-surface/50 backdrop-blur-sm',
            'transition-all duration-300 group',
            panelOpen && 'bg-accent/20'
          )}
          aria-label={panelOpen ? '收起详情' : '展开详情'}
        >
          <Info size={18} className={cn(panelOpen ? 'text-accent' : 'text-secondary/70 group-hover:text-secondary', 'transition-colors')} />
          <span className={cn('font-ui text-xs uppercase tracking-wider', panelOpen ? 'text-accent' : 'text-secondary/50 group-hover:text-secondary/70')}>
            {panelOpen ? '收起' : '详情'}
          </span>
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="lg:pl-0 px-4 sm:px-8 pb-6 pt-4 lg:pt-2 flex items-center justify-between lg:justify-center gap-4 lg:pr-[420px] relative z-[58]">
        <div className="flex items-center gap-3">
          <TransitionModeSelector
            currentMode={transitionMode}
            onModeChange={setTransitionMode}
          />
          <span className="font-ui text-sm text-secondary/40 tracking-widest hidden sm:inline-block">
            {String(currentIndex + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
          </span>
        </div>
        <h2 className="font-display text-lg text-secondary/80 truncate max-w-[200px] sm:max-w-none">
          {currentWork.title}
        </h2>
        <button
          onClick={handleClose}
          className="btn-ghost text-xs"
        >
          <ArrowLeft size={14} />
          返回作品集
        </button>
      </div>

      {/* Mobile Info Toggle */}
      <button
        onClick={togglePanel}
        className={cn(
          'lg:hidden fixed bottom-24 right-5 z-[56]',
          'p-3 rounded-full shadow-large',
          'bg-surface/90 hover:bg-accent text-secondary hover:text-primary',
          'transition-all duration-300'
        )}
        aria-label="查看作品详情"
      >
        <Info size={18} />
      </button>

      {/* Info Panel */}
      <InfoPanel
        work={currentWork}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        isMobile
      />

      {/* Backdrop when panel is open on desktop */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setPanelOpen(false)}
            className="hidden lg:block fixed inset-0 z-[54] bg-primary/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
