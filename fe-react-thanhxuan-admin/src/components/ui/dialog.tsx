import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  fullScreenOnMobile = false,
}: DialogProps) {
  // Mobile Hardware / Gesture Back Button Handling
  React.useEffect(() => {
    if (!open) return;

    const modalId = `admin_dialog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    window.history.pushState({ modalOpen: true, modalId }, '');

    let isDismissedByPopstate = false;

    const handlePopState = () => {
      isDismissedByPopstate = true;
      onOpenChange(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isDismissedByPopstate && window.history.state?.modalId === modalId) {
        window.history.back();
      }
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto',
        fullScreenOnMobile ? 'p-0 sm:p-6' : 'p-4 sm:p-6',
      )}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg bg-card shadow-2xl animate-in fade-in zoom-in-95 text-foreground transition-colors overflow-hidden flex flex-col',
          fullScreenOnMobile
            ? 'h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] rounded-none sm:rounded-2xl border-0 sm:border'
            : 'max-h-[90vh] rounded-2xl border',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full flex-1 overflow-y-auto px-6 py-2', className)} {...props}>{children}</div>;
}

export function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-left px-6 pt-6 pb-2 pr-12 shrink-0', className)} {...props}>{children}</div>;
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-snug tracking-tight', className)} {...props}>{children}</h2>;
}

export function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>{children}</p>;
}

export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted hover:bg-accent transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Đóng cửa sổ"
    >
      <X className="w-4 h-4 shrink-0" />
    </button>
  );
}

export function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/40 shrink-0 mt-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
