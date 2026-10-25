// Every successful response has the shape { success: true, data, message? }.
export function sendSuccess(res, data, { status = 200, message } = {}) {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(status).json(body);
}
