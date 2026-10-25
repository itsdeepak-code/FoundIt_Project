import { AlertTriangle, Loader2, SearchX } from 'lucide-react';
import Button from './Button.jsx';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 className="size-6 animate-spin text-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, message, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-3">
        <Icon className="size-6 text-slate-500" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shows a friendly error; status 404/403 get their own wording. */
export function ErrorState({ error, onRetry }) {
  const titles = { 401: 'Please log in', 403: 'Access denied', 404: 'Not found' };
  const title = titles[error?.status] || 'Something went wrong';
  const canRetry = onRetry && ![401, 403, 404].includes(error?.status);
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-3">
        <AlertTriangle className="size-6 text-red-600" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{error?.message}</p>
      <div className="mt-5 flex gap-2">
        {canRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant={canRetry ? 'ghost' : 'secondary'} to="/items">
          Browse items
        </Button>
      </div>
    </div>
  );
}
