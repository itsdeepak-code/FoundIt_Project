import { AppError } from '../utils/AppError.js';

/**
 * Runs a validator function against req.body.
 * A validator returns { value, errors } - `value` is the cleaned input and
 * `errors` is a { field: message } map. Any error stops the request with 400.
 */
export function validate(validator) {
  return (req, res, next) => {
    const { value, errors } = validator(req.body ?? {});
    if (Object.keys(errors).length > 0) {
      throw AppError.badRequest('Please fix the highlighted fields.', errors);
    }
    req.body = value;
    next();
  };
}
