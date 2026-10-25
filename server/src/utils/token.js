import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'foundit_token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

// HTTP-only so JavaScript in the browser can never read the token.
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}

export function setAuthCookie(res, userId) {
  res.cookie(AUTH_COOKIE, signToken(userId), cookieOptions());
}

export function clearAuthCookie(res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
}
