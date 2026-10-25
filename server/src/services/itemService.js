import { CATEGORIES, ITEM_STATUS, ITEM_TYPES } from '../utils/constants.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  incident: { incidentDate: -1, createdAt: -1 },
};

// Which statuses each "status" filter value on the browse page means.
// Closed listings are never shown in browse results.
const STATUS_FILTERS = {
  active: [ITEM_STATUS.OPEN, ITEM_STATUS.CLAIM_PENDING],
  open: [ITEM_STATUS.OPEN],
  claim_pending: [ITEM_STATUS.CLAIM_PENDING],
  resolved: [ITEM_STATUS.RESOLVED],
  all: [ITEM_STATUS.OPEN, ITEM_STATUS.CLAIM_PENDING, ITEM_STATUS.RESOLVED],
};

// Escape user input before putting it in a RegExp, so "(" or "." are matched literally.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Turns the browse page query string into a MongoDB filter, sort and pagination. */
export function buildBrowseQuery(query) {
  const filter = {};
  const str = (value) => (typeof value === 'string' ? value.trim() : '');

  const type = str(query.type);
  if (ITEM_TYPES.includes(type)) filter.type = type;

  const category = str(query.category);
  if (CATEGORIES.includes(category)) filter.category = category;

  filter.status = { $in: STATUS_FILTERS[str(query.status)] || STATUS_FILTERS.active };

  const location = str(query.location).slice(0, 100);
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };

  // Partial, case-insensitive match on title or description ("bott" finds "Water bottle").
  const search = str(query.search).slice(0, 100);
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const sort = SORTS[str(query.sort)] || SORTS.newest;
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 24);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);

  return { filter, sort, limit, page, skip: (page - 1) * limit };
}

/** Public shape of an item. Expects `createdBy` to be populated with the reporter's name. */
export function formatItem(item) {
  const reporter = item.createdBy;
  return {
    id: item._id,
    title: item.title,
    description: item.description,
    type: item.type,
    category: item.category,
    location: item.location,
    incidentDate: item.incidentDate,
    imageUrl: item.imageUrl,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    // Only the reporter's first name is public - no email or other details.
    reporter: reporter?._id ? { id: reporter._id, name: reporter.name.split(' ')[0] } : { id: reporter },
  };
}

export function isOwner(item, user) {
  const ownerId = item.createdBy?._id ?? item.createdBy;
  return Boolean(user) && String(ownerId) === String(user._id);
}
