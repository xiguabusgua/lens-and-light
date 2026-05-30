import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Loader2, User, BarChart3, Clock, Briefcase, Plus, Trash2,
  ExternalLink
} from 'lucide-react';
import { AdminCard, AdminInput, AdminTextarea, AdminToast } from '@/admin/components';

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

type TabType = 'basic' | 'stats' | 'timeline' | 'services';

export default function AboutManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/about');
      setData(res.data.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await axios.put('/api/about', data);
      setToast({ message: '保存成功', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setToast({ message: error.response?.data?.error || error.message || '保存失败', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const updateStat = (field: string, value: number) => {
    if (!data) return;
    setData({ ...data, stats: { ...data.stats, [field]: value } });
  };

  const addTimelineItem = () => {
    if (!data) return;
    setData({
      ...data,
      timeline: [...data.timeline, { year: new Date().getFullYear().toString(), title: '', description: '' }]
    });
  };

  const updateTimelineItem = (index: number, field: string, value: string) => {
    if (!data) return;
    const newTimeline = [...data.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setData({ ...data, timeline: newTimeline });
  };

  const removeTimelineItem = (index: number) => {
    if (!data) return;
    setData({ ...data, timeline: data.timeline.filter((_, i) => i !== index) });
  };

  const addService = () => {
    if (!data) return;
    setData({
      ...data,
      services: [...data.services, { icon: 'Star', title: '', description: '', priceRange: '' }]
    });
  };

  const updateService = (index: number, field: string, value: string) => {
    if (!data) return;
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setData({ ...data, services: newServices });
  };

  const removeService = (index: number) => {
    if (!data) return;
    setData({ ...data, services: data.services.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="text-center py-20 px-5 text-admin-text-dim">
        <Loader2 size={32} className="text-admin-accent animate-spin mx-auto" />
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { id: 'basic' as TabType, label: '基本信息', icon: User },
    { id: 'stats' as TabType, label: '统计数据', icon: BarChart3 },
    { id: 'timeline' as TabType, label: '时间线', icon: Clock },
    { id: 'services' as TabType, label: '服务项目', icon: Briefcase },
  ];

  return (
    <div>
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] text-admin-text font-serif mb-1">关于页面管理</h1>
          <p className="text-sm text-admin-text-dim">管理前端"关于我"页面的所有内容</p>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={handleSave} disabled={saving} className={`px-5 py-2.5 bg-admin-accent text-admin-bg rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            保存更改
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-[18px] py-2.5 bg-transparent border border-admin-border-light text-admin-text/70 rounded-lg text-[13px] cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> 预览前台
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-admin-border pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-admin-accent/15 border border-admin-accent/30 text-admin-accent'
                  : 'bg-transparent border border-transparent text-admin-text-muted'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'basic' && (
          <motion.div key="basic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-admin-card rounded-xl border border-admin-border px-7 py-6">
            <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">基本信息</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="mb-[18px]">
                <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">姓名 <span className="text-red-400">*</span></label>
                <input value={data.name} onChange={e => updateField('name', e.target.value)} placeholder="如：陈明远" className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors focus:border-admin-accent" />
              </div>

              <div className="mb-[18px]">
                <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">职位/头衔 <span className="text-red-400">*</span></label>
                <input value={data.title} onChange={e => updateField('title', e.target.value)} placeholder="如：视觉叙事者" className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors focus:border-admin-accent" />
              </div>
            </div>

            <div className="mb-[18px]">
              <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">头像图片 URL</label>
              <input value={data.avatarUrl} onChange={e => updateField('avatarUrl', e.target.value)} placeholder="https://picsum.photos/..." className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors focus:border-admin-accent font-mono" />
              {data.avatarUrl && (
                <div className="mt-3 rounded-lg overflow-hidden h-[200px] w-[150px] bg-admin-table">
                  <img src={data.avatarUrl} alt="头像预览" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="mb-[18px]">
              <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">个人简介</label>
              <textarea value={data.bio} onChange={e => updateField('bio', e.target.value)} rows={6} placeholder="详细介绍您的背景和经历..." className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors resize-y font-[inherit] focus:border-admin-accent" />
            </div>

            <div className="mb-[18px]">
              <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-2">座右铭 / 摘录</label>
              <textarea value={data.philosophy} onChange={e => updateField('philosophy', e.target.value)} rows={3} placeholder="一句能代表您摄影理念的话..." className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors resize-y font-[inherit] focus:border-admin-accent" />
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-admin-card rounded-xl border border-admin-border px-7 py-6">
            <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold border-b border-white/8 pb-4 mb-5">统计数据</h2>
            <p className="text-[13px] text-admin-text-dim mb-6">这些数字会显示在关于页面的统计卡片中（带动画计数效果）</p>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
              {[
                { field: 'years' as const, label: '年经验', suffix: '年' },
                { field: 'projects' as const, label: '项目数', suffix: '个' },
                { field: 'clients' as const, label: '客户数', suffix: '位' },
                { field: 'awards' as const, label: '获奖数', suffix: '项' },
              ].map(stat => (
                <div key={stat.field} className="bg-admin-table p-5 rounded-[10px] border border-admin-border-light">
                  <label className="block text-xs text-admin-text/60 uppercase tracking-wider font-medium mb-3">{stat.label}</label>
                  <input
                    type="number"
                    value={data.stats[stat.field]}
                    onChange={e => updateStat(stat.field, parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light outline-none transition-colors focus:border-admin-accent text-[28px] font-serif text-admin-accent font-semibold"
                  />
                  <span className="text-sm text-admin-text-dim ml-2">{stat.suffix}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-admin-card rounded-xl border border-admin-border px-7 py-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold mb-0 border-b-0 pb-0">创作历程</h2>
              <button onClick={addTimelineItem} className="px-5 py-2.5 bg-admin-accent text-admin-bg rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5">
                <Plus size={14} /> 添加里程碑
              </button>
            </div>

            <div className="grid gap-4">
              {data.timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-[100px_1fr_1fr_auto] gap-4 items-start px-5 py-4 bg-admin-card rounded-[10px] border border-admin-border-light"
                >
                  <div>
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">年份</label>
                    <input
                      value={item.year}
                      onChange={e => updateTimelineItem(index, 'year', e.target.value)}
                      placeholder="2024"
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none transition-colors focus:border-admin-accent font-mono text-base font-semibold text-admin-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">标题</label>
                    <input
                      value={item.title}
                      onChange={e => updateTimelineItem(index, 'title', e.target.value)}
                      placeholder="里程碑标题"
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors focus:border-admin-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">描述</label>
                    <input
                      value={item.description}
                      onChange={e => updateTimelineItem(index, 'description', e.target.value)}
                      placeholder="详细描述"
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-sm outline-none transition-colors focus:border-admin-accent"
                    />
                  </div>
                  <button onClick={() => removeTimelineItem(index)} className="p-1.5 bg-transparent border-0 text-red-400 cursor-pointer rounded-md flex items-center justify-center mt-6">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            {data.timeline.length === 0 && (
              <div className="text-center py-10 text-admin-text-dim">
                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                <p>暂无时间线内容，点击上方按钮添加</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-admin-card rounded-xl border border-admin-border px-7 py-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[13px] text-admin-accent uppercase tracking-[2px] font-semibold mb-0 border-b-0 pb-0">服务项目</h2>
              <button onClick={addService} className="px-5 py-2.5 bg-admin-accent text-admin-bg rounded-lg text-[13px] font-semibold tracking-wider cursor-pointer flex items-center gap-1.5">
                <Plus size={14} /> 添加服务
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
              {data.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-admin-card rounded-[10px] border border-admin-border-light"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">图标名称</label>
                      <input
                        value={service.icon}
                        onChange={e => updateService(index, 'icon', e.target.value)}
                        placeholder="UserCircle"
                        className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none transition-colors focus:border-admin-accent font-mono text-xs"
                      />
                    </div>
                    <button onClick={() => removeService(index)} className="p-1.5 bg-transparent border-0 text-red-400 cursor-pointer rounded-md flex items-center justify-center mt-5 ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">服务名称</label>
                    <input
                      value={service.title}
                      onChange={e => updateService(index, 'title', e.target.value)}
                      placeholder="个人写真"
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none transition-colors focus:border-admin-accent text-base font-semibold"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">描述</label>
                    <textarea
                      value={service.description}
                      onChange={e => updateService(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="服务详细描述..."
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none transition-colors resize-y font-[inherit] focus:border-admin-accent text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-admin-text/60 uppercase tracking-wider font-medium mb-2">价格区间</label>
                    <input
                      value={service.priceRange}
                      onChange={e => updateService(index, 'priceRange', e.target.value)}
                      placeholder="¥3,000 - ¥8,000"
                      className="w-full py-3 bg-transparent border-0 border-b border-admin-border-light text-admin-text outline-none transition-colors focus:border-admin-accent font-mono text-admin-accent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {data.services.length === 0 && (
              <div className="text-center py-10 text-admin-text-dim">
                <Briefcase size={40} className="mx-auto mb-3 opacity-50" />
                <p>暂无服务项目，点击上方按钮添加</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
