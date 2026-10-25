// Small helpers shared by the validators. They return an error message or null.

export const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export function checkLength(value, label, min, max) {
  if (!value) return min > 0 ? `${label} is required.` : null;
  if (value.length < min) return `${label} must be at least ${min} characters.`;
  if (value.length > max) return `${label} must be at most ${max} characters.`;
  return null;
}

export function checkOneOf(value, label, allowed) {
  if (!value) return `${label} is required.`;
  if (!allowed.includes(value)) return `${label} must be one of: ${allowed.join(', ')}.`;
  return null;
}

// Builds { field: message } from a list of [field, messageOrNull] pairs.
export function collectErrors(pairs) {
  const errors = {};
  for (const [field, message] of pairs) {
    if (message) errors[field] = message;
  }
  return errors;
}
