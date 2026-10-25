import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, className: 'text-emerald-600' },
  error: { icon: XCircle, className: 'text-red-600' },
  info: { icon: Info, className: 'text-indigo-600' },
};

let nextId = 1;

/** Small toast system: toast.success('Saved'), toast.error('Oops'), toast.info('FYI'). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map(({ id, type, message }) => {
          const { icon: Icon, className } = STYLES[type];
          return (
            <div
              key={id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${className}`} />
              <p className="flex-1 text-sm text-slate-700">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
