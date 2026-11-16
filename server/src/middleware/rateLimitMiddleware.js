import rateLimit from 'express-rate-limit';

// Brute-force protection for credential endpoints. Fixed per-IP window.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many attempts. Please wait 15 minutes and try again.',
  },
});

// Generous backstop for ordinary API traffic (prevents unbounded abuse of the
// public catalog/search endpoints).
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
});
