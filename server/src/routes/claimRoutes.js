import { Router } from 'express';
import { completeClaim, decideClaim, getClaim, listMyClaims } from '../controllers/claimController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateDecision } from '../validators/claimValidators.js';

const router = Router();

router.use(requireAuth); // every claim route needs a logged-in user

router.get('/mine', listMyClaims);
router.get('/:id', getClaim);
router.patch('/:id/decision', validate(validateDecision), decideClaim);
router.patch('/:id/complete', completeClaim);

export default router;
