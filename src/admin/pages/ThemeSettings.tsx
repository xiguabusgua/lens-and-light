import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Palette, Upload, RefreshCw, Check, Loader2, Image } from 'lucide-react';
import { AdminCard, AdminToast } from '@/admin/components';
import { getFullImageUrl } from '@/lib/utils';

interface Theme {
  bg: string;
  card: string;
  raised: string;
  table: string;
  border: string;
  borderLight: string;
  text: string;
  textMuted: string;
  textDim: string;
  textSubtle: string;
  accent: string;
  accentHover: string;
  danger: string;
  success: string;
  backgroundImage: string;
}

const DEFAULT_THEME: Theme = {
  bg: '#0a0a0a',
  card: '#1f1f1f',
  raised: '#2d2d2d',
  table: '#141414',
  border: '#2d2d2d',
  borderLight: '#1f1f1f',
  text: '#fafafa',
  textMuted: '#a8a8a8',
  textDim: '#808080',
  textSubtle: '#555555',
  accent: '#c9a96e',
  accentHover: '#d4ba85',
  danger: '#ef4444',
  success: '#22c55e',
  backgroundImage: '',
};

interface ColorGroup {
  label: string;
  keys: { key: keyof Theme; name: string }[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: '背景 / 卡片',
    keys: [
      { key: 'bg', name: '全页背景' },
      { key: 'card', name: '卡片面板' },
      { key: 'raised', name: '悬浮卡片' },
      { key: 'table', name: '表格底色' },
    ],
  },
  {
    label: '边框',
    keys: [
      { key: 'border', name: '主边框' },
      { key: 'borderLight', name: '浅边框' },
    ],
  },
  {
    label: '文字',
    keys: [
      { key: 'text', name: '主文字' },
      { key: 'textMuted', name: '次要文字' },
      { key: 'textDim', name: '暗文字' },
      { key: 'textSubtle', name: '极暗文字' },
    ],
  },
  {
    label: '强调色 / 按钮',
    keys: [
      { key: 'accent', name: '主题色' },
      { key: 'accentHover', name: '悬停色' },
    ],
  },
  {
    label: '功能色',
    keys: [
      { key: 'danger', name: '危险/删除' },
      { key: 'success', name: '成功/发布' },
    ],
  },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get('/api/admin/theme')
      .then(res => {
        if (res.data.data) {
          setTheme(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--admin-bg', theme.bg);
    root.style.setProperty('--admin-card', theme.card);
    root.style.setProperty('--admin-raised', theme.raised);
    root.style.setProperty('--admin-table', theme.table);
    root.style.setProperty('--admin-border', theme.border);
    root.style.setProperty('--admin-border-light', theme.borderLight);
    root.style.setProperty('--admin-text', theme.text);
    root.style.setProperty('--admin-text-muted', theme.textMuted);
    root.style.setProperty('--admin-text-dim', theme.textDim);
    root.style.setProperty('--admin-text-subtle', theme.textSubtle);
    root.style.setProperty('--admin-accent', theme.accent);
    root.style.setProperty('--admin-accent-hover', theme.accentHover);
    if (theme.backgroundImage) {
      root.style.setProperty('--admin-bg-image', `url(${getFullImageUrl(theme.backgroundImage)})`);
      root.style.setProperty('--admin-bg-opacity', '0.85');
    } else {
      root.style.setProperty('--admin-bg-image', 'none');
      root.style.setProperty('--admin-bg-opacity', '1');
    }
  }, [theme]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put('/api/admin/theme', theme);
      setToast({ type: 'success', message: '主题已保存，所有后台页面立即生效' });
    } catch {
      setToast({ type: 'error', message: '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post('/api/admin/theme/background', fd);
      const url = res.data.data.backgroundImage;
      setTheme(prev => ({ ...prev, backgroundImage: url }));
      setToast({ type: 'success', message: '背景图已上传' });
    } catch {
      setToast({ type: 'error', message: '上传失败' });
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setTheme({ ...DEFAULT_THEME });
  };

  const removeBg = () => {
    setTheme(prev => ({ ...prev, backgroundImage: '' }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-admin-accent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-[28px] text-admin-text font-serif mb-2">主题配色</h1>
        <p className="text-[15px] text-admin-text-muted italic">自定义后台管理的视觉风格，所有更改即时预览</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {COLOR_GROUPS.map(group => (
            <AdminCard key={group.label}>
              <h3 className="text-xs text-admin-text-muted uppercase tracking-wider mb-4">{group.label}</h3>
              <div className="grid grid-cols-2 gap-4">
                {group.keys.map(({ key, name }) => {
                  const colorMap: Record<string, string> = {
                    accent: theme.accent,
                    accentHover: theme.accentHover,
                    danger: theme.danger,
                    success: theme.success,
                    bg: theme.bg,
                    card: theme.card,
                    raised: theme.raised,
                    table: theme.table,
                    border: theme.border,
                    borderLight: theme.borderLight,
                    text: theme.text,
                    textMuted: theme.textMuted,
                    textDim: theme.textDim,
                    textSubtle: theme.textSubtle,
                  };
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <label className="relative cursor-pointer">
                        <input
                          type="color"
                          value={colorMap[key] ?? theme[key as keyof Theme] ?? '#000'}
                          onChange={e => {
                            const newColor = e.target.value;
                            setTheme(prev => {
                              const t = { ...prev };
                              if (key === 'accent') t.accent = newColor;
                              else if (key === 'accentHover') t.accentHover = newColor;
                              else if (key === 'danger') t.danger = newColor;
                              else if (key === 'success') t.success = newColor;
                              else (t as any)[key] = newColor;
                              return t;
                            });
                          }}
                          className="w-0 h-0 absolute opacity-0"
                        />
                        <div
                          className="size-8 rounded-lg border-2 border-admin-border cursor-pointer shadow-inner hover:scale-110 transition-transform"
                          style={{ backgroundColor: (colorMap as any)[key] ?? theme[key as keyof Theme] ?? '#000' }}
                        />
                      </label>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-admin-text truncate">{name}</p>
                        <p className="text-[11px] text-admin-text-dim font-mono">
                          {(colorMap as any)[key] ?? theme[key as keyof Theme] ?? ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          ))}

          <AdminCard>
            <h3 className="text-xs text-admin-text-muted uppercase tracking-wider mb-4">背景图片</h3>
            {theme.backgroundImage ? (
              <div className="space-y-3">
                <div
                  className="w-full h-40 rounded-lg border border-admin-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${getFullImageUrl(theme.backgroundImage)})` }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-admin-accent text-[#0a0a0a] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    更换图片
                  </button>
                  <button
                    onClick={removeBg}
                    className="flex items-center gap-1.5 px-4 py-2 border border-admin-border text-admin-text-muted rounded-lg text-sm hover:border-red-400/30 hover:text-red-400 transition-colors"
                  >
                    移除背景
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-admin-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-admin-accent/50 transition-colors"
              >
                {uploading ? (
                  <Loader2 size={24} className="text-admin-accent animate-spin" />
                ) : (
                  <>
                    <Image size={24} className="text-admin-text-dim" />
                    <p className="text-xs text-admin-text-dim">点击上传背景图片（JPG/PNG/WebP，≤5MB）</p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBgUpload}
              className="hidden"
            />
            <p className="text-[11px] text-admin-text-subtle mt-3">
              背景图将应用于管理后台内容区域（非侧边栏和顶栏）
            </p>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <h3 className="text-xs text-admin-text-muted uppercase tracking-wider mb-4">实时预览</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg" style={{ backgroundColor: theme.bg }} />
                <span className="text-xs text-admin-text-dim">页面背景</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg border" style={{ backgroundColor: theme.raised, borderColor: theme.border }} />
                <span className="text-xs text-admin-text-dim">卡片</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: theme.accent }}
                >
                  主题按钮
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: theme.danger }}
                >
                  危险按钮
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: theme.success }}
                >
                  成功按钮
                </button>
              </div>
              <p className="text-sm" style={{ color: theme.text }}>主文字 preview</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>次要文字 preview</p>
              <p className="text-sm" style={{ color: theme.textDim }}>暗文字 preview</p>
              <span
                className="inline-block px-2.5 py-1 rounded text-[11px] font-medium"
                style={{
                  color: theme.accent,
                  backgroundColor: `${theme.accent}1a`,
                  border: `1px solid ${theme.accent}33`,
                }}
              >
                标签 Badge
              </span>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-xs text-admin-text-muted uppercase tracking-wider mb-4">操作</h3>
            <div className="space-y-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all"
                style={{ backgroundColor: theme.accent, color: 'var(--admin-bg)', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                保存主题设置
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm border transition-colors"
                style={{ borderColor: theme.border, color: theme.textDim }}
              >
                <RefreshCw size={16} />
                恢复默认
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
