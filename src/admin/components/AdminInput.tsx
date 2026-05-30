import { cn } from '@/lib/utils';

export function AdminInput({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div className="mb-5">
      <label className="block text-xs text-admin-text-muted mb-2 font-medium tracking-wide">
        {label}
      </label>
      <input
        className={cn(
          'w-full px-4 py-3.5 bg-transparent border-0 border-b border-admin-border-light text-admin-text text-[15px] outline-none focus:border-admin-accent transition-colors duration-300',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function AdminTextarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}) {
  return (
    <div className="mb-5">
      <label className="block text-xs text-admin-text-muted mb-2 font-medium tracking-wide">
        {label}
      </label>
      <textarea
        className={cn(
          'w-full px-4 py-3.5 bg-transparent border border-admin-border rounded-lg text-admin-text text-sm outline-none focus:border-admin-accent transition-colors resize-none',
          className,
        )}
        {...props}
      />
    </div>
  );
}
