import { CLAIM_STATUS_LABELS, ITEM_STATUS_LABELS } from '../../utils/constants.js';

function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const TYPE_STYLES = {
  lost: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  found: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200',
};

export function TypeBadge({ type }) {
  return <Badge className={TYPE_STYLES[type]}>{type === 'lost' ? 'Lost' : 'Found'}</Badge>;
}

const ITEM_STATUS_STYLES = {
  open: 'bg-indigo-50 text-indigo-700',
  claim_pending: 'bg-amber-50 text-amber-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
};

export function ItemStatusBadge({ status }) {
  return (
    <Badge className={ITEM_STATUS_STYLES[status]}>
      <span className="size-1.5 rounded-full bg-current" />
      {ITEM_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const CLAIM_STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-indigo-50 text-indigo-700',
  rejected: 'bg-slate-100 text-slate-600',
  completed: 'bg-emerald-50 text-emerald-700',
};

export function ClaimStatusBadge({ status }) {
  return (
    <Badge className={CLAIM_STATUS_STYLES[status]}>
      <span className="size-1.5 rounded-full bg-current" />
      {CLAIM_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
