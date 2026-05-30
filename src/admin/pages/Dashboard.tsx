import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Star, FolderOpen, Eye, TrendingUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getFullImageUrl, getCategoryLabel, type ApiWork } from '@/lib/utils';
import { AdminCard, AdminTable, AdminTHead, AdminTh, AdminTd, AdminTr, StatusBadge } from '@/admin/components';

export default function Dashboard() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<ApiWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, featured: 0, categories: 0 });

  useEffect(() => {
    axios.get('/api/works', { params: { status: 'active', limit: 100 } })
      .then(res => {
        const data = res.data.data || [];
        setWorks(data);
        const cats = new Set(data.map((w: ApiWork) => w.category));
        setStats({
          total: data.length,
          featured: data.filter((w: ApiWork) => w.featured === 1).length,
          categories: cats.size,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  const recentWorks = [...works].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] text-admin-text font-[Georgia,serif] mb-1">仪表盘</h1>
        <p className="text-[15px] text-admin-text-muted italic">欢迎回来，这是您的作品集概览</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 mb-10">
        <AdminCard>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-admin-text-dim tracking-wide uppercase font-medium">总作品数</span>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Images size={20} className="text-white" />
            </div>
          </div>
          <p className="text-[32px] text-admin-text font-[Georgia,serif] font-semibold">{stats.total}</p>
        </AdminCard>

        <AdminCard>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-admin-text-dim tracking-wide uppercase font-medium">精选作品</span>
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Star size={20} className="text-white" />
            </div>
          </div>
          <p className="text-[32px] text-admin-text font-[Georgia,serif] font-semibold">{stats.featured}</p>
        </AdminCard>

        <AdminCard>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-admin-text-dim tracking-wide uppercase font-medium">分类数量</span>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <FolderOpen size={20} className="text-white" />
            </div>
          </div>
          <p className="text-[32px] text-admin-text font-[Georgia,serif] font-semibold">{stats.categories}</p>
        </AdminCard>

        <AdminCard>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-admin-text-dim tracking-wide uppercase font-medium">作品总数</span>
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Eye size={20} className="text-white" />
            </div>
          </div>
          <p className="text-[32px] text-admin-text font-[Georgia,serif] font-semibold">{stats.total}</p>
        </AdminCard>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={18} className="text-admin-accent" />
            <h2 className="text-xl text-admin-text font-[Georgia,serif]">最近作品</h2>
          </div>
          <button
            onClick={() => navigate('/admin/works')}
            aria-label="查看全部作品"
            className="bg-transparent border-none text-admin-accent cursor-pointer text-sm font-medium"
          >
            查看全部 →
          </button>
        </div>

        <AdminTable>
          <AdminTHead>
            <AdminTh>ID</AdminTh>
            <AdminTh>缩略图</AdminTh>
            <AdminTh>标题</AdminTh>
            <AdminTh>分类</AdminTh>
            <AdminTh>状态</AdminTh>
            <AdminTh className="text-right">操作</AdminTh>
          </AdminTHead>
          <tbody>
            {recentWorks.map((work, i) => (
              <AdminTr key={work.id} index={i}>
                <AdminTd>
                  <span className="font-mono text-[13px] text-admin-text-dim">#{work.id}</span>
                </AdminTd>
                <AdminTd>
                  <img
                    src={getFullImageUrl(work.thumbnail_url || work.image_url)}
                    alt=""
                    className="size-[50px] object-cover rounded-md"
                  />
                </AdminTd>
                <AdminTd>
                  <span className="text-sm text-admin-text-muted">{work.title}</span>
                  {work.featured === 1 && (
                    <Star size={12} className="text-admin-accent ml-1.5 inline-block align-middle" />
                  )}
                </AdminTd>
                <AdminTd>
                  <StatusBadge variant="accent">{getCategoryLabel(work.category)}</StatusBadge>
                </AdminTd>
                <AdminTd>
                  <StatusBadge variant={work.featured ? 'warning' : 'success'}>
                    {work.featured ? '精选' : '已发布'}
                  </StatusBadge>
                </AdminTd>
                <AdminTd className="text-right">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/admin/works/${work.id}/edit`)}
                      className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted cursor-pointer"
                      title="编辑"
                      aria-label="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => navigate(`/gallery/${work.id}`)}
                      className="p-1.5 rounded-md bg-transparent border-none text-admin-text-muted cursor-pointer"
                      title="查看"
                      aria-label="查看"
                    >
                      👁
                    </button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </div>
  );
}
