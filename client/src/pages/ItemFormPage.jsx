import { Save, SearchX, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { getErrorInfo } from '../api/client.js';
import { itemsApi } from '../api/itemsApi.js';
import BackLink from '../components/BackLink.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import Button from '../components/ui/Button.jsx';
import FormField, { inputClass } from '../components/ui/FormField.jsx';
import { ErrorState, LoadingState } from '../components/ui/States.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CATEGORIES } from '../utils/constants.js';
import { toDateInputValue, todayInputValue } from '../utils/format.js';
import { validateItemForm } from '../utils/validation.js';

const TYPE_OPTIONS = [
  { value: 'lost', title: 'I lost something', text: 'Describe what you lost and where you last saw it.', icon: SearchX },
  { value: 'found', title: 'I found something', text: 'Describe what you found and where you found it.', icon: Sparkles },
];

// Labels change depending on whether the item was lost or found.
const COPY = {
  lost: {
    titlePlaceholder: 'e.g. Black JBL headphones',
    description: 'What does it look like? Brand, colour, any marks or stickers…',
    location: 'Where did you last see it?',
    locationPlaceholder: 'e.g. Library 2nd floor, near the printers',
    date: 'Date you lost it',
  },
  found: {
    titlePlaceholder: 'e.g. Blue steel water bottle',
    description: 'Describe the item. Tip: keep one detail private so you can verify the real owner.',
    location: 'Where did you find it?',
    locationPlaceholder: 'e.g. Canteen, table near the entrance',
    date: 'Date you found it',
  },
};

export default function ItemFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit listing' : 'Report an item');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(() => ({
    type: ['lost', 'found'].includes(searchParams.get('type')) ? searchParams.get('type') : '',
    title: '',
    description: '',
    category: CATEGORIES.includes(searchParams.get('category')) ? searchParams.get('category') : '',
    location: '',
    incidentDate: todayInputValue(),
  }));
  const [image, setImage] = useState({ file: null, removed: false });
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadState, setLoadState] = useState({ loading: isEdit, error: null });

  // When editing, load the listing and make sure it can still be edited.
  useEffect(() => {
    if (!isEdit) return;
    itemsApi
      .get(id)
      .then(({ item, viewer }) => {
        if (!viewer.isOwner) {
          setLoadState({ loading: false, error: { status: 403, message: 'You can only edit your own listings.' } });
          return;
        }
        if (!viewer.canEdit) {
          setLoadState({ loading: false, error: { status: 409, message: 'Only open listings can be edited.' } });
          return;
        }
        setValues({
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          incidentDate: toDateInputValue(item.incidentDate),
        });
        setCurrentImageUrl(item.imageUrl);
        setLoadState({ loading: false, error: null });
      })
      .catch((error) => setLoadState({ loading: false, error: getErrorInfo(error) }));
  }, [id, isEdit]);

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const handleChange = (event) => setField(event.target.name, event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clientErrors = validateItemForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    const payload = { ...values, image: image.file, removeImage: image.removed };
    try {
      const result = isEdit ? await itemsApi.update(id, payload) : await itemsApi.create(payload);
      toast.success(result.message);
      navigate(`/items/${result.data.item.id}`);
    } catch (error) {
      const info = getErrorInfo(error);
      setErrors(info.errors);
      toast.error(info.message);
      setSubmitting(false);
    }
  };

  if (loadState.loading) return <LoadingState label="Loading listing…" />;
  if (loadState.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={loadState.error} />
      </div>
    );
  }

  const copy = COPY[values.type || 'lost'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to={isEdit ? `/items/${id}` : '/items'}>{isEdit ? 'Back to listing' : 'Back to items'}</BackLink>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {isEdit ? 'Edit listing' : 'Report an item'}
      </h1>
      <p className="mt-1 text-slate-500">
        {isEdit ? 'Update the details of your listing.' : 'A few details help the right person find it.'}
      </p>

      <form onSubmit={handleSubmit} noValidate className="card mt-6 space-y-6 p-5 sm:p-7">
        <fieldset>
          <legend className="label">What happened?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TYPE_OPTIONS.map(({ value, title, text, icon: Icon }) => {
              const selected = values.type === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    selected ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={selected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Icon className={`mt-0.5 size-5 shrink-0 ${selected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>
                    <span className="block font-medium text-slate-900">{title}</span>
                    <span className="block text-sm text-slate-500">{text}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.type && <p className="mt-1.5 text-xs text-red-600">{errors.type}</p>}
        </fieldset>

        <FormField label="Item name" htmlFor="title" error={errors.title}>
          <input
            id="title"
            name="title"
            maxLength={100}
            className={inputClass(errors.title)}
            value={values.title}
            onChange={handleChange}
            placeholder={copy.titlePlaceholder}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={errors.description} hint={copy.description}>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
            className={inputClass(errors.description)}
            value={values.description}
            onChange={handleChange}
          />
        </FormField>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Category" htmlFor="category" error={errors.category}>
            <select
              id="category"
              name="category"
              className={inputClass(errors.category)}
              value={values.category}
              onChange={handleChange}
            >
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={copy.date} htmlFor="incidentDate" error={errors.incidentDate}>
            <input
              id="incidentDate"
              name="incidentDate"
              type="date"
              max={todayInputValue()}
              className={inputClass(errors.incidentDate)}
              value={values.incidentDate}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <FormField label={copy.location} htmlFor="location" error={errors.location}>
          <input
            id="location"
            name="location"
            maxLength={120}
            className={inputClass(errors.location)}
            value={values.location}
            onChange={handleChange}
            placeholder={copy.locationPlaceholder}
          />
        </FormField>

        <ImagePicker currentUrl={currentImageUrl} error={errors.image} onChange={setImage} />

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} icon={Save}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
