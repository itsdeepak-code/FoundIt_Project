import { AlertCircle } from 'lucide-react';

/** Centered card used by the login and registration pages. */
export default function AuthCard({ title, subtitle, error, footer, children }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>}
    </div>
  );
}
