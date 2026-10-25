import mongoose from 'mongoose';
import { ACTIVE_CLAIM_STATUSES, CLAIM_STATUS, CLAIM_STATUSES } from '../utils/constants.js';

const claimSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The user who reported the found item. Stored on the claim so that
    // "incoming claims" queries and permission checks don't need an extra lookup.
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownershipReason: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    identifyingDetails: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    additionalNotes: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: CLAIM_STATUSES, default: CLAIM_STATUS.PENDING },
    // Optional message from the reporter when accepting/rejecting (e.g. pickup instructions).
    reviewNote: { type: String, trim: true, maxlength: 500, default: '' },
    reviewedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user can only have ONE active (pending or accepted) claim per listing.
claimSchema.index(
  { itemId: 1, claimantId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_CLAIM_STATUSES } } }
);

// A listing can only ever have ONE accepted/completed claim. This database
// constraint is the safety net if two "accept" requests race each other.
claimSchema.index(
  { itemId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: [CLAIM_STATUS.ACCEPTED, CLAIM_STATUS.COMPLETED] } },
    name: 'one_accepted_claim_per_item',
  }
);

claimSchema.index({ claimantId: 1, createdAt: -1 });
claimSchema.index({ reporterId: 1, status: 1 });

export const Claim = mongoose.model('Claim', claimSchema);
