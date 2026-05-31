import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Images, Plus, ExternalLink, LogOut, Menu, User, LayoutGrid, ChevronRight, Tags, FolderTree, BookOpen, Info, HardDrive, Palette, Image } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import WorksList from './pages/WorksList';
import WorkForm from './pages/WorkForm';
import LayoutSettings from './pages/LayoutSettings';
import CategoryManagement from './pages/CategoryManagement';
import TagManagement from './pages/TagManagement';
import AlbumManagement from './pages/AlbumManagement';
import HeroSlideManagement from './pages/HeroSlideManagement';
import AboutManagement from './pages/AboutManagement';
import MediaLibrary from './pages/MediaLibrary';
import ThemeSettings from './pages/ThemeSettings';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<AdminLayout><AdminOutlet /></AdminLayout>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="works" element={<WorksList />} />
        <Route path="works/new" element={<WorkForm />} />
        <Route path="works/:id/edit" element={<WorkForm />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="tags" element={<TagManagement />} />
        <Route path="albums" element={<AlbumManagement />} />
        <Route path="hero-slides" element={<HeroSlideManagement />} />
        <Route path="about" element={<AboutManagement />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="settings" element={<LayoutSettings />} />
        <Route path="theme" element={<ThemeSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

function Login() {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  
  useEffect(() => {
    if (token) navigate('/admin/dashboard');
  }, [token, navigate]);

  const [LoginComp, setLoginComp] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('./pages/Login').then(m => {
      setLoginComp(() => m.default);
      setLoading(false);
    });
  }, []);

  if (token) return null;
  if (loading || !LoginComp) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--admin-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid rgba(201,169,110,0.3)',
          borderTopColor: '#c9a96e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return <LoginComp />;
}

function AdminOutlet() { return <Outlet />; }

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [worksMenuOpen, setWorksMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('admin_token');
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    if (location.pathname?.startsWith('/admin/works')) {
      setWorksMenuOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  useEffect(() => {
    axios.get('/api/admin/theme')
      .then(res => {
        if (res.data?.data) {
          const t = res.data.data;
          const root = document.documentElement;
          root.style.setProperty('--admin-bg', t.bg);
          root.style.setProperty('--admin-card', t.card);
          root.style.setProperty('--admin-raised', t.raised);
          root.style.setProperty('--admin-table', t.table);
          root.style.setProperty('--admin-border', t.border);
          root.style.setProperty('--admin-border-light', t.borderLight);
          root.style.setProperty('--admin-text', t.text);
          root.style.setProperty('--admin-text-muted', t.textMuted);
          root.style.setProperty('--admin-text-dim', t.textDim);
          root.style.setProperty('--admin-text-subtle', t.textSubtle);
          root.style.setProperty('--admin-accent', t.accent);
          root.style.setProperty('--admin-accent-hover', t.accentHover);

          if (t.backgroundImage) {
            root.style.setProperty(
              '--admin-bg-image',
              `url(${getFullImageUrl(t.backgroundImage)})`,
            );
            root.style.setProperty('--admin-bg-opacity', '0.85');
          } else {
            root.style.setProperty('--admin-bg-image', 'none');
            root.style.setProperty('--admin-bg-opacity', '1');
          }
          setThemeLoaded(true);
        } else {
          setThemeLoaded(true);
        }
      })
      .catch(() => setThemeLoaded(true));
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  type NavChild = { to: string; icon: React.ElementType; label: string };
type NavItem = { to: string; icon: React.ElementType; label: string } | { icon: React.ElementType; label: string; to: string; children: NavChild[] };

  const navItems: NavItem[] = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘' },
    {
      icon: Images,
      label: '作品管理',
      to: '/admin/works',
      children: [
        { to: '/admin/works', icon: Images, label: '作品列表' },
        { to: '/admin/works/new', icon: Plus, label: '新建作品' },
      ]
    },
    { to: '/admin/albums', icon: BookOpen, label: '相册管理' },
    { to: '/admin/hero-slides', icon: Image, label: '轮播图管理' },
    { to: '/admin/about', icon: Info, label: '关于页面' },
    { to: '/admin/media', icon: HardDrive, label: '媒体库' },
    { to: '/admin/categories', icon: FolderTree, label: '分类管理' },
    { to: '/admin/tags', icon: Tags, label: '标签管理' },
    { to: '/admin/settings', icon: LayoutGrid, label: '布局设置' },
    { to: '/admin/theme', icon: Palette, label: '主题配色' },
  ];

  const worksGroup = navItems.find(i => 'children' in i);
  const isWorksActive = location.pathname?.startsWith('/admin/works') || false;

  const toggleWorksMenu = () => {
    if (isWorksActive && worksMenuOpen) {
      setWorksMenuOpen(false);
    } else {
      setWorksMenuOpen(true);
    }
    navigate(worksGroup?.to || '/admin/works');
  };

  const accent = 'var(--admin-accent)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg)', display: 'flex' }}>
      <aside style={{
        width: open ? '256px' : '72px',
        background: 'var(--admin-table)',
        borderRight: '1px solid var(--admin-border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '20px 16px', 
          borderBottom: '1px solid var(--admin-border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ 
            fontSize: open ? '18px' : '22px', 
            fontFamily: 'Georgia, serif',
            color: accent,
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            {open ? 'Lens & Light' : 'L'}
          </span>
        </div>

        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            if ('children' in item) {
              const group = item as NavItem & { children: NavChild[] };
              const isActive = location.pathname?.startsWith(group.to);
              return (
                <div key={group.label}>
                  <button
                    onClick={toggleWorksMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      color: isActive ? accent : 'var(--admin-text-muted)',
                      background: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                      borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      width: '100%',
                      border: 'none',
                      cursor: 'pointer',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {open && <span style={{ flex: 1 }}>{group.label}</span>}
                    {open && <ChevronRight size={14} style={{ transition: 'transform 0.2s', transform: worksMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }} />}
                  </button>
                  {worksMenuOpen && open && (
                    <div style={{ paddingLeft: '12px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {group.children.map((child: NavChild) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            style={({ isActive }) => ({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '13px',
                              color: isActive ? accent : 'var(--admin-text-dim)',
                              background: isActive ? 'rgba(201,169,110,0.06)' : 'transparent',
                              borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden'
                            })}
                          >
                            <ChildIcon size={14} style={{ flexShrink: 0 }} />
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            const single = item as NavItem;
            return (
              <NavLink
                key={single.to}
                to={single.to}
                end={single.to === '/admin/dashboard'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  color: isActive ? accent : 'var(--admin-text-muted)',
                  background: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                  borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                })}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {open && <span>{single.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid var(--admin-border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', color: 'var(--admin-text-dim)', textDecoration: 'none',
            fontSize: '13px', borderRadius: '6px',
            transition: 'color 0.2s'
          }}>
            <ExternalLink size={15} />
            {open && <span>查看前台</span>}
          </Link>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', color: '#ef4444', background: 'transparent',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontSize: '13px', width: '100%', justifyContent: 'flex-start'
          }}>
            <LogOut size={15} />
            {open && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: open ? '256px' : '72px', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease' }}>
        <header style={{
          height: '56px',
          background: 'var(--admin-table)',
          borderBottom: '1px solid var(--admin-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <button onClick={() => setOpen(!open)} style={{
            background: 'transparent', border: 'none', color: 'var(--admin-text-muted)',
            cursor: 'pointer', padding: '6px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Menu size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--admin-text-dim)' }}>管理员</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(201,169,110,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(201,169,110,0.2)'
            }}>
              <User size={14} style={{ color: accent }} />
            </div>
          </div>
        </header>

        <main
          data-admin-main="true"
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            backgroundImage: 'var(--admin-bg-image)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--admin-bg)',
            opacity: 'var(--admin-bg-opacity, 0.85)',
            zIndex: 0,
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {themeLoaded && (
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
