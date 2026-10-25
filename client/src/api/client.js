import axios from 'axios';

// All requests go to /api, which Vite proxies to the Express server in development.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the HTTP-only login cookie
});

/** Pulls a friendly message (and per-field errors) out of an Axios error. */
export function getErrorInfo(error) {
  if (!error?.response) {
    return { status: 0, message: 'Cannot reach the server. Check your connection and try again.', errors: {} };
  }
  const { status, data } = error.response;
  return {
    status,
    message: data?.message || 'Something went wrong. Please try again.',
    errors: data?.errors || {},
  };
}
