import { cn } from '@/lib/utils';

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-table">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function AdminTHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead>
      <tr className="border-b border-admin-border">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-5 py-3.5 text-left text-[11px] text-admin-text-dim uppercase tracking-wider font-semibold',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-5 py-3.5', className)}>{children}</td>;
}

export function AdminTr({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  return (
    <tr
      className={cn(
        index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]',
        'border-b border-admin-border-light last:border-0',
      )}
    >
      {children}
    </tr>
  );
}
