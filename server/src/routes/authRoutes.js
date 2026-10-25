import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateLogin, validateRegister } from '../validators/authValidators.js';

const router = Router();

router.post('/register', validate(validateRegister), register);
router.post('/login', validate(validateLogin), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
