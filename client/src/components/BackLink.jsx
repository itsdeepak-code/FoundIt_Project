import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
      <ArrowLeft className="size-4" />
      {children}
    </Link>
  );
}
