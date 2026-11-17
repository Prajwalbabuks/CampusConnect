export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Institutional Administrative privileges required',
    });
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin' || req.user.isSuperAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Seed Admin authorization required',
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
