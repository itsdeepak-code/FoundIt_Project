import { ArrowRight, ClipboardList, Handshake, PackageSearch, Search } from 'lucide-react';
import { itemsApi } from '../api/itemsApi.js';
import { ItemGrid } from '../components/ItemCard.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';

const STEPS = [
  { icon: ClipboardList, title: 'Report it', text: 'Post what you lost or found, where and when.' },
  { icon: PackageSearch, title: 'Find a match', text: 'Search and filter listings from across campus.' },
  { icon: Handshake, title: 'Claim & return', text: 'Prove it’s yours, get accepted, pick it up.' },
];

export default function LandingPage() {
  useDocumentTitle();
  const { data, loading, error, reload } = useFetch(() => itemsApi.list({ limit: 6, status: 'active' }), []);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Search className="size-3.5" /> Campus lost &amp; found
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Lost something?
              <br />
              <span className="text-indigo-600">Let&apos;s bring it home.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              FoundIt gives your college one organised place to report lost and found belongings, find matches,
              and safely return items to their rightful owners.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button to="/items" size="lg" icon={Search}>
                Browse items
              </Button>
              <Button to="/items/new?type=lost" size="lg" variant="secondary">
                Report a lost item
              </Button>
              <Button to="/items/new?type=found" size="lg" variant="secondary">
                Report a found item
              </Button>
            </div>
          </div>

          <ol className="grid gap-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="card flex items-start gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    <span className="mr-1.5 text-slate-400">{index + 1}.</span>
                    {title}
                  </p>
                  <p className="text-sm text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Recently reported</h2>
            <p className="text-sm text-slate-500">The latest lost and found listings on campus.</p>
          </div>
          <Button to="/items" variant="ghost" size="sm">
            View all <ArrowRight className="size-4" />
          </Button>
        </div>

        {loading && <LoadingState label="Loading recent listings…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && data.items.length === 0 && (
          <EmptyState
            title="No listings yet"
            message="Be the first to report a lost or found item."
            action={<Button to="/items/new">Report an item</Button>}
          />
        )}
        {data && data.items.length > 0 && <ItemGrid items={data.items} />}
      </section>
    </>
  );
}
