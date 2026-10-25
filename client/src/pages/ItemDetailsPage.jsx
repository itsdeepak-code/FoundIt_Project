import { CalendarDays, Clock, HandHeart, LogIn, MapPin, Tag, User } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { itemsApi } from '../api/itemsApi.js';
import BackLink from '../components/BackLink.jsx';
import ClaimForm from '../components/ClaimForm.jsx';
import ItemImage from '../components/ItemImage.jsx';
import OwnerActions from '../components/OwnerActions.jsx';
import { ClaimStatusBadge, ItemStatusBadge, TypeBadge } from '../components/ui/Badges.jsx';
import Button from '../components/ui/Button.jsx';
import { ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate, timeAgo } from '../utils/format.js';

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-900">{children}</dd>
      </div>
    </div>
  );
}

const CLOSED_MESSAGES = {
  claim_pending: 'A claim on this item has been accepted, so it is no longer taking new claims.',
  resolved: 'This item has been returned to its owner.',
  closed: 'The reporter closed this listing.',
};

/** What a visitor who did NOT report this item can do. */
function VisitorActions({ item, viewer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);

  if (viewer.myClaim) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Your claim</h2>
          <ClaimStatusBadge status={viewer.myClaim.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Track the progress of your claim and see the finder&apos;s reply.</p>
        <Button to={`/claims/${viewer.myClaim.id}`} variant="secondary" className="mt-4 w-full">
          View my claim
        </Button>
        {viewer.canClaim && (
          <p className="mt-3 text-xs text-slate-500">Your previous claim was rejected. You can submit a new one below.</p>
        )}
        {viewer.canClaim && !showForm && (
          <Button className="mt-2 w-full" icon={HandHeart} onClick={() => setShowForm(true)}>
            Submit a new claim
          </Button>
        )}
        {showForm && (
          <div className="mt-5 border-t border-slate-100 pt-5">
            <ClaimForm itemId={item.id} onCancel={() => setShowForm(false)} onSubmitted={(c) => navigate(`/claims/${c.id}`)} />
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'lost') {
    const params = new URLSearchParams({ type: 'found', category: item.category });
    return (
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900">Have you seen this item?</h2>
        <p className="mt-1 text-sm text-slate-500">
          If you found it, post a found listing. The owner can then claim it from you.
        </p>
        {item.status === 'open' ? (
          <Button to={`/items/new?${params}`} className="mt-4 w-full" icon={HandHeart}>
            I found this - report it
          </Button>
        ) : (
          <p className="mt-4 text-sm font-medium text-slate-700">{CLOSED_MESSAGES[item.status]}</p>
        )}
      </div>
    );
  }

  // A found item
  if (item.status !== 'open') {
    return (
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900">Not accepting claims</h2>
        <p className="mt-1 text-sm text-slate-500">{CLOSED_MESSAGES[item.status]}</p>
      </div>
    );
  }

  if (!viewer.isLoggedIn) {
    return (
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900">Is this yours?</h2>
        <p className="mt-1 text-sm text-slate-500">Log in to submit a claim to the person who found it.</p>
        <Button to="/login" state={{ from: location.pathname }} className="mt-4 w-full" icon={LogIn}>
          Log in to claim
        </Button>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-slate-900">Is this yours?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Tell the finder why it belongs to you. They will review your claim and arrange the return.
      </p>
      {showForm ? (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <ClaimForm itemId={item.id} onCancel={() => setShowForm(false)} onSubmitted={(c) => navigate(`/claims/${c.id}`)} />
        </div>
      ) : (
        <Button className="mt-4 w-full" icon={HandHeart} onClick={() => setShowForm(true)}>
          This is mine - claim it
        </Button>
      )}
    </div>
  );
}

export default function ItemDetailsPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => itemsApi.get(id), [id]);
  useDocumentTitle(data?.item.title ?? 'Item');

  if (loading && !data) return <LoadingState label="Loading item…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  const { item, viewer } = data;
  const verb = item.type === 'lost' ? 'Lost' : 'Found';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to="/items">Back to all items</BackLink>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="card overflow-hidden">
          <ItemImage item={item} className="aspect-[16/9] max-h-[420px] w-full" iconSize="size-16" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={item.type} />
              <ItemStatusBadge status={item.status} />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{item.title}</h1>
            <p className="mt-4 whitespace-pre-line text-slate-700">{item.description}</p>

            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <DetailRow icon={Tag} label="Category">
                {item.category}
              </DetailRow>
              <DetailRow icon={MapPin} label={`${verb} at`}>
                {item.location}
              </DetailRow>
              <DetailRow icon={CalendarDays} label={`Date ${verb.toLowerCase()}`}>
                {formatDate(item.incidentDate)}
              </DetailRow>
              <DetailRow icon={User} label="Reported by">
                {viewer.isOwner ? 'You' : item.reporter.name}
              </DetailRow>
              <DetailRow icon={Clock} label="Posted">
                {timeAgo(item.createdAt)}
              </DetailRow>
            </dl>
          </div>
        </article>

        <aside className="space-y-4">
          {viewer.isOwner ? (
            <OwnerActions item={item} viewer={viewer} onChanged={reload} />
          ) : (
            <VisitorActions item={item} viewer={viewer} />
          )}
        </aside>
      </div>
    </div>
  );
}
