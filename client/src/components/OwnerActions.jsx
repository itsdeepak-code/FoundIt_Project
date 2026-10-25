import { Archive, CheckCircle2, Eye, Inbox, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getErrorInfo } from '../api/client.js';
import { itemsApi } from '../api/itemsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from './ui/Button.jsx';
import ConfirmDialog from './ui/ConfirmDialog.jsx';

const CONFIRMS = {
  recovered: {
    title: 'Mark as recovered?',
    message: 'Great! This tells everyone you got your item back. The listing will be marked resolved.',
    confirmLabel: 'Yes, I got it back',
    variant: 'success',
  },
  close: {
    title: 'Close this listing?',
    message: 'The listing will stop accepting claims and any pending claims will be rejected. This cannot be undone.',
    confirmLabel: 'Close listing',
    variant: 'danger',
  },
  delete: {
    title: 'Delete this listing?',
    message: 'The listing and any claims on it will be permanently removed.',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
};

/** Management panel shown to the person who reported the item. */
export default function OwnerActions({ item, viewer, onChanged }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(null); // 'recovered' | 'close' | 'delete'
  const [working, setWorking] = useState(false);

  const runAction = async () => {
    setWorking(true);
    try {
      if (confirming === 'delete') {
        const result = await itemsApi.remove(item.id);
        toast.success(result.message);
        navigate('/dashboard');
        return;
      }
      const result = confirming === 'close' ? await itemsApi.close(item.id) : await itemsApi.markRecovered(item.id);
      toast.success(result.message);
      setConfirming(null);
      onChanged();
    } catch (error) {
      toast.error(getErrorInfo(error).message);
      setConfirming(null);
    } finally {
      setWorking(false);
    }
  };

  const pending = viewer.claimCounts?.pending ?? 0;

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-slate-900">You reported this item</h2>
      <p className="mt-1 text-sm text-slate-500">
        {item.type === 'found'
          ? 'Review claims from people who think this belongs to them.'
          : 'Mark it as recovered once you have it back.'}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {item.type === 'found' && (
          <Button to={`/items/${item.id}/claims`} icon={Inbox}>
            Review claims
            {pending > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{pending} pending</span>
            )}
          </Button>
        )}
        {viewer.acceptedClaimId && (
          <Button to={`/claims/${viewer.acceptedClaimId}`} variant="secondary" icon={Eye}>
            {item.status === 'resolved' ? 'View completed claim' : 'View accepted claim'}
          </Button>
        )}
        {viewer.canMarkRecovered && (
          <Button variant="success" icon={CheckCircle2} onClick={() => setConfirming('recovered')}>
            I got it back
          </Button>
        )}
        {viewer.canEdit && (
          <Button to={`/items/${item.id}/edit`} variant="secondary" icon={Pencil}>
            Edit listing
          </Button>
        )}
        {viewer.canClose && (
          <Button variant="secondary" icon={Archive} onClick={() => setConfirming('close')}>
            Close listing
          </Button>
        )}
        {viewer.canDelete && (
          <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" icon={Trash2} onClick={() => setConfirming('delete')}>
            Delete listing
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        {...(confirming ? CONFIRMS[confirming] : {})}
        loading={working}
        onConfirm={runAction}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}
