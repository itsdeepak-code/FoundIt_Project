import { ExternalLink, Inbox } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { claimsApi } from '../api/claimsApi.js';
import { itemsApi } from '../api/itemsApi.js';
import BackLink from '../components/BackLink.jsx';
import ClaimActions from '../components/ClaimActions.jsx';
import ClaimDetails, { ContactCard } from '../components/ClaimDetails.jsx';
import ItemImage from '../components/ItemImage.jsx';
import { ClaimStatusBadge, ItemStatusBadge } from '../components/ui/Badges.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDateTime } from '../utils/format.js';

const SUMMARY = {
  open: 'Compare each claim with the item. Accept the one that clearly matches.',
  claim_pending: 'You accepted a claim. Once you have handed the item over, mark it as returned.',
  resolved: 'This item has been returned. Nice work!',
  closed: 'This listing is closed.',
};

export default function IncomingClaimsPage() {
  const { id } = useParams();
  useDocumentTitle('Incoming claims');
  // Claims are requested first so a non-reporter gets the "access denied" error straight away.
  const { data, loading, error, reload } = useFetch(async () => {
    const claims = await claimsApi.forItem(id);
    const { item } = await itemsApi.get(id);
    return { claims, item };
  }, [id]);

  if (loading && !data) return <LoadingState label="Loading claims…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const { item, claims } = data;
  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to={`/items/${item.id}`}>Back to listing</BackLink>

      <div className="card mb-6 flex items-center gap-4 p-4">
        <ItemImage item={item} className="size-16 shrink-0 rounded-lg" iconSize="size-7" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Incoming claims for</p>
          <h1 className="truncate text-lg font-bold text-slate-900">{item.title}</h1>
          <div className="mt-1">
            <ItemStatusBadge status={item.status} />
          </div>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-600">{SUMMARY[item.status]}</p>

      {claims.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No claims yet"
          message="When someone believes this item is theirs, their claim will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {claims.map((claim) => (
            <li key={claim.id} className={`card p-5 ${claim.status === 'rejected' ? 'opacity-75' : ''}`}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{claim.claimant.name}</p>
                  <p className="text-xs text-slate-500">Submitted {formatDateTime(claim.createdAt)}</p>
                </div>
                <ClaimStatusBadge status={claim.status} />
              </div>

              <ClaimDetails claim={claim} />

              {(claim.status === 'accepted' || claim.status === 'completed') && (
                <div className="mt-4">
                  <ContactCard person={claim.claimant} role="owner" />
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <ClaimActions
                  claim={claim}
                  itemStatus={item.status}
                  otherPendingCount={pendingCount - 1}
                  onUpdated={reload}
                />
                <Link
                  to={`/claims/${claim.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 sm:ml-auto"
                >
                  Claim page <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
