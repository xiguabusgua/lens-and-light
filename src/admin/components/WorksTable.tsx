import { Pencil, Eye, Trash2, Star } from 'lucide-react';
import type { AdminWork } from '../types';
import { getCategoryName } from '@/data/categories';

interface WorksTableProps {
  works: AdminWork[];
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function WorksTable({ works, onEdit, onView, onDelete }: WorksTableProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-ui text-secondary/50">暂无作品数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-light/50">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-dark/80 border-b border-surface-light/50">
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              ID
            </th>
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              缩略图
            </th>
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              标题
            </th>
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              分类
            </th>
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              状态
            </th>
            <th className="px-6 py-4 text-left font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium hidden sm:table-cell">
              浏览量
            </th>
            <th className="px-6 py-4 text-right font-ui text-xs text-secondary/50 uppercase tracking-wider font-medium">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {works.map((work, index) => (
            <tr
              key={work.id}
              className={`border-b border-surface-light/20 transition-colors duration-150 hover:bg-surface/30 ${
                index % 2 === 0 ? '' : 'bg-surface/15'
              }`}
            >
              <td className="px-6 py-4">
                <span className="font-mono text-sm text-secondary/50">#{work.id}</span>
              </td>
              <td className="px-6 py-4">
                <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-surface-dark border border-surface-light/30">
                  <img
                    src={work.thumbnailUrl}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-body text-base text-secondary font-medium line-clamp-1">
                  {work.title}
                </span>
                {work.featured && (
                  <Star size={12} className="inline-block ml-1.5 text-accent align-middle fill-accent" />
                )}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-ui font-medium bg-accent/10 text-accent/80 border border-accent/20">
                  {getCategoryName(work.category)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-md text-xs font-ui font-medium border ${
                    work.status === 'featured'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : work.status === 'draft'
                      ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}
                >
                  {work.status === 'featured' ? '精选' : work.status === 'draft' ? '草稿' : '已发布'}
                </span>
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                <span className="font-mono text-sm text-secondary/60">{work.views.toLocaleString()}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(work.id)}
                    className="p-2 rounded-lg hover:bg-surface text-secondary/50 hover:text-accent transition-all"
                    aria-label={`编辑 ${work.title}`}
                    title="编辑"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onView(work.id)}
                    className="p-2 rounded-lg hover:bg-surface text-secondary/50 hover:text-blue-400 transition-all"
                    aria-label={`查看 ${work.title}`}
                    title="查看"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(work.id)}
                    className="p-2 rounded-lg hover:bg-red-400/10 text-secondary/50 hover:text-red-400 transition-all"
                    aria-label={`删除 ${work.title}`}
                    title="删除"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
