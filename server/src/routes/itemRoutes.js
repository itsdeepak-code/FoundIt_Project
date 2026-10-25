import { Router } from 'express';
import { createClaim, listClaimsForItem } from '../controllers/claimController.js';
import {
  closeItem,
  createItem,
  deleteItem,
  getItem,
  listItems,
  listMyItems,
  loadOwnedItem,
  markLostItemRecovered,
  updateItem,
} from '../controllers/itemController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { uploadItemImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { validateClaim } from '../validators/claimValidators.js';
import { validateItem } from '../validators/itemValidators.js';

const router = Router();

router.get('/', listItems);
router.get('/mine', requireAuth, listMyItems); // must come before "/:id"
router.get('/:id', optionalAuth, getItem);

// Image upload runs before validation because it parses the multipart form body.
router.post('/', requireAuth, uploadItemImage, validate(validateItem), createItem);
router.patch('/:id', requireAuth, loadOwnedItem, uploadItemImage, validate(validateItem), updateItem);
router.delete('/:id', requireAuth, loadOwnedItem, deleteItem);
router.patch('/:id/close', requireAuth, loadOwnedItem, closeItem);
router.patch('/:id/recovered', requireAuth, loadOwnedItem, markLostItemRecovered);

router.post('/:id/claims', requireAuth, validate(validateClaim), createClaim);
router.get('/:id/claims', requireAuth, listClaimsForItem);

export default router;
