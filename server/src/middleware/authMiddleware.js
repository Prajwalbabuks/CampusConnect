import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  let token;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Please sign in with your institutional credentials',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password +sessionVersion');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this session no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account is disabled. Contact your institution administrator.',
      });
    }

    // Tokens issued before role/status changes stop authorizing protected APIs.
    // Tokens created before sessionVersion existed are treated as version zero.
    if ((decoded.sessionVersion ?? 0) !== (user.sessionVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: 'Your access has changed. Please sign in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid: Please sign in again',
    });
  }
}
