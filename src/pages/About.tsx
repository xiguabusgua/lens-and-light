import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useInView as useInViewObserver } from 'react-intersection-observer';
import * as Icons from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface AboutData {
  name: string;
  title: string;
  bio: string;
  philosophy: string;
  avatarUrl: string;
  stats: {
    years: number;
    projects: number;
    clients: number;
    awards: number;
  };
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  services: Array<{
    icon: string;
    title: string;
    description: string;
    priceRange: string;
  }>;
}

const defaultAboutData: AboutData = {
  name: '陈明远',
  title: '视觉叙事者 / Visual Storyteller',
  bio: `从事专业摄影十五年，专注于通过镜头捕捉生命中的诗意瞬间。`,
  philosophy: '"摄影是在一瞬间内，同时认识到事件本身的意义，以及组织这一事件的形式结构。" —— 亨利·卡蒂埃-布列松',
  avatarUrl: 'https://picsum.photos/seed/photographer/400/533',
  stats: {
    years: 15,
    projects: 1200,
    clients: 350,
    awards: 28
  },
  timeline: [],
  services: []
};

let cachedAboutData: AboutData | null = null;
let dataLoadPromise: Promise<AboutData> | null = null;

async function fetchAboutData(): Promise<AboutData> {
  if (cachedAboutData) return cachedAboutData;
  
  if (!dataLoadPromise) {
    dataLoadPromise = axios.get('/api/about')
      .then(res => {
        const data = res.data.data;
        cachedAboutData = data;
        return data;
      })
      .catch(() => {
        return defaultAboutData;
      });
  }
  
  return dataLoadPromise;
}

export function useAboutData() {
  const [data, setData] = useState<AboutData>(defaultAboutData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData().then(aboutData => {
      setData(aboutData);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

const animationConfig = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const } },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } },
  },
  staggerContainer: {
    visible: { transition: { staggerChildren: 0.15 } },
  },
};

function StatCard({ value, label, index }: { value: number; label: string; index: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      variants={animationConfig.fadeUp}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        <div className="font-display text-4xl lg:text-5xl font-bold text-accent mb-2 group-hover:shadow-glow-accent transition-shadow duration-300">
          {count.toLocaleString()}
        </div>
        <div className="font-ui text-sm uppercase tracking-wider text-secondary-muted">
          {label}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TimelineItem({ year, title, description, index }: { year: string; title: string; description: string; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      variants={animationConfig.fadeUp}
      className={`relative flex items-center gap-8 lg:gap-16 ${
        isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
      }`}
    >
      <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'} hidden lg:block`}>
        <div className="bg-surface/50 p-6 rounded-sm hover:bg-surface transition-colors duration-300 group cursor-default">
          <div className="font-ui text-sm font-semibold text-accent mb-2">{year}</div>
          <h3 className="font-display text-lg font-semibold text-secondary mb-2">{title}</h3>
          <p className="font-body text-base text-secondary/70 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center z-10">
        <div className="w-4 h-4 rounded-full bg-accent border-4 border-primary shadow-glow-accent" />
      </div>

      <div className={`flex-1 ${isLeft ? 'lg:hidden' : ''} block`}>
        <div className="bg-surface/50 p-6 rounded-sm hover:bg-surface transition-colors duration-300 group cursor-default">
          <div className="font-ui text-sm font-semibold text-accent mb-2">{year}</div>
          <h3 className="font-display text-lg font-semibold text-secondary mb-2">{title}</h3>
          <p className="font-body text-base text-secondary/70 leading-relaxed">{description}</p>
        </div>
      </div>

      {!isLeft && <div className="hidden lg:block flex-1 lg:text-right">
        <div className="bg-surface/50 p-6 rounded-sm hover:bg-surface transition-colors duration-300 group cursor-default">
          <div className="font-ui text-sm font-semibold text-accent mb-2">{year}</div>
          <h3 className="font-display text-lg font-semibold text-secondary mb-2">{title}</h3>
          <p className="font-body text-base text-secondary/70 leading-relaxed">{description}</p>
        </div>
      </div>}
    </motion.div>
  );
}

function ServiceCard({ icon, title, description, priceRange }: { icon: string; title: string; description: string; priceRange: string }) {
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string; size?: number }>;

  return (
    <motion.div
      variants={animationConfig.fadeUp}
      whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-sm overflow-hidden group cursor-default border-b-2 border-transparent hover:border-accent transition-all duration-500"
    >
      <div className="p-8">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6"
        >
          {IconComponent && <IconComponent className="text-accent" size={28} />}
        </motion.div>

        <h3 className="font-display text-xl font-semibold text-secondary mb-3">{title}</h3>
        <p className="font-body text-base text-secondary/70 leading-relaxed mb-4">{description}</p>

        <span className="inline-block font-ui text-sm font-medium text-accent bg-accent/10 px-4 py-2 rounded-full">
          {priceRange}
        </span>
      </div>
    </motion.div>
  );
}

function HeroSection({ data }: { data: AboutData }) {
  return (
    <section className="pt-32 lg:pt-40 pb-24 bg-primary">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationConfig.slideLeft}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-sm corner-decoration">
              <img
                src={data.avatarUrl}
                alt={data.name}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 border border-accent/20 pointer-events-none" />
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-l-2 border-t-2 border-accent/40 hidden lg:block" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border-r-2 border-b-2 border-accent/40 hidden lg:block" />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={animationConfig.slideRight}
            className="space-y-6"
          >
            <span className="font-ui uppercase tracking-widest text-accent text-sm">关于我</span>

            <h1 className="font-display text-display-sm lg:text-display-md font-semibold text-secondary">
              {data.name}
            </h1>

            <p className="font-body text-xl italic text-accent/80">
              {data.title}
            </p>

            <div className="line-decoration" />

            <div className="space-y-4">
              {data.bio.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-body-custom">
                  {paragraph}
                </p>
              ))}
            </div>

            <blockquote className="relative pl-6 py-4 border-l-2 border-accent/30">
              <p className="font-body text-lg italic text-secondary/60 leading-relaxed">
                {data.philosophy}
              </p>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ data }: { data: AboutData }) {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.2 });

  const stats = [
    { value: data.stats.years, label: '年经验' },
    { value: data.stats.projects, label: '个项目' },
    { value: data.stats.clients, label: '位客户' },
    { value: data.stats.awards, label: '项荣誉' },
  ];

  return (
    <section className="py-24 lg:py-32 bg-primary-light">
      <div className="container-custom" ref={ref}>
        <motion.div
          variants={animationConfig.staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TimelineSection({ data }: { data: AboutData }) {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding bg-primary">
      <div className="container-custom" ref={ref}>
        <motion.div
          variants={animationConfig.fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16 text-center"
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">历程</span>
          <h2 className="heading-display mt-3 mb-4">创作之路</h2>
          <div className="line-decoration mx-auto mb-6" />
          <p className="heading-subtitle max-w-xl mx-auto">每一个里程碑都是成长的见证</p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-surface-light -translate-x-1/2 hidden lg:block" />

          <motion.div
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-12 lg:space-y-16"
          >
            {data.timeline.map((item, index) => (
              <TimelineItem key={index} {...item} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ data }: { data: AboutData }) {
  const [ref, inView] = useInViewObserver({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="section-padding bg-surface-dark pb-32">
      <div className="container-custom" ref={ref}>
        <motion.div
          variants={animationConfig.fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16 text-center"
        >
          <span className="text-accent font-ui uppercase tracking-widest text-sm">服务</span>
          <h2 className="heading-display mt-3 mb-4">合作方式</h2>
          <div className="line-decoration mx-auto mb-6" />
          <p className="heading-subtitle max-w-xl mx-auto">期待与您共同创造精彩视觉作品</p>
        </motion.div>

        <motion.div
          variants={animationConfig.staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {data.services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('请填写所有字段');
      return;
    }
    setFormError('');
    setFormStatus('sending');
    try {
      await axios.post('/api/contact', formData);
      setFormStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setFormStatus('error');
      setFormError('发送失败，请稍后重试或直接发送邮件至 hello@lenslight.com');
    }
  };

  return (
    <section className="section-padding bg-gradient-to-b from-transparent via-primary to-primary-light">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={animationConfig.fadeUp}
          className="text-center mb-16"
        >
          <h2 className="heading-display mb-6">联系我</h2>
          <p className="heading-subtitle max-w-xl mx-auto">有任何合作意向或问题，欢迎随时与我联系</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={animationConfig.fadeUp}
          className="max-w-xl mx-auto"
        >
          {formStatus === 'sent' ? (
            <div className="text-center py-12 bg-surface rounded-sm">
              <p className="font-display text-2xl text-accent mb-4">感谢您的留言！</p>
              <p className="text-secondary/60 mb-6">我会尽快回复您</p>
              <button onClick={() => setFormStatus('idle')} className="btn-ghost">发送新消息</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-secondary/60 mb-2">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-transparent border-b border-surface py-3 text-secondary placeholder-secondary/30 focus:outline-none focus:border-accent transition-colors"
                  placeholder="您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary/60 mb-2">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-transparent border-b border-surface py-3 text-secondary placeholder-secondary/30 focus:outline-none focus:border-accent transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary/60 mb-2">留言</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full bg-transparent border border-surface rounded-sm p-4 text-secondary placeholder-secondary/30 focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="请输入您的留言..."
                />
              </div>
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="btn-secondary w-full disabled:opacity-50"
              >
                {formStatus === 'sending' ? '发送中...' : '发送留言'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-transparent via-primary to-primary-light text-center">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={animationConfig.fadeUp}
        >
          <h2 className="heading-display mb-6">准备好开始您的视觉之旅了吗？</h2>
          <p className="heading-subtitle mb-10 max-w-2xl mx-auto">让我们一起用镜头讲述属于您的故事</p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText('hello@lenslight.com');
                alert('邮箱已复制到剪贴板：hello@lenslight.com');
              }}
              className="btn-secondary"
            >
              获取联系方式
            </button>
            <Link to="/portfolio" className="btn-primary">
              查看作品
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function About() {
  const { data, loading } = useAboutData();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-primary">
        <Loader2 size={40} className="text-accent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <HeroSection data={data} />
      <StatsSection data={data} />
      <TimelineSection data={data} />
      <ServicesSection data={data} />
      <CTASection />
      <BottomCTA />
    </main>
  );
}
