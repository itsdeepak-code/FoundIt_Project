import { CheckCircle2, Circle, CircleX } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { claimsApi } from '../api/claimsApi.js';
import BackLink from '../components/BackLink.jsx';
import ClaimActions from '../components/ClaimActions.jsx';
import ClaimDetails, { ContactCard } from '../components/ClaimDetails.jsx';
import ItemImage from '../components/ItemImage.jsx';
import { ClaimStatusBadge, ItemStatusBadge } from '../components/ui/Badges.jsx';
import { ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDateTime } from '../utils/format.js';

// What the status means, worded for each side of the claim.
const STATUS_TEXT = {
  claimant: {
    pending: 'The finder is reviewing your claim. Check back here for updates.',
    accepted: 'Your claim was accepted! Contact the finder to arrange collecting your item.',
    rejected: 'Your claim was not accepted.',
    completed: 'Your item has been returned. Glad we could help bring it home!',
  },
  reporter: {
    pending: 'Review the details below and accept the claim if they match the item.',
    accepted: 'You accepted this claim. Mark it as returned once the owner has the item.',
    rejected: 'You (or the system) rejected this claim.',
    completed: 'The item was returned and the listing is resolved.',
  },
};

/** Submitted -> Reviewed -> Returned progress indicator. */
function Timeline({ claim }) {
  const rejected = claim.status === 'rejected';
  const steps = [
    { label: 'Submitted', date: claim.createdAt, done: true },
    {
      label: rejected ? 'Rejected' : 'Accepted',
      date: claim.reviewedAt,
      done: claim.status !== 'pending',
      failed: rejected,
    },
    { label: 'Returned', date: claim.completedAt, done: claim.status === 'completed' },
  ];
  const visible = rejected ? steps.slice(0, 2) : steps;

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {visible.map((step, index) => {
        const Icon = step.failed ? CircleX : step.done ? CheckCircle2 : Circle;
        const color = step.failed ? 'text-slate-500' : step.done ? 'text-emerald-600' : 'text-slate-300';
        return (
          <li key={step.label} className="flex flex-1 items-start gap-2">
            <Icon className={`size-5 shrink-0 ${color}`} />
            <div>
              <p className={`text-sm font-medium ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
              {step.done && step.date && <p className="text-xs text-slate-500">{formatDateTime(step.date)}</p>}
            </div>
            {index < visible.length - 1 && <div className="mx-3 mt-2.5 hidden h-px flex-1 bg-slate-200 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function ClaimDetailsPage() {
  const { id } = useParams();
  useDocumentTitle('Claim details');
  const { data: claim, setData, loading, error, reload } = useFetch(() => claimsApi.get(id), [id]);

  if (loading && !claim) return <LoadingState label="Loading claim…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const isReporter = claim.viewerRole === 'reporter';
  const otherParty = isReporter ? claim.claimant : claim.reporter;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to={isReporter ? `/items/${claim.item.id}/claims` : '/dashboard'}>
        {isReporter ? 'Back to incoming claims' : 'Back to dashboard'}
      </BackLink>

      <Link to={`/items/${claim.item.id}`} className="card mb-6 flex items-center gap-4 p-4 hover:border-slate-300">
        <ItemImage item={claim.item} className="size-16 shrink-0 rounded-lg" iconSize="size-7" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {isReporter ? 'A claim on your found item' : 'Your claim for'}
          </p>
          <p className="truncate text-lg font-bold text-slate-900">{claim.item.title}</p>
          <div className="mt-1">
            <ItemStatusBadge status={claim.item.status} />
          </div>
        </div>
      </Link>

      <div className="card space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isReporter ? `Claim from ${claim.claimant.name}` : 'Claim status'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{STATUS_TEXT[claim.viewerRole][claim.status]}</p>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        <Timeline claim={claim} />

        <ContactCard person={otherParty} role={isReporter ? 'owner' : 'finder'} />

        <div className="border-t border-slate-100 pt-6">
          <ClaimDetails claim={claim} />
        </div>

        {isReporter && (
          <div className="border-t border-slate-100 pt-6 empty:hidden">
            <ClaimActions
              claim={claim}
              itemStatus={claim.item.status}
              onUpdated={(updated) => (updated ? setData(updated) : reload())}
            />
          </div>
        )}
      </div>
    </div>
  );
}
