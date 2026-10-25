import { Mail, MessageSquareQuote } from 'lucide-react';
import { formatDateTime } from '../utils/format.js';

function Block({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-line text-sm text-slate-800">{children}</dd>
    </div>
  );
}

/** The private details of a claim (ownership reason, identifying details, notes, review note). */
export default function ClaimDetails({ claim }) {
  const isClaimant = claim.viewerRole === 'claimant';
  return (
    <dl className="space-y-4">
      <Block label={isClaimant ? 'Why you believe it is yours' : 'Why they believe it is theirs'}>
        {claim.ownershipReason}
      </Block>
      <Block label="Identifying details">{claim.identifyingDetails}</Block>
      {claim.additionalNotes && <Block label="Additional notes">{claim.additionalNotes}</Block>}
      {claim.reviewNote && (
        <div className="flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-medium text-slate-500">
              {isClaimant ? 'Note from the finder' : 'Review note'}
              {claim.reviewedAt && ` · ${formatDateTime(claim.reviewedAt)}`}
            </p>
            <p className="mt-0.5 whitespace-pre-line">{claim.reviewNote}</p>
          </div>
        </div>
      )}
    </dl>
  );
}

/** Contact card - only rendered when the server included an email (accepted/completed claims). */
export function ContactCard({ person, role }) {
  if (!person?.email) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
      <Mail className="mt-0.5 size-5 shrink-0 text-indigo-600" />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-slate-900">
          Contact the {role}: {person.name}
        </p>
        <a href={`mailto:${person.email}`} className="break-all text-indigo-700 hover:underline">
          {person.email}
        </a>
      </div>
    </div>
  );
}
