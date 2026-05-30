import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Grid3X3, Layout, RefreshCw, Eye } from 'lucide-react';
import { layoutModes, getLayoutConfig, saveLayoutConfig, defaultLayoutConfig, type LayoutMode } from '@/config/layout';
import { AdminCard, AdminToast } from '@/admin/components';

function PreviewButton() {
  const navigate = useNavigate();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => {
      navigate('/portfolio');
    }, 200);
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg text-[13px] cursor-pointer relative overflow-hidden transition-all duration-[250ms] ${
        hovered
          ? 'border-admin-accent bg-admin-accent/10 text-admin-accent shadow-[0_0_20px_rgba(201,169,110,0.15)] scale-[1.03]'
          : 'border-admin-border-light bg-transparent text-admin-text/70 scale-100'
      } ${pressed ? 'scale-95' : ''}`}
    >
      {hovered && (
        <span className="absolute top-0 -left-full w-full h-full bg-[linear-gradient(90deg,transparent,rgba(201,169,110,0.1),transparent)] animate-[shimmer_1.5s_infinite]" />
      )}
      <Eye size={16} style={{ transition: 'transform 0.25s', transform: hovered ? 'scale(1.2) rotate(-5deg)' : 'scale(1)' }} />
      <span style={{ transition: 'transform 0.25s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
        预览前端
      </span>
    </button>
  );
}

export default function LayoutSettings() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LayoutMode>('auto-scroll');
  const [columns, setColumns] = useState(4);
  const [gap, setGap] = useState(16);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = getLayoutConfig();
    setMode(config.mode);
    setColumns(config.columns);
    setGap(config.gap);
  }, []);

  const handleSave = () => {
    saveLayoutConfig({ mode, columns, gap });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    saveLayoutConfig(defaultLayoutConfig);
    setMode('auto-scroll');
    setColumns(4);
    setGap(16);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = () => {
    window.location.assign('/portfolio');
  };

  return (
    <div className="max-w-[720px] mx-auto">
      {saved && <AdminToast toast={{ message: '设置已保存', type: 'success' }} onClose={() => setSaved(false)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] text-admin-text font-serif mb-1">
            布局设置
          </h1>
          <p className="text-sm text-admin-text-dim/40 italic">
            管理前端作品集的展示排列方式
          </p>
        </div>
        <PreviewButton />
      </div>

      <AdminCard className="p-7">
        <h2 className="text-base text-admin-text font-serif mb-1.5">排列方式</h2>
        <p className="text-[13px] text-admin-text-dim mb-6">选择前端作品集页面的作品展示布局</p>

        <div className="flex flex-col gap-3">
          {layoutModes.map((opt) => {
            const isSelected = mode === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`px-5 py-[18px] rounded-[10px] border-2 cursor-pointer flex items-start gap-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-admin-accent bg-admin-accent/[0.06]'
                    : 'border-admin-border bg-white/[0.02]'
                }`}
              >
                <span className="text-[28px] shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`text-[15px] font-semibold ${isSelected ? 'text-admin-accent' : 'text-admin-text'}`}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-admin-accent/15 text-admin-accent tracking-wider uppercase">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-admin-text-muted leading-relaxed">{opt.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <AdminCard className="p-7 mt-6">
        <h2 className="text-base text-admin-text font-serif mb-1.5">布局参数</h2>
        <p className="text-[13px] text-admin-text-dim mb-6">调整排列的列数和间距</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-admin-text/60 tracking-wider font-medium mb-2">列数</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setColumns(n)}
                  className={`flex-1 p-3 rounded-lg text-base font-semibold cursor-pointer transition-colors ${
                    columns === n
                      ? 'border-2 border-admin-accent bg-admin-accent/10 text-admin-accent'
                      : 'border border-admin-border-light bg-transparent text-admin-text-muted'
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-admin-text/60 tracking-wider font-medium mb-2">间距（px）</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min={4}
                max={32}
                value={gap}
                onChange={e => setGap(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-admin-text-muted min-w-[40px] text-center">{gap}</span>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="flex gap-3 pt-6 items-center">
        <button onClick={handleSave} className="px-7 py-3 bg-admin-accent text-admin-bg rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-2 hover:bg-admin-accent-hover transition-colors">
          <Save size={16} /> 保存设置
        </button>
        <button onClick={handleReset} className="px-5 py-2.5 bg-transparent border border-admin-border-light text-admin-text/70 rounded-lg text-[13px] cursor-pointer flex items-center gap-2 hover:border-admin-text-dim transition-colors">
          <RefreshCw size={14} /> 恢复默认
        </button>
      </div>
    </div>
  );
}
