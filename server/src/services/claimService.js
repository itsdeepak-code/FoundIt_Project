import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { AppError } from '../utils/AppError.js';
import { ACTIVE_CLAIM_STATUSES, CLAIM_STATUS, ITEM_STATUS } from '../utils/constants.js';

/*
 * Recovery claim workflow.
 *
 * The local MongoDB runs as a single server (not a replica set), so multi-document
 * transactions are not available. Instead every state change is a *conditional*
 * update - e.g. "set the item to claim_pending ONLY IF it is still open". If two
 * requests race, only one update matches and the other gets a 409 Conflict.
 * A unique partial index on Claim (one accepted/completed claim per item) is the
 * final safety net.
 */

const ITEM_FIELDS = 'title type category location status imageUrl incidentDate createdBy';

// Contact details are only shared between the two people once a claim is accepted.
const sharesContact = (claim) =>
  claim.status === CLAIM_STATUS.ACCEPTED || claim.status === CLAIM_STATUS.COMPLETED;

function formatPerson(person, includeEmail) {
  if (!person?._id) return { id: person };
  const data = { id: person._id, name: person.name };
  if (includeEmail) data.email = person.email;
  return data;
}

export function formatClaim(claim, viewer) {
  const item = claim.itemId;
  const showContact = sharesContact(claim);
  const reporterId = claim.reporterId?._id ?? claim.reporterId;
  return {
    id: claim._id,
    status: claim.status,
    ownershipReason: claim.ownershipReason,
    identifyingDetails: claim.identifyingDetails,
    additionalNotes: claim.additionalNotes,
    reviewNote: claim.reviewNote,
    reviewedAt: claim.reviewedAt,
    completedAt: claim.completedAt,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
    item: item?._id
      ? {
          id: item._id,
          title: item.title,
          type: item.type,
          category: item.category,
          location: item.location,
          status: item.status,
          imageUrl: item.imageUrl,
          incidentDate: item.incidentDate,
        }
      : { id: item },
    claimant: formatPerson(claim.claimantId, showContact),
    reporter: formatPerson(claim.reporterId, showContact),
    viewerRole: viewer && String(reporterId) === String(viewer._id) ? 'reporter' : 'claimant',
  };
}

function populateClaim(query) {
  return query
    .populate('itemId', ITEM_FIELDS)
    .populate('claimantId', 'name email')
    .populate('reporterId', 'name email');
}

async function findClaimForReporter(claimId, user) {
  const claim = await Claim.findById(claimId);
  if (!claim) throw AppError.notFound('Claim not found.');
  if (String(claim.reporterId) !== String(user._id)) {
    throw AppError.forbidden('Only the person who reported this found item can review its claims.');
  }
  return claim;
}

async function loadFormatted(claimId, user) {
  return formatClaim(await populateClaim(Claim.findById(claimId)), user);
}

/** A user submits a claim saying a found item belongs to them. */
export async function submitClaim(itemId, user, details) {
  const item = await Item.findById(itemId);
  if (!item) throw AppError.notFound('Listing not found.');
  if (item.type !== 'found') throw AppError.badRequest('Claims can only be made on found items.');
  if (String(item.createdBy) === String(user._id)) {
    throw AppError.forbidden('You cannot claim an item you reported yourself.');
  }
  if (item.status !== ITEM_STATUS.OPEN) {
    throw AppError.conflict('This listing is no longer accepting claims.');
  }

  const existing = await Claim.exists({
    itemId: item._id,
    claimantId: user._id,
    status: { $in: ACTIVE_CLAIM_STATUSES },
  });
  if (existing) throw AppError.conflict('You already have an active claim on this item.');

  try {
    const claim = await Claim.create({
      ...details,
      itemId: item._id,
      claimantId: user._id,
      reporterId: item.createdBy,
    });
    return loadFormatted(claim._id, user);
  } catch (error) {
    // Unique index hit: a duplicate claim slipped in between the check and the insert.
    if (error.code === 11000) throw AppError.conflict('You already have an active claim on this item.');
    throw error;
  }
}

/** Rejects every pending claim on an item (optionally except one) with an explanation. */
export async function rejectPendingClaims(itemId, note, exceptClaimId = null) {
  const filter = { itemId, status: CLAIM_STATUS.PENDING };
  if (exceptClaimId) filter._id = { $ne: exceptClaimId };
  await Claim.updateMany(filter, { status: CLAIM_STATUS.REJECTED, reviewNote: note, reviewedAt: new Date() });
}

/** The found-item reporter accepts or rejects a pending claim. */
export async function decideClaim(claimId, user, { decision, reviewNote }) {
  const claim = await findClaimForReporter(claimId, user);
  if (claim.status !== CLAIM_STATUS.PENDING) {
    throw AppError.conflict(`This claim has already been ${claim.status}.`);
  }

  const reviewed = { reviewNote, reviewedAt: new Date() };

  if (decision === CLAIM_STATUS.REJECTED) {
    const updated = await Claim.findOneAndUpdate(
      { _id: claim._id, status: CLAIM_STATUS.PENDING },
      { status: CLAIM_STATUS.REJECTED, ...reviewed }
    );
    if (!updated) throw AppError.conflict('This claim was already reviewed.');
    return loadFormatted(claim._id, user);
  }

  // ACCEPT. Step 1: reserve the item - only succeeds if it is still open.
  const item = await Item.findOneAndUpdate(
    { _id: claim.itemId, createdBy: user._id, status: ITEM_STATUS.OPEN },
    { status: ITEM_STATUS.CLAIM_PENDING }
  );
  if (!item) {
    throw AppError.conflict('This listing already has an accepted claim or is no longer open.');
  }

  // Step 2: accept the claim. If that fails, release the item again.
  let accepted = null;
  try {
    accepted = await Claim.findOneAndUpdate(
      { _id: claim._id, status: CLAIM_STATUS.PENDING },
      { status: CLAIM_STATUS.ACCEPTED, ...reviewed }
    );
  } catch (error) {
    if (error.code !== 11000) {
      await Item.updateOne({ _id: claim.itemId }, { status: ITEM_STATUS.OPEN });
      throw error;
    }
  }
  if (!accepted) {
    await Item.updateOne({ _id: claim.itemId, status: ITEM_STATUS.CLAIM_PENDING }, { status: ITEM_STATUS.OPEN });
    throw AppError.conflict('This claim could not be accepted. Please refresh and try again.');
  }

  // Step 3: everyone else waiting on this item is told it went to someone else.
  await rejectPendingClaims(claim.itemId, 'Another claim for this item was accepted.', claim._id);
  return loadFormatted(claim._id, user);
}

/** The reporter confirms the item was physically returned: claim completed, item resolved. */
export async function completeClaim(claimId, user) {
  const claim = await findClaimForReporter(claimId, user);
  if (claim.status !== CLAIM_STATUS.ACCEPTED) {
    throw AppError.conflict('Only an accepted claim can be marked as returned.');
  }

  const completed = await Claim.findOneAndUpdate(
    { _id: claim._id, status: CLAIM_STATUS.ACCEPTED },
    { status: CLAIM_STATUS.COMPLETED, completedAt: new Date() }
  );
  if (!completed) throw AppError.conflict('This claim was already completed.');

  await Item.updateOne(
    { _id: claim.itemId, status: ITEM_STATUS.CLAIM_PENDING },
    { status: ITEM_STATUS.RESOLVED }
  );
  await rejectPendingClaims(claim.itemId, 'This item has been returned to its owner.', claim._id);
  return loadFormatted(claim._id, user);
}

/** Claim details - visible only to the claimant and the found-item reporter. */
export async function getClaimForViewer(claimId, user) {
  const claim = await populateClaim(Claim.findById(claimId));
  if (!claim) throw AppError.notFound('Claim not found.');
  const viewerId = String(user._id);
  const claimantId = String(claim.claimantId?._id ?? claim.claimantId);
  const reporterId = String(claim.reporterId?._id ?? claim.reporterId);
  if (viewerId !== claimantId && viewerId !== reporterId) {
    throw AppError.forbidden('You do not have access to this claim.');
  }
  return formatClaim(claim, user);
}

/** All claims on one listing - for the reporter's "Incoming claims" page. */
export async function getClaimsForItem(itemId, user) {
  const item = await Item.findById(itemId);
  if (!item) throw AppError.notFound('Listing not found.');
  if (String(item.createdBy) !== String(user._id)) {
    throw AppError.forbidden('Only the person who reported this item can view its claims.');
  }
  const claims = await populateClaim(Claim.find({ itemId }).sort({ createdAt: -1 }));
  return claims.map((claim) => formatClaim(claim, user));
}

/** Claims the current user has submitted. */
export async function getMyClaims(user) {
  const claims = await populateClaim(Claim.find({ claimantId: user._id }).sort({ createdAt: -1 }));
  return claims.map((claim) => formatClaim(claim, user));
}

