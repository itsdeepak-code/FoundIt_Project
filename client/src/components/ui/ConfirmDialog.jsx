import { useEffect } from 'react';
import Button from './Button.jsx';

/** Simple modal asking the user to confirm an important action. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && !loading && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={loading ? undefined : onCancel} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="card relative w-full max-w-md p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
