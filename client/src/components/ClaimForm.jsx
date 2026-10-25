import { Lock, Send } from 'lucide-react';
import { useState } from 'react';
import { claimsApi } from '../api/claimsApi.js';
import { getErrorInfo } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { validateClaimForm } from '../utils/validation.js';
import Button from './ui/Button.jsx';
import FormField, { inputClass } from './ui/FormField.jsx';

/** Form a user fills in to claim a found item. Calls onSubmitted(claim) on success. */
export default function ClaimForm({ itemId, onSubmitted, onCancel }) {
  const toast = useToast();
  const [values, setValues] = useState({ ownershipReason: '', identifyingDetails: '', additionalNotes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validateClaimForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await claimsApi.submit(itemId, values);
      toast.success(result.message);
      onSubmitted(result.data.claim);
    } catch (error) {
      const info = getErrorInfo(error);
      setErrors(info.errors);
      toast.error(info.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        label="Why do you believe this is yours?"
        htmlFor="ownershipReason"
        error={errors.ownershipReason}
        hint="e.g. when and where you lost it."
      >
        <textarea
          id="ownershipReason"
          name="ownershipReason"
          rows={3}
          maxLength={1000}
          className={inputClass(errors.ownershipReason)}
          value={values.ownershipReason}
          onChange={handleChange}
          placeholder="I left it on a desk in the library reading room on Monday afternoon…"
        />
      </FormField>
      <FormField
        label="Identifying details"
        htmlFor="identifyingDetails"
        error={errors.identifyingDetails}
        hint="Something only the owner would know: marks, stickers, contents, colour, lock screen…"
      >
        <textarea
          id="identifyingDetails"
          name="identifyingDetails"
          rows={3}
          maxLength={1000}
          className={inputClass(errors.identifyingDetails)}
          value={values.identifyingDetails}
          onChange={handleChange}
          placeholder="Small dent near the bottom and a sticker of a cat on the lid."
        />
      </FormField>
      <FormField label="Additional notes" htmlFor="additionalNotes" error={errors.additionalNotes} optional>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          rows={2}
          maxLength={500}
          className={inputClass(errors.additionalNotes)}
          value={values.additionalNotes}
          onChange={handleChange}
          placeholder="Best times to collect, etc."
        />
      </FormField>
      <p className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        Only the person who found this item can read your claim. Don&apos;t include passwords, ID numbers or bank
        details. Contact emails are shared only if your claim is accepted.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting} icon={Send}>
          Submit claim
        </Button>
      </div>
    </form>
  );
}
