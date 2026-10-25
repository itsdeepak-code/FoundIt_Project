import { Check, PackageCheck, X } from 'lucide-react';
import { useState } from 'react';
import { claimsApi } from '../api/claimsApi.js';
import { getErrorInfo } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from './ui/Button.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';

/**
 * Accept / reject / mark-as-returned buttons for the found-item reporter.
 * The server re-checks every rule; these buttons are only shown when they make sense.
 */
export default function ClaimActions({ claim, itemStatus, otherPendingCount = 0, onUpdated }) {
  const toast = useToast();
  const [dialog, setDialog] = useState(null); // 'accept' | 'reject' | 'complete'
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);

  const canDecide = claim.status === 'pending' && itemStatus === 'open';
  const canComplete = claim.status === 'accepted';
  if (!canDecide && !canComplete) return null;

  const open = (name) => {
    setNote('');
    setDialog(name);
  };

  const run = async () => {
    setWorking(true);
    try {
      const result =
        dialog === 'complete'
          ? await claimsApi.complete(claim.id)
          : await claimsApi.decide(claim.id, dialog === 'accept' ? 'accepted' : 'rejected', note.trim());
      toast.success(result.message);
      setDialog(null);
      onUpdated(result.data.claim);
    } catch (error) {
      toast.error(getErrorInfo(error).message);
      setDialog(null);
      onUpdated(null); // refresh - the claim may have changed in the meantime
    } finally {
      setWorking(false);
    }
  };

  const dialogs = {
    accept: {
      title: `Accept ${claim.claimant.name}'s claim?`,
      message:
        'You are confirming that their details match the item. Your email addresses will be shared so you can arrange the handover.' +
        (otherPendingCount > 0
          ? ` The other ${otherPendingCount} pending ${otherPendingCount === 1 ? 'claim' : 'claims'} will be rejected automatically.`
          : ''),
      confirmLabel: 'Accept claim',
      variant: 'primary',
      notePlaceholder: 'Optional: how and where they can collect it, e.g. "Library front desk, after 3 pm".',
    },
    reject: {
      title: 'Reject this claim?',
      message: 'The claimant will see that their claim was rejected. The listing stays open for other claims.',
      confirmLabel: 'Reject claim',
      variant: 'danger',
      notePlaceholder: 'Optional: a short reason, e.g. "The description doesn\'t match."',
    },
    complete: {
      title: 'Mark item as returned?',
      message: `Only do this once ${claim.claimant.name} actually has the item back. The claim will be completed and the listing resolved. This cannot be undone.`,
      confirmLabel: 'Yes, it has been returned',
      variant: 'success',
    },
  };
  const current = dialog ? dialogs[dialog] : null;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        {canDecide && (
          <>
            <Button icon={Check} onClick={() => open('accept')}>
              Accept
            </Button>
            <Button variant="secondary" icon={X} onClick={() => open('reject')}>
              Reject
            </Button>
          </>
        )}
        {canComplete && (
          <Button variant="success" icon={PackageCheck} onClick={() => open('complete')}>
            Mark as returned
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(current)}
        title={current?.title}
        message={current?.message}
        confirmLabel={current?.confirmLabel}
        variant={current?.variant}
        loading={working}
        onConfirm={run}
        onCancel={() => setDialog(null)}
      >
        {current?.notePlaceholder && (
          <textarea
            className="input"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={current.notePlaceholder}
            aria-label="Note to the claimant"
          />
        )}
      </ConfirmDialog>
    </>
  );
}
