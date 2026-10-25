import { ChevronRight, ClipboardList, HandHeart, Inbox, Mail, Pencil, Plus, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { claimsApi } from '../api/claimsApi.js';
import { itemsApi } from '../api/itemsApi.js';
import ItemImage from '../components/ItemImage.jsx';
import { ClaimStatusBadge, ItemStatusBadge, TypeBadge } from '../components/ui/Badges.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate, timeAgo } from '../utils/format.js';

function Section({ icon: Icon, title, count, children }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Icon className="size-5 text-slate-400" />
        {title}
        {count > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{count}</span>}
      </h2>
      {children}
    </section>
  );
}

function ListingRow({ item }) {
  const { pending, total } = item.claimCounts;
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <Link to={`/items/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <ItemImage item={item} className="size-14 shrink-0 rounded-lg" iconSize="size-6" />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 hover:text-indigo-700">{item.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <TypeBadge type={item.type} />
            <ItemStatusBadge status={item.status} />
            <span>Posted {timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {item.type === 'found' && (
          <Link
            to={`/items/${item.id}/claims`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
              pending > 0 ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="size-4" />
            {pending > 0 ? `${pending} pending` : `${total} ${total === 1 ? 'claim' : 'claims'}`}
          </Link>
        )}
        {item.status === 'open' && (
          <Button to={`/items/${item.id}/edit`} variant="ghost" size="sm" icon={Pencil}>
            Edit
          </Button>
        )}
        <Button to={`/items/${item.id}`} variant="secondary" size="sm">
          View
        </Button>
      </div>
    </li>
  );
}

function ClaimRow({ claim }) {
  return (
    <li>
      <Link to={`/claims/${claim.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
        <ItemImage item={claim.item} className="size-14 shrink-0 rounded-lg" iconSize="size-6" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">{claim.item.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <ClaimStatusBadge status={claim.status} />
            <span>Submitted {formatDate(claim.createdAt)}</span>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const listings = useFetch(() => itemsApi.mine(), []);
  const claims = useFetch(() => claimsApi.mine(), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Profile */}
      <div className="card mb-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserCircle2 className="size-12 text-indigo-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{user.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail className="size-3.5" /> {user.email}
              <span className="text-slate-300">·</span>
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <Button to="/items/new" icon={Plus}>
          Report an item
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Section icon={ClipboardList} title="My listings" count={listings.data?.length}>
          {listings.loading && <LoadingState />}
          {listings.error && <ErrorState error={listings.error} onRetry={listings.reload} />}
          {listings.data?.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No listings yet"
              message="Lost or found something? Report it so others can help."
              action={<Button to="/items/new">Report an item</Button>}
            />
          )}
          {listings.data?.length > 0 && (
            <ul className="card divide-y divide-slate-100">
              {listings.data.map((item) => (
                <ListingRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </Section>

        <Section icon={HandHeart} title="My claims" count={claims.data?.length}>
          {claims.loading && <LoadingState />}
          {claims.error && <ErrorState error={claims.error} onRetry={claims.reload} />}
          {claims.data?.length === 0 && (
            <EmptyState
              icon={HandHeart}
              title="No claims yet"
              message="When you claim a found item, you can track it here."
              action={
                <Button to="/items?type=found" variant="secondary">
                  Browse found items
                </Button>
              }
            />
          )}
          {claims.data?.length > 0 && (
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {claims.data.map((claim) => (
                <ClaimRow key={claim.id} claim={claim} />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
