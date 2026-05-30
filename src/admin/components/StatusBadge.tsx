import { cn } from '@/lib/utils';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'neutral';

const variantClasses: Record<BadgeVariant, string> = {
  accent:
    'text-admin-accent bg-admin-accent/10 border border-admin-accent/20',
  success:
    'text-green-400 bg-green-400/10 border border-green-400/20',
  warning:
    'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  error:
    'text-red-400 bg-red-400/10 border border-red-400/20',
  neutral:
    'text-admin-text-dim bg-white/[0.04] border border-white/[0.06]',
};

export function StatusBadge({
  children,
  variant = 'accent',
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 rounded text-[11px] font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
