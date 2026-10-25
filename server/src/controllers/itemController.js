import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { removeUpload } from '../middleware/upload.js';
import { rejectPendingClaims } from '../services/claimService.js';
import { buildBrowseQuery, formatItem, isOwner } from '../services/itemService.js';
import { AppError } from '../utils/AppError.js';
import { ACTIVE_CLAIM_STATUSES, CLAIM_STATUS, ITEM_STATUS } from '../utils/constants.js';
import { sendSuccess } from '../utils/response.js';

const imageUrlFor = (file) => (file ? `/uploads/${file.filename}` : null);

/**
 * Route middleware: loads the listing and makes sure the current user owns it.
 * Runs before the image upload, so files from other users are never saved.
 */
export async function loadOwnedItem(req, res, next) {
  const item = await Item.findById(req.params.id);
  if (!item) throw AppError.notFound('Listing not found.');
  if (!isOwner(item, req.user)) throw AppError.forbidden('You can only manage your own listings.');
  req.item = item;
  next();
}

// GET /api/items - public browse with search, filters, sort and pagination.
export async function listItems(req, res) {
  const { filter, sort, limit, page, skip } = buildBrowseQuery(req.query);
  const [items, total] = await Promise.all([
    Item.find(filter).sort(sort).skip(skip).limit(limit).populate('createdBy', 'name'),
    Item.countDocuments(filter),
  ]);
  sendSuccess(res, {
    items: items.map(formatItem),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

// GET /api/items/mine - the current user's listings with claim counts.
export async function listMyItems(req, res) {
  const items = await Item.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).populate('createdBy', 'name');

  const counts = await Claim.aggregate([
    { $match: { reporterId: req.user._id } },
    {
      $group: {
        _id: '$itemId',
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', CLAIM_STATUS.PENDING] }, 1, 0] } },
      },
    },
  ]);
  const countsByItem = new Map(counts.map((c) => [String(c._id), c]));

  sendSuccess(res, {
    items: items.map((item) => {
      const count = countsByItem.get(String(item._id));
      return { ...formatItem(item), claimCounts: { total: count?.total ?? 0, pending: count?.pending ?? 0 } };
    }),
  });
}

// GET /api/items/:id - public details, plus what the current viewer is allowed to do.
export async function getItem(req, res) {
  const item = await Item.findById(req.params.id).populate('createdBy', 'name');
  if (!item) throw AppError.notFound('Listing not found.');

  const user = req.user;
  const owner = isOwner(item, user);
  const viewer = { isLoggedIn: Boolean(user), isOwner: owner, myClaim: null, claimCounts: null };

  if (user && !owner) {
    // The viewer's own most recent claim on this item (if any).
    const myClaim = await Claim.findOne({ itemId: item._id, claimantId: user._id }).sort({ createdAt: -1 });
    if (myClaim) viewer.myClaim = { id: myClaim._id, status: myClaim.status };
  }
  if (owner) {
    const [total, pending, accepted] = await Promise.all([
      Claim.countDocuments({ itemId: item._id }),
      Claim.countDocuments({ itemId: item._id, status: CLAIM_STATUS.PENDING }),
      Claim.findOne({ itemId: item._id, status: { $in: [CLAIM_STATUS.ACCEPTED, CLAIM_STATUS.COMPLETED] } }),
    ]);
    viewer.claimCounts = { total, pending };
    viewer.acceptedClaimId = accepted?._id ?? null;
  }

  const hasActiveClaim = viewer.myClaim && ACTIVE_CLAIM_STATUSES.includes(viewer.myClaim.status);
  viewer.canClaim = Boolean(user) && !owner && item.type === 'found' && item.status === ITEM_STATUS.OPEN && !hasActiveClaim;
  viewer.canEdit = owner && item.status === ITEM_STATUS.OPEN;
  viewer.canClose = owner && item.status === ITEM_STATUS.OPEN;
  viewer.canMarkRecovered = owner && item.type === 'lost' && item.status === ITEM_STATUS.OPEN;
  viewer.canDelete = owner && !viewer.acceptedClaimId;

  sendSuccess(res, { item: formatItem(item), viewer });
}

// POST /api/items
export async function createItem(req, res) {
  const { removeImage, ...fields } = req.body;
  const item = await Item.create({ ...fields, imageUrl: imageUrlFor(req.file), createdBy: req.user._id });
  await item.populate('createdBy', 'name');
  sendSuccess(res, { item: formatItem(item) }, { status: 201, message: 'Listing published.' });
}

// PATCH /api/items/:id - only the owner, and only while the listing is open.
export async function updateItem(req, res) {
  const { item } = req;
  if (item.status !== ITEM_STATUS.OPEN) {
    throw AppError.conflict('Only open listings can be edited.');
  }

  const { removeImage, ...fields } = req.body;
  if (fields.type !== item.type && (await Claim.exists({ itemId: item._id }))) {
    throw AppError.conflict('You cannot change the listing type after claims have been made.');
  }

  const oldImage = item.imageUrl;
  if (req.file) item.imageUrl = imageUrlFor(req.file);
  else if (removeImage) item.imageUrl = null;

  Object.assign(item, fields);
  await item.save();
  if (oldImage && oldImage !== item.imageUrl) await removeUpload(oldImage);

  await item.populate('createdBy', 'name');
  sendSuccess(res, { item: formatItem(item) }, { message: 'Listing updated.' });
}

// DELETE /api/items/:id - not allowed once a claim has been accepted.
export async function deleteItem(req, res) {
  const { item } = req;
  const hasAccepted = await Claim.exists({
    itemId: item._id,
    status: { $in: [CLAIM_STATUS.ACCEPTED, CLAIM_STATUS.COMPLETED] },
  });
  if (hasAccepted || item.status === ITEM_STATUS.CLAIM_PENDING) {
    throw AppError.conflict('This listing has an accepted claim and can no longer be deleted.');
  }

  await Claim.deleteMany({ itemId: item._id });
  await item.deleteOne();
  await removeUpload(item.imageUrl);
  sendSuccess(res, null, { message: 'Listing deleted.' });
}

// PATCH /api/items/:id/close - owner closes an open listing that is no longer relevant.
export async function closeItem(req, res) {
  const { item } = req;
  const updated = await Item.findOneAndUpdate(
    { _id: item._id, status: ITEM_STATUS.OPEN },
    { status: ITEM_STATUS.CLOSED },
    { new: true }
  ).populate('createdBy', 'name');
  if (!updated) throw AppError.conflict('Only open listings can be closed.');

  await rejectPendingClaims(item._id, 'The reporter closed this listing.');
  sendSuccess(res, { item: formatItem(updated) }, { message: 'Listing closed.' });
}

// PATCH /api/items/:id/recovered - owner of a LOST item says they got it back.
export async function markLostItemRecovered(req, res) {
  const { item } = req;
  if (item.type !== 'lost') {
    throw AppError.badRequest('Found items are resolved by completing an accepted claim.');
  }
  const updated = await Item.findOneAndUpdate(
    { _id: item._id, status: ITEM_STATUS.OPEN },
    { status: ITEM_STATUS.RESOLVED },
    { new: true }
  ).populate('createdBy', 'name');
  if (!updated) throw AppError.conflict('Only open listings can be marked as recovered.');

  sendSuccess(res, { item: formatItem(updated) }, { message: 'Great news! Listing marked as recovered.' });
}
