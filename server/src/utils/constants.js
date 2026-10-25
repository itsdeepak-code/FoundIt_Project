export const ITEM_TYPES = ['lost', 'found'];

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

/**
 * Item status transitions (enforced in the controllers/services, never set directly by clients):
 *   open          -> claim_pending  (reporter accepts a claim on a found item)
 *   claim_pending -> resolved       (reporter marks the accepted claim as returned)
 *   open          -> resolved       (owner of a LOST item marks it as recovered)
 *   open          -> closed         (owner closes a listing that is no longer relevant)
 */
export const ITEM_STATUS = {
  OPEN: 'open',
  CLAIM_PENDING: 'claim_pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};
export const ITEM_STATUSES = Object.values(ITEM_STATUS);

/**
 * Claim status transitions:
 *   pending  -> accepted   (reporter accepts; all other pending claims become rejected)
 *   pending  -> rejected   (reporter rejects, or another claim was accepted, or listing closed)
 *   accepted -> completed  (reporter confirms the item was handed back)
 */
export const CLAIM_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};
export const CLAIM_STATUSES = Object.values(CLAIM_STATUS);

// Claims that still "count" - a user may only have one of these per listing.
export const ACTIVE_CLAIM_STATUSES = [CLAIM_STATUS.PENDING, CLAIM_STATUS.ACCEPTED];
