import { checkLength, clean, collectErrors } from './helpers.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkEmail(email) {
  if (!email) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email) || email.length > 120) return 'Enter a valid email address.';
  return null;
}

export function validateRegister(body) {
  const value = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };

  let passwordError = null;
  if (!value.password) passwordError = 'Password is required.';
  else if (value.password.length < 8) passwordError = 'Password must be at least 8 characters.';
  // bcrypt only uses the first 72 bytes of a password.
  else if (value.password.length > 72) passwordError = 'Password must be at most 72 characters.';
  else if (!/[a-zA-Z]/.test(value.password) || !/\d/.test(value.password)) {
    passwordError = 'Password must contain at least one letter and one number.';
  }

  const errors = collectErrors([
    ['name', checkLength(value.name, 'Name', 2, 60)],
    ['email', checkEmail(value.email)],
    ['password', passwordError],
  ]);
  return { value, errors };
}

export function validateLogin(body) {
  const value = {
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = collectErrors([
    ['email', checkEmail(value.email)],
    ['password', value.password ? null : 'Password is required.'],
  ]);
  return { value, errors };
}
