// Keep these in sync with server/src/utils/constants.js
export const CATEGORIES = [
  'Electronics',
  'ID Cards',
  'Bags',
  'Books and Stationery',
  'Clothing',
  'Accessories',
  'Keys',
  'Bottles',
  'Other',
];

export const ITEM_STATUS_LABELS = {
  open: 'Open',
  claim_pending: 'Claim accepted',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const CLAIM_STATUS_LABELS = {
  pending: 'Pending review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Returned',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'incident', label: 'Most recent date lost/found' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'active', label: 'Active listings' },
  { value: 'open', label: 'Open for claims' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All statuses' },
];
