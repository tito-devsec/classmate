/** Error carrying an HTTP status code, thrown by routes and rendered by the error handler. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new ApiError(400, message, details);
export const unauthorized = (message = "Unauthorized") => new ApiError(401, message);
export const notFound = (message = "Not found") => new ApiError(404, message);

/** Wraps an async route handler so rejected promises reach the error middleware. */
export const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : 500;
  if (status >= 500) console.error(`[api] ${req.method} ${req.originalUrl}`, err);
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
