import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Aperture,
  Timer,
  Sun,
  MapPin,
  Calendar,
  Maximize2,
  Minimize2,
  Share2,
  Link2,
  Edit2,
  Loader2,
} from 'lucide-react';
import { cn, getFullImageUrl, handleApiError, type ApiWork } from '@/lib/utils';
import axios from 'axios';
import ResponsiveImage from '@/components/ResponsiveImage';

interface Work extends ApiWork {}

function ImageSkeleton() {
  return (
    <div className="w-full h-full bg-primary-light rounded-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-light via-surface-light/5 to-primary-light" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        style={{ width: '3px' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 size={28} className="text-accent animate-spin" />
      </div>
    </div>
  );
}

function TechnicalInfoGrid({ work }: { work: Work }) {
  const items = [
    { label: '相机', value: work.camera, icon: Camera },
    { label: '镜头', value: work.lens, icon: Aperture },
    { label: '光圈', value: work.aperture, icon: Aperture },
    { label: '快门', value: work.shutter, icon: Timer },
    { label: 'ISO', value: work.iso ? String(work.iso) : null, icon: Sun },
    { label: '拍摄地点', value: work.location, icon: MapPin },
    { label: '拍摄日期', value: work.date, icon: Calendar },
  ].filter(r => r.value);

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start gap-2.5 p-3 rounded-sm bg-surface-dark/50 border border-surface-light/10"
        >
          <item.icon size={14} className="text-accent/60 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-ui text-[10px] uppercase tracking-wider text-secondary/40 mb-0.5">
              {item.label}
            </div>
            <div className="font-body text-sm text-secondary/80 truncate">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialShareButtons({ work }: { work: Work }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const shareText = encodeURIComponent(`${work.title} - 摄影作品`);
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <div className="flex items-center gap-2">
      <span className="font-ui text-xs uppercase tracking-wider text-secondary/40 mr-1">分享</span>
      <button
        onClick={() => window.open(`https://service.weibo.com/share/share.php?title=${shareText}&url=${shareUrl}`, '_blank', 'noopener')}
        className="p-2 rounded-sm bg-surface-dark/50 border border-surface-light/10 hover:bg-accent/10 hover:border-accent/20 transition-colors"
        aria-label="分享到微博"
        title="分享到微博"
      >
        <Share2 size={14} className="text-secondary/60" />
      </button>
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-sm bg-surface-dark/50 border border-surface-light/10 hover:bg-accent/10 hover:border-accent/20 transition-colors relative"
        aria-label="复制链接"
        title="复制链接"
      >
        {copied ? (
          <span className="font-ui text-[10px] text-accent">已复制</span>
        ) : (
          <Link2 size={14} className="text-secondary/60" />
        )}
      </button>
    </div>
  );
}

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentId = Number(id);
  const currentIndex = works.findIndex((w) => w.id === currentId);
  const prevWork = currentIndex > 0 ? works[currentIndex - 1] : null;
  const nextWork = currentIndex < works.length - 1 ? works[currentIndex + 1] : null;

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('admin_token'));
  }, []);

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 100 } })
      .then(res => {
        const data = res.data.data || [];
        setWorks(data);
        const found = data.find((w: Work) => w.id === currentId);
        if (found) {
          setWork(found);
          setEditTitle(found.title);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentId]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveTitle = useCallback(() => {
    if (work && editTitle.trim()) {
      axios.put(`/api/works/${work.id}`, { title: editTitle.trim() })
        .then(() => {
          setWork(prev => prev ? { ...prev, title: editTitle.trim() } : null);
        })
        .catch(() => {});
    }
    setIsEditing(false);
  }, [work, editTitle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') setIsEditing(false);
  }, [handleSaveTitle]);

  const navigateToWork = useCallback((newId: number) => {
    navigate(`/work/${newId}`, { replace: false });
    setImageLoaded(false);
  }, [navigate]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (isEditing) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (prevWork) navigateToWork(prevWork.id);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (nextWork) navigateToWork(nextWork.id);
          break;
        case 'Escape':
          e.preventDefault();
          navigate('/portfolio');
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setFullscreen(prev => !prev);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isEditing, prevWork, nextWork, navigateToWork, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <p className="font-body text-lg text-secondary/50 italic mb-6">作品未找到</p>
        <button
          onClick={() => navigate('/portfolio')}
          className="btn-ghost"
        >
          <ArrowLeft size={14} />
          返回作品集
        </button>
      </div>
    );
  }

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center">
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-5 right-5 z-[51] p-3 rounded-full bg-surface/30 hover:bg-surface/60 backdrop-blur-sm transition-all duration-300"
          aria-label="退出全屏"
        >
          <Minimize2 size={22} className="text-secondary/70" />
        </button>

        <button
          onClick={() => prevWork && navigateToWork(prevWork.id)}
          className={cn(
            'absolute left-5 z-[51] p-3 rounded-full bg-surface/20 hover:bg-surface/50 backdrop-blur-sm transition-all duration-300',
            !prevWork && 'opacity-30 pointer-events-none'
          )}
          aria-label="上一张"
        >
          <ChevronLeft size={24} className="text-secondary" />
        </button>

        <button
          onClick={() => nextWork && navigateToWork(nextWork.id)}
          className={cn(
            'absolute right-5 z-[51] p-3 rounded-full bg-surface/20 hover:bg-surface/50 backdrop-blur-sm transition-all duration-300',
            !nextWork && 'opacity-30 pointer-events-none'
          )}
          aria-label="下一张"
        >
          <ChevronRight size={24} className="text-secondary" />
        </button>

        <motion.img
          key={work.id}
          src={getFullImageUrl(work.image_url)}
          alt={work.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-h-[95vh] max-w-[95vw] object-contain"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary" ref={containerRef}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left: Image Area (70%) */}
        <div className="lg:w-[70%] relative bg-primary">
          {/* Back Button */}
          <button
            onClick={() => navigate('/portfolio')}
            className="absolute top-5 left-5 z-20 p-2.5 rounded-full bg-surface/30 hover:bg-surface/60 backdrop-blur-sm transition-all duration-300 group"
            aria-label="返回作品集"
          >
            <ArrowLeft size={18} className="text-secondary/70 group-hover:text-secondary transition-colors" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-surface/30 hover:bg-surface/60 backdrop-blur-sm transition-all duration-300 group"
            aria-label="全屏查看"
          >
            <Maximize2 size={18} className="text-secondary/70 group-hover:text-secondary transition-colors" />
          </button>

          {/* Navigation Arrows */}
          {prevWork && (
            <button
              onClick={() => navigateToWork(prevWork.id)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-surface/20 hover:bg-surface/50 backdrop-blur-sm transition-all duration-300 opacity-60 hover:opacity-100"
              aria-label="上一张"
            >
              <ChevronLeft size={24} className="text-secondary" />
            </button>
          )}
          {nextWork && (
            <button
              onClick={() => navigateToWork(nextWork.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-surface/20 hover:bg-surface/50 backdrop-blur-sm transition-all duration-300 opacity-60 hover:opacity-100"
              aria-label="下一张"
            >
              <ChevronRight size={24} className="text-secondary" />
            </button>
          )}

          {/* Image */}
          <div className="w-full h-[50vh] lg:h-screen flex items-center justify-center p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={work.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full"
              >
                {!imageLoaded && <ImageSkeleton />}
                <ResponsiveImage
                  src={work.image_url}
                  alt={work.title}
                  blurSrc={work.thumbnail_url}
                  className="w-full h-full object-contain rounded-sm"
                  onLoad={() => setImageLoaded(true)}
                  style={{
                    opacity: imageLoaded ? 1 : 0,
                    transform: imageLoaded ? 'scale(1)' : 'scale(0.98)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Counter */}
          <div className="absolute bottom-5 left-5 z-10 font-ui text-xs text-secondary/40 tracking-widest">
            {String(currentIndex + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
          </div>
        </div>

        {/* Right: Info Panel (30%) */}
        <div className="lg:w-[30%] bg-primary border-l border-surface-light/10 overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {/* Title */}
            <div>
              {isAdmin && isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-b border-accent/30 font-display text-xl text-secondary leading-snug focus:outline-none pb-1"
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <h1 className="font-display text-xl lg:text-2xl text-secondary leading-snug">
                    {work.title}
                  </h1>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-sm hover:bg-surface-light/10 transition-colors flex-shrink-0"
                      aria-label="编辑标题"
                    >
                      <Edit2 size={14} className="text-secondary/40 hover:text-accent" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Category Tag */}
            <span className="inline-block px-3 py-1 text-xs font-ui font-medium uppercase tracking-wider text-accent border border-accent/30 rounded-sm">
              {work.category}
            </span>

            {/* Description */}
            {work.description && (
              <p className="font-body text-base text-secondary/70 leading-relaxed italic">
                {work.description}
              </p>
            )}

            {/* Tags */}
            {work.tag_list && work.tag_list.length > 0 && (
              <div>
                <h4 className="font-ui text-[10px] uppercase tracking-[0.2em] text-secondary/40 mb-2.5">
                  标签
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {work.tag_list.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-ui text-secondary/60 bg-surface-dark/50 rounded-sm border border-surface-light/10"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Info */}
            <div>
              <h4 className="font-ui text-[10px] uppercase tracking-[0.2em] text-secondary/40 mb-3">
                拍摄参数
              </h4>
              <TechnicalInfoGrid work={work} />
            </div>

            {/* Story */}
            {work.story && (
              <div>
                <h4 className="font-ui text-[10px] uppercase tracking-[0.2em] text-secondary/40 mb-3">
                  创作故事
                </h4>
                <div className="font-body text-secondary/70 leading-loose space-y-3">
                  {work.story.split('\n').map((paragraph, i) => (
                    <p key={i} className="indent-6 text-sm">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <SocialShareButtons work={work} />

            {/* Divider */}
            <div className="w-12 h-[1px] bg-accent/20" />

            {/* Prev/Next Navigation */}
            <div className="space-y-3">
              {prevWork && (
                <button
                  onClick={() => navigateToWork(prevWork.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-sm bg-surface-dark/30 hover:bg-surface-dark/60 border border-surface-light/10 transition-colors group text-left"
                >
                  <ChevronLeft size={16} className="text-accent/60 group-hover:text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-ui text-[10px] uppercase tracking-wider text-secondary/30 mb-0.5">上一篇</div>
                    <div className="font-display text-sm text-secondary/80 truncate group-hover:text-secondary transition-colors">
                      {prevWork.title}
                    </div>
                  </div>
                </button>
              )}
              {nextWork && (
                <button
                  onClick={() => navigateToWork(nextWork.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-sm bg-surface-dark/30 hover:bg-surface-dark/60 border border-surface-light/10 transition-colors group text-left"
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="font-ui text-[10px] uppercase tracking-wider text-secondary/30 mb-0.5">下一篇</div>
                    <div className="font-display text-sm text-secondary/80 truncate group-hover:text-secondary transition-colors">
                      {nextWork.title}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-accent/60 group-hover:text-accent flex-shrink-0" />
                </button>
              )}
            </div>

            {/* Back to Portfolio */}
            <button
              onClick={() => navigate('/portfolio')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-surface-light/20 text-secondary/60 hover:text-accent hover:border-accent/30 transition-colors font-ui text-xs uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              返回作品集
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Info Toggle (shows on small screens as a bottom sheet) */}
      <MobileInfoPanel work={work} />
    </div>
  );
}

function MobileInfoPanel({ work }: { work: Work }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-primary/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-xl bg-primary border-t border-surface-light/20 p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-ui text-xs uppercase tracking-[0.25em] text-accent">作品详情</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-light/10 transition-colors"
                >
                  <span className="font-ui text-sm text-secondary/60">关闭</span>
                </button>
              </div>

              <div className="space-y-4">
                <span className="inline-block px-3 py-1 text-xs font-ui font-medium uppercase tracking-wider text-accent border border-accent/30 rounded-sm">
                  {work.category}
                </span>

                <h2 className="font-display text-xl text-secondary leading-snug">{work.title}</h2>

                {work.description && (
                  <p className="font-body text-base text-secondary/70 leading-relaxed italic">
                    {work.description}
                  </p>
                )}

                {work.tag_list && work.tag_list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {work.tag_list.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-ui text-secondary/60 bg-surface-dark/50 rounded-sm border border-surface-light/10"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <TechnicalInfoGrid work={work} />

                {work.story && (
                  <div>
                    <h4 className="font-ui text-[10px] uppercase tracking-[0.2em] text-secondary/40 mb-2">创作故事</h4>
                    <div className="font-body text-secondary/70 leading-loose space-y-3">
                      {work.story.split('\n').map((paragraph, i) => (
                        <p key={i} className="indent-6 text-sm">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-surface-light/10">
                  <SocialShareButtons work={work} />
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="btn-ghost text-xs"
                  >
                    <ArrowLeft size={14} />
                    返回作品集
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-5 z-30 p-3 rounded-full shadow-large bg-surface/90 hover:bg-accent text-secondary hover:text-primary transition-all duration-300"
        aria-label="查看作品详情"
      >
        <Share2 size={18} />
      </button>
    </>
  );
}
