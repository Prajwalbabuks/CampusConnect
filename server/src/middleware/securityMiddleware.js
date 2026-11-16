export function securityHeaders(req, res, next) {
  // Minimal hardening for a JSON API. (helmet covers these plus more if the
  // dependency is ever preferred over the explicit list below.)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.removeHeader('X-Powered-By');
  next();
}
