import { cn } from '@/lib/utils';

export function AdminCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-admin-raised rounded-xl border border-admin-border p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
