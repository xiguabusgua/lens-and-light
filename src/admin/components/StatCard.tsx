import type { StatCardProps } from '../types';

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-surface-dark rounded-xl p-6 border border-surface-light/50 hover:border-accent/30 transition-all duration-300 group hover:shadow-glow-accent/20 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui text-xs text-secondary/50 uppercase tracking-widest font-medium">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${color} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <p className="font-display text-3xl lg:text-4xl text-secondary font-semibold tracking-tight">
          {value}
        </p>
        {trend && (
          <span
            className={`text-xs font-ui font-medium pb-1 ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
