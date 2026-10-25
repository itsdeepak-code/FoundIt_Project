import { CLAIM_STATUS } from '../utils/constants.js';
import { checkLength, checkOneOf, clean, collectErrors } from './helpers.js';

export function validateClaim(body) {
  const value = {
    ownershipReason: clean(body.ownershipReason),
    identifyingDetails: clean(body.identifyingDetails),
    additionalNotes: clean(body.additionalNotes),
  };
  const errors = collectErrors([
    ['ownershipReason', checkLength(value.ownershipReason, 'This explanation', 10, 1000)],
    ['identifyingDetails', checkLength(value.identifyingDetails, 'Identifying details', 5, 1000)],
    ['additionalNotes', checkLength(value.additionalNotes, 'Notes', 0, 500)],
  ]);
  return { value, errors };
}

export function validateDecision(body) {
  const value = {
    decision: clean(body.decision),
    reviewNote: clean(body.reviewNote),
  };
  const errors = collectErrors([
    ['decision', checkOneOf(value.decision, 'Decision', [CLAIM_STATUS.ACCEPTED, CLAIM_STATUS.REJECTED])],
    ['reviewNote', checkLength(value.reviewNote, 'Note', 0, 500)],
  ]);
  return { value, errors };
}
