/**
 * Label + input + error message wrapper.
 *   <FormField label="Title" error={errors.title} htmlFor="title"><input id="title" .../></FormField>
 */
export default function FormField({ label, htmlFor, error, hint, optional, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

// Adds the red error styling to an input's class list when needed.
export const inputClass = (error, extra = '') => `input ${error ? 'input-error' : ''} ${extra}`;
