import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminModal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full rounded-xl border border-admin-border bg-admin-card shadow-2xl max-h-[90vh] overflow-y-auto',
          width,
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-admin-border">
          <h3 className="text-lg text-admin-text font-serif">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-admin-text-dim hover:text-admin-text hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
