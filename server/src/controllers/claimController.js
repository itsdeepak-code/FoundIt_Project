import * as claimService from '../services/claimService.js';
import { CLAIM_STATUS } from '../utils/constants.js';
import { sendSuccess } from '../utils/response.js';

// POST /api/items/:id/claims
export async function createClaim(req, res) {
  const claim = await claimService.submitClaim(req.params.id, req.user, req.body);
  sendSuccess(res, { claim }, { status: 201, message: 'Claim submitted. The finder will review it.' });
}

// GET /api/items/:id/claims - reporter only
export async function listClaimsForItem(req, res) {
  const claims = await claimService.getClaimsForItem(req.params.id, req.user);
  sendSuccess(res, { claims });
}

// GET /api/claims/mine
export async function listMyClaims(req, res) {
  const claims = await claimService.getMyClaims(req.user);
  sendSuccess(res, { claims });
}

// GET /api/claims/:id - claimant or reporter only
export async function getClaim(req, res) {
  const claim = await claimService.getClaimForViewer(req.params.id, req.user);
  sendSuccess(res, { claim });
}

// PATCH /api/claims/:id/decision  { decision: "accepted" | "rejected", reviewNote? }
export async function decideClaim(req, res) {
  const claim = await claimService.decideClaim(req.params.id, req.user, req.body);
  const message = req.body.decision === CLAIM_STATUS.ACCEPTED ? 'Claim accepted.' : 'Claim rejected.';
  sendSuccess(res, { claim }, { message });
}

// PATCH /api/claims/:id/complete
export async function completeClaim(req, res) {
  const claim = await claimService.completeClaim(req.params.id, req.user);
  sendSuccess(res, { claim }, { message: 'Item marked as returned. Listing resolved!' });
}
