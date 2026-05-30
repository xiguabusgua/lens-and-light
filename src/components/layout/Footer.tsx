import { Link } from 'react-router-dom';
import { Instagram, ExternalLink, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/portfolio', label: '作品集' },
  { path: '/about', label: '关于' },
];

const socialLinks = [
  {
    icon: Instagram,
    href: 'https://instagram.com',
    label: 'Instagram',
  },
  {
    icon: ExternalLink,
    href: 'https://behance.net',
    label: 'Behance',
  },
  {
    icon: MessageCircle,
    href: '#',
    label: '微信',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary relative">
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        aria-hidden="true"
      />

      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-4">
            <Link
              to="/"
              className="font-display text-2xl text-secondary tracking-wide hover:text-accent transition-colors duration-300 inline-block"
            >
              Lens & Light
            </Link>
            <p className="font-body text-secondary/60 leading-relaxed max-w-xs">
              用镜头捕捉光影的瞬间，用影像讲述动人的故事。专注于人像、风光与纪实摄影创作。
            </p>
          </div>

          <div>
            <h3 className="font-ui text-sm uppercase tracking-widest text-accent mb-6">
              快速链接
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-body text-lg text-secondary/70 hover:text-accent transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-accent group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm uppercase tracking-widest text-accent mb-6">
              社交媒体
            </h3>
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={cn(
                      'w-11 h-11 rounded-full border border-surface-light flex items-center justify-center',
                      'text-secondary/70 hover:text-accent hover:border-accent',
                      'transition-all duration-300 hover:shadow-glow-accent'
                    )}
                  >
                    <IconComponent size={20} />
                  </a>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-light/30">
              <p className="font-body text-secondary/50 text-sm">
                欢迎通过社交媒体与我取得联系，期待与您合作。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-light/20">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-ui text-xs text-secondary/40 uppercase tracking-wider">
              © {currentYear} Lens & Light. 保留所有权利。
            </p>
            <p className="font-body text-sm text-secondary/40 italic">
              以光影为笔，书写视觉诗篇
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}