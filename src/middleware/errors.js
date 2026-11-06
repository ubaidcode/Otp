export function errors(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status =
    error.status ||
    (error.code === 11000 || error.name === "VersionError"
      ? 409
      : ["CastError", "ValidationError"].includes(error.name)
        ? 422
        : error.name === "MulterError"
          ? 422
          : 500);
  // Never return stack traces, database queries, provider errors, passwords or tokens.
  res.status(status).json({
    error:
      error instanceof SyntaxError
        ? "Invalid JSON body"
        : status === 500
          ? "Internal server error"
          : error.status
            ? error.message
            : status === 409
              ? "Conflicting change or duplicate record"
              : "Invalid request",
  });
}
export function rateLimit({ max = 30, windowMs = 60000 } = {}) {
  const counts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of counts) if (value.until < now) counts.delete(key);
    const key = req.ip;
    const entry = counts.get(key) || { count: 0, until: now + windowMs };
    entry.count++;
    counts.set(key, entry);
    if (entry.count > max) return res.status(429).json({ error: "Too many requests; retry later" });
    next();
  };
}
