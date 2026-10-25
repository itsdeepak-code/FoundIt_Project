import { Search } from 'lucide-react';
import { Link } from 'react-router';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
      <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Search className="size-4.5" strokeWidth={2.75} />
      </span>
      <span className="text-lg">
        Found<span className="text-indigo-600">It</span>
      </span>
    </Link>
  );
}
