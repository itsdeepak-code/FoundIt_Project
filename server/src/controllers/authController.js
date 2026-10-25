import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';
import { clearAuthCookie, setAuthCookie } from '../utils/token.js';

const SALT_ROUNDS = 10;

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw AppError.conflict('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  // The unique index on email still protects us if two sign-ups race.
  const user = await User.create({ name, email, passwordHash });

  setAuthCookie(res, user._id);
  sendSuccess(res, { user: user.toProfile() }, { status: 201, message: 'Welcome to FoundIt!' });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  // Same message for "no such user" and "wrong password" so emails can't be probed.
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw AppError.unauthorized('Incorrect email or password.');

  setAuthCookie(res, user._id);
  sendSuccess(res, { user: user.toProfile() }, { message: `Welcome back, ${user.name}!` });
}

export function logout(req, res) {
  clearAuthCookie(res);
  sendSuccess(res, null, { message: 'You have been logged out.' });
}

export function me(req, res) {
  sendSuccess(res, { user: req.user.toProfile() });
}
