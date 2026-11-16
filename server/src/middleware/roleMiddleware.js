export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Institutional Administrative privileges required',
    });
  }
  next();
}

export function requireStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Student seat reservation privileges required',
    });
  }
  next();
}
