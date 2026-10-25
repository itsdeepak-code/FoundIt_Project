import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { formatDate } from '../utils/format.js';
import ItemImage from './ItemImage.jsx';
import { ItemStatusBadge, TypeBadge } from './ui/Badges.jsx';

export default function ItemCard({ item }) {
  const accent = item.type === 'lost' ? 'bg-rose-400' : 'bg-teal-500';
  return (
    <Link
      to={`/items/${item.id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className={`h-1 ${accent}`} />
      <div className="relative">
        <ItemImage item={item} className="aspect-[4/3] w-full" />
        <div className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 group-hover:text-indigo-700">{item.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">{item.location}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0 text-slate-400" />
            {item.type === 'lost' ? 'Lost' : 'Found'} {formatDate(item.incidentDate)}
          </p>
        </div>
        <div className="mt-auto pt-4">
          <ItemStatusBadge status={item.status} />
        </div>
      </div>
    </Link>
  );
}

export function ItemGrid({ items }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
