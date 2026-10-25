import { CATEGORIES, ITEM_TYPES } from '../utils/constants.js';
import { checkLength, checkOneOf, clean, collectErrors } from './helpers.js';

function checkIncidentDate(raw) {
  if (!raw) return { error: 'Date is required.' };
  // Accept "YYYY-MM-DD" from <input type="date"> and store it as midday UTC
  // so the calendar day doesn't shift across time zones.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T12:00:00Z`) : new Date(raw);
  if (Number.isNaN(date.getTime())) return { error: 'Enter a valid date.' };

  const oneDayAhead = Date.now() + 24 * 60 * 60 * 1000;
  if (date.getTime() > oneDayAhead) return { error: 'Date cannot be in the future.' };

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (date < oneYearAgo) return { error: 'Date must be within the last year.' };

  return { date };
}

// Used for both creating and editing a listing (the form always sends every field).
// Bodies arrive as multipart/form-data, so every value is a string.
export function validateItem(body) {
  const { date, error: dateError } = checkIncidentDate(clean(body.incidentDate));
  const value = {
    title: clean(body.title),
    description: clean(body.description),
    type: clean(body.type),
    category: clean(body.category),
    location: clean(body.location),
    incidentDate: date,
    removeImage: body.removeImage === 'true',
  };

  const errors = collectErrors([
    ['title', checkLength(value.title, 'Title', 3, 100)],
    ['description', checkLength(value.description, 'Description', 10, 1000)],
    ['type', checkOneOf(value.type, 'Listing type', ITEM_TYPES)],
    ['category', checkOneOf(value.category, 'Category', CATEGORIES)],
    ['location', checkLength(value.location, 'Location', 2, 120)],
    ['incidentDate', dateError],
  ]);
  return { value, errors };
}
