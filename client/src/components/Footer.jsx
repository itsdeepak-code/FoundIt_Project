import { Link } from 'react-router';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-slate-500">Lost something? Let&apos;s bring it home.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <Link to="/items" className="hover:text-slate-900">
            Browse items
          </Link>
          <Link to="/items/new?type=lost" className="hover:text-slate-900">
            Report lost
          </Link>
          <Link to="/items/new?type=found" className="hover:text-slate-900">
            Report found
          </Link>
          <span>© {new Date().getFullYear()} FoundIt · College project</span>
        </div>
      </div>
    </footer>
  );
}
