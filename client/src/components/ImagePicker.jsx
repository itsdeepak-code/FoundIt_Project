import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MAX_MB = 2;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Optional photo picker with preview.
 * `currentUrl` is the already-saved image (when editing). Calls onChange({ file, removed }).
 */
export default function ImagePicker({ currentUrl, error, onChange }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [localError, setLocalError] = useState('');
  const [preview, setPreview] = useState(null);

  // Create (and later clean up) a temporary URL to preview the chosen file.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) return setLocalError('Please choose a JPG, PNG or WEBP image.');
    if (selected.size > MAX_MB * 1024 * 1024) return setLocalError(`Image must be smaller than ${MAX_MB} MB.`);
    setLocalError('');
    setFile(selected);
    setRemoved(false);
    onChange({ file: selected, removed: false });
  };

  const handleRemove = () => {
    setFile(null);
    setRemoved(true);
    onChange({ file: null, removed: Boolean(currentUrl) });
  };

  const shownUrl = preview || (!removed && currentUrl);
  const message = localError || error;

  return (
    <div>
      <span className="label">
        Photo <span className="font-normal text-slate-400">(optional)</span>
      </span>
      {shownUrl ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-slate-200">
          <img src={shownUrl} alt="Selected item" className="aspect-[4/3] w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow hover:bg-white"
            aria-label="Remove photo"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition hover:border-indigo-400 hover:bg-indigo-50/40 ${
            message ? 'border-red-300' : 'border-slate-300'
          }`}
        >
          <ImagePlus className="size-6 text-slate-400" />
          <span className="font-medium text-slate-700">Click to add a photo</span>
          <span className="text-xs text-slate-500">JPG, PNG or WEBP, up to {MAX_MB} MB</span>
        </button>
      )}
      {shownUrl && (
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Choose a different photo
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={handleSelect} />
      {message && <p className="mt-1.5 text-xs text-red-600">{message}</p>}
    </div>
  );
}
