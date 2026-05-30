import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Pagination } from 'swiper/modules';
import { motion, useInView } from 'framer-motion';
import { useInView as useInViewObserver } from 'react-intersection-observer';
import { ArrowRight, ChevronDown, Grid3X3, User, Mountain, Camera, Briefcase, Tag as TagIcon, Loader2 } from 'lucide-react';
import { getFeaturedWorks } from '../data/works';
import type { Work } from '../data/works';
import { categories } from '../data/categories';
import { getFullImageUrl, getCategoryLabel } from '@/lib/utils';
import type { ApiWork } from '@/lib/utils';
import axios from 'axios';
import ResponsiveImage from '@/components/ResponsiveImage';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const iconMap: Record<string, React.ReactNode> = {
  Grid3X3: <Grid3X3 className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
};

const animationConfig = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const } },
  },
  staggerContainer: {
    visible: { transition: { staggerChildren: 0.1 } },
  },
};

function useParallax(intensity: number = 0.3) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const effectiveIntensity = isMobile ? intensity * 0.33 : intensity;
  return scrollY * effectiveIntensity;
}

function AnimatedTitle({ text }: { text: string }) {
  return (
    <h1 className="font-display text-display-md lg:text-display-xl font-semibold text-white mb-6 inline-flex overflow-hidden">
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: Math.random() > 0.5 ? -30 : 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 + i * 0.05, duration: 0.6, type: "spring", stiffness: 150, damping: 15 }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </h1>
  );
}

function FloatingParticles({ count = 15 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5,
      })),
    [count]
  );

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/25"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{
            y: [0, -p.size * 4, -p.size * 2, -p.size * 6, 0],
            x: [0, p.size, -p.size * 0.5, p.size * 0.5, 0],
            opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

const heroTextVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
};
const tagVariants = { hidden: { opacity: 0, y: 20, filter: "blur(8px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7 } } };
const descriptionVariants = { hidden: { opacity: 0, y: 20, filter: "blur(6px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, delay: 0.2 } } };
const ctaVariants = { hidden: { opacity: 0, scale: 0.9, filter: "blur(4px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, delay: 0.5 } } };

function HeroSection() {
  const [featuredWorks, setFeaturedWorks] = useState<{ title: string; imageUrl: string; description: string }[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const parallaxBg = useParallax(0.3);
  const parallaxText = useParallax(0.12);

  useEffect(() => {
    axios.get('/api/works', { params: { featured: 'true', status: 'active', limit: 5 } })
      .then(res => {
        const data = res.data.data || [];
        if (data.length > 0) {
          setFeaturedWorks(data.map((w: ApiWork) => ({
            title: w.title,
            imageUrl: w.image_url,
            description: w.description || ''
          })));
        } else {
          const staticWorks = getFeaturedWorks();
          setFeaturedWorks(staticWorks.map(w => ({ title: w.title, imageUrl: w.imageUrl, description: w.description })));
        }
      })
      .catch(() => {
        const staticWorks = getFeaturedWorks();
        setFeaturedWorks(staticWorks.map(w => ({ title: w.title, imageUrl: w.imageUrl, description: w.description })));
      })
      .finally(() => setHeroLoading(false));
  }, []);

  if (heroLoading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-primary flex items-center justify-center">
        <Loader2 size={40} className="text-accent animate-spin" />
      </section>
    );
  }

  if (featuredWorks.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet-custom', bulletActiveClass: 'swiper-pagination-bullet-active-custom' }}
        className="h-full w-full"
      >
        {featuredWorks.map((work, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="absolute inset-0" style={{ transform: `translateY(${parallaxBg}px)` }}>
              <ResponsiveImage src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" loading="eager" priority />
            </div>

            <div className="absolute inset-0 bg-black/50" />
            <FloatingParticles />

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4" style={{ transform: `translateY(${parallaxText}px)` }}>
              <motion.div variants={heroTextVariants} initial="hidden" animate="visible">
                <motion.span variants={tagVariants} className="font-ui uppercase tracking-widest text-accent text-sm mb-6">精选作品</motion.span>
                <AnimatedTitle text={work.title} />
                <motion.p variants={descriptionVariants} className="font-body text-body-lg italic text-white/90 max-w-2xl mb-10">{work.description}</motion.p>
                <motion.div variants={ctaVariants}>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link to="/portfolio" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-accent text-accent font-ui text-sm font-medium uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-500 group">探索更多 <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
                    <Link to="/about" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white/80 font-ui text-sm font-medium uppercase tracking-widest hover:border-white hover:text-white transition-all duration-500 group">关于我 <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5">
        <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-white/40 select-none">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={20} className="text-accent/60" />
        </motion.div>
      </motion.div>

      <style>{`
        .swiper-pagination-bullet-custom { width: 24px !important; height: 3px !important; border-radius: 2px !important; background: rgba(255,255,255,0.3) !important; transition: all 0.4s; }
        .swiper-pagination-bullet-active-custom { width: 48px !important; background: rgb(var(--color-accent)) !important; }
      `}</style>
    </section>
  );
}

function WorksPreview() {
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 6 } })
      .then(res => {
        setWorks(res.data.data || []);
      })
      .catch(err => {
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div variants={animationConfig.fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} className="mb-16">
          <span className="text-accent font-ui uppercase tracking-widest text-sm">精选</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary mt-3 mb-4">作品集</h2>
          <div className="w-16 h-[1px] bg-accent mb-6" />
          <p className="font-body text-lg lg:text-xl italic text-secondary/70 max-w-xl">每一幅作品都是一个等待被讲述的故事</p>
        </motion.div>

        {works.length > 0 ? (
          <>
            <motion.div
              variants={animationConfig.staggerContainer}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6"
            >
              {works.map((work: ApiWork, index: number) => (
                <motion.div
                  key={work.id}
                  variants={animationConfig.fadeUp}
                  className={`relative overflow-hidden rounded-sm cursor-pointer group ${index % 3 === 0 ? 'md:row-span-2' : ''}`}
                  style={{ aspectRatio: index % 3 === 0 ? undefined : '4/5' }}
                >
                  <Link to={`/work/${work.id}`} className="block w-full h-full relative">
                    <ResponsiveImage
                      src={work.thumbnail_url || work.image_url}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="inline-block px-3 py-1 text-xs font-ui tracking-wider border border-accent rounded-full text-accent mb-3">
                        {getCategoryLabel(work.category)}
                      </span>
                      <h3 className="font-display text-xl text-white">{work.title}</h3>
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
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={animationConfig.fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mt-16">
              <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-primary font-ui text-sm font-semibold uppercase tracking-widest hover:bg-accent-light shadow-lg hover:shadow-accent/25 transition-all duration-500 rounded-sm">
                查看全部作品 <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20">
            <Camera size={48} className="text-secondary/20 mb-4" />
            <p className="text-lg text-secondary/50 italic font-serif">暂无作品</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CategoryNavigation() {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div variants={animationConfig.fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <span className="text-accent font-ui uppercase tracking-widest text-sm">浏览</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-secondary mt-3 mb-4">按主题分类</h2>
          <div className="w-16 h-[1px] bg-accent mx-auto mb-6" />
        </motion.div>

        <motion.div 
          variants={animationConfig.staggerContainer} 
          initial="hidden" 
          animate={inView ? "visible" : "hidden"}
          className="flex flex-wrap justify-center gap-4"
        >
          {categories.filter(c => c.id !== 'all').map((cat) => (
            <motion.div key={cat.id} variants={animationConfig.fadeUp}>
              <Link
                to={`/portfolio/${cat.id}`}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-surface-light font-ui text-sm text-secondary/80 hover:border-accent hover:text-accent transition-all duration-300 hover:-translate-y-1"
              >
                {iconMap[cat.icon]}
                <span>{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <WorksPreview />
      <CategoryNavigation />
    </main>
  );
}
