import jwt from 'jsonwebtoken';

export function sendTokenResponse(res, user, statusCode = 200) {
  // Minimal payload: protect() re-fetches the user from the database on every
  // request, so embedding name/email/usn in the token only adds stale PII.
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      usn: user.usn || '',
      department: user.department || 'Computer Science & Engineering',
      branchCode: user.branchCode || 'CSE',
      year: user.year || '2nd Year',
      semester: user.semester || '4th Semester',
      section: user.section || 'Section A',
      batch: user.batch || '2024',
      phone: user.phone || '',
      institution: user.institution || 'National Institute of Engineering',
    },
  });
}

export function clearTokenCookie(res) {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });
}
