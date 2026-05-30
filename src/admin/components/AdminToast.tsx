import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminToast({
  toast,
  onClose,
}: {
  toast: { type: 'success' | 'error'; message: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-left">
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-sm min-w-[300px]',
          toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400',
        )}
      >
        {toast.type === 'success' ? (
          <CheckCircle size={18} />
        ) : (
          <XCircle size={18} />
        )}
        <span className="flex-1 text-sm">{toast.message}</span>
        <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
