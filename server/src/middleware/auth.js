import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE, verifyToken } from '../utils/token.js';

async function getUserFromRequest(req) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return await User.findById(payload.sub);
  } catch {
    // Expired / tampered token - treat as logged out.
    return null;
  }
}

// Blocks the request with 401 unless a valid login cookie is present.
export async function requireAuth(req, res, next) {
  const user = await getUserFromRequest(req);
  if (!user) throw AppError.unauthorized();
  req.user = user;
  next();
}

// Attaches req.user when logged in, but lets anonymous visitors through.
export async function optionalAuth(req, res, next) {
  req.user = await getUserFromRequest(req);
  next();
}
