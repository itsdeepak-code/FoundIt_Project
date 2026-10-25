import { ChevronLeft, ChevronRight, MapPin, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { itemsApi } from '../api/itemsApi.js';
import { ItemGrid } from '../components/ItemCard.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { CATEGORIES, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from '../utils/constants.js';

const DEFAULTS = { search: '', type: '', category: '', location: '', status: 'active', sort: 'newest', page: '1' };
const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
];

export default function BrowsePage() {
  useDocumentTitle('Browse items');
  // Filters live in the URL so results can be shared and survive a refresh.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, searchParams.get(key) ?? DEFAULTS[key]]));

  // Text inputs update the URL after a short pause, not on every keystroke.
  const [searchText, setSearchText] = useState(filters.search);
  const [locationText, setLocationText] = useState(filters.location);

  const updateFilters = (changes) => {
    const next = { ...filters, page: '1', ...changes };
    const params = {};
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== DEFAULTS[key]) params[key] = value;
    }
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== filters.search || locationText !== filters.location) {
        updateFilters({ search: searchText.trim(), location: locationText.trim() });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText, locationText]);

  const queryKey = searchParams.toString();
  const { data, loading, error, reload } = useFetch(() => itemsApi.list({ ...filters, limit: 12 }), [queryKey]);

  const hasFilters = ['search', 'type', 'category', 'location'].some((key) => filters[key]) || filters.status !== 'active';
  const clearFilters = () => {
    setSearchText('');
    setLocationText('');
    setSearchParams({}, { replace: true });
  };

  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Browse items</h1>
          <p className="mt-1 text-slate-500">Search everything reported lost or found on campus.</p>
        </div>
        <Button to="/items/new" icon={Plus}>
          Report item
        </Button>
      </div>

      {/* Filters */}
      <div className="card mb-6 space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Search items</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search by title or description, e.g. “water bottle”"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filter by location</span>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="input pl-9"
              placeholder="Location, e.g. Library"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Listing type">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => updateFilters({ type: tab.value })}
                aria-pressed={filters.type === tab.value}
                className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition sm:flex-none ${
                  filters.type === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <select
              aria-label="Category"
              className="input"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              aria-label="Status"
              className="input"
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort"
              className="input"
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {/* While a new search loads, keep showing the previous results (dimmed) to avoid flicker. */}
      {loading && !data && <LoadingState label="Searching listings…" />}
      {error && !loading && <ErrorState error={error} onRetry={reload} />}
      {pagination && !error && (
        <p className="mb-4 text-sm text-slate-500" aria-live="polite">
          {loading ? 'Searching…' : `${pagination.total} ${pagination.total === 1 ? 'listing' : 'listings'} found`}
        </p>
      )}
      {data && !error && !loading && data.items.length === 0 && (
        <EmptyState
          title="No matching listings"
          message={
            hasFilters
              ? 'Try different keywords or remove some filters.'
              : 'Nothing has been reported yet. Check back soon!'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button to="/items/new">Report an item</Button>
            )
          }
        />
      )}
      {data && !error && data.items.length > 0 && (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ItemGrid items={data.items} />
        </div>
      )}

      {pagination && !error && pagination.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
          <Button
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            disabled={pagination.page <= 1}
            onClick={() => updateFilters({ page: String(pagination.page - 1) })}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateFilters({ page: String(pagination.page + 1) })}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
