import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { removeUpload } from './upload.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Converts any thrown error into { success: false, message, errors? }.
export function errorHandler(err, req, res, next) {
  // If a request failed after an image was saved, don't leave the file behind.
  if (req.file) removeUpload(req.file.filename);

  // AppError uses statusCode; Express / body-parser / static errors use status.
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong.';
  let errors = err.errors;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Please fix the highlighted fields.';
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    // e.g. /api/items/not-a-real-id
    status = 404;
    message = 'The requested record was not found.';
    errors = undefined;
  } else if (err.code === 11000) {
    status = 409;
    message = err.keyPattern?.email
      ? 'An account with this email already exists.'
      : 'This action conflicts with an existing record.';
    errors = err.keyPattern?.email ? { email: message } : undefined;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body.';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Something went wrong on our side. Please try again.';
  }

  const body = { success: false, message };
  if (errors && typeof errors === 'object') body.errors = errors;
  res.status(status).json(body);
}
