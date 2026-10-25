/**
 * An error with an HTTP status code that the error handler turns into a JSON response.
 * `errors` is an optional { field: message } map for form validation problems.
 */
export class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new AppError(400, message, errors);
  }

  static unauthorized(message = 'Please log in to continue.') {
    return new AppError(401, message);
  }

  static forbidden(message = 'You are not allowed to do that.') {
    return new AppError(403, message);
  }

  static notFound(message = 'Not found.') {
    return new AppError(404, message);
  }

  static conflict(message) {
    return new AppError(409, message);
  }
}
