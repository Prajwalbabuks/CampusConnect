import mongoose from 'mongoose';
import User from '../models/User.js';
import {
  firstIssue,
  objectIdSchema,
  superAdminUsersQuerySchema,
} from '../validators/schemas.js';

function safeUser(user, includeDetails = false) {
  const result = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin === true,
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
  };

  if (includeDetails) {
    Object.assign(result, {
      usn: user.usn || '',
      department: user.department || '',
      branchCode: user.branchCode || '',
      year: user.year || '',
      semester: user.semester || '',
      section: user.section || '',
      batch: user.batch || '',
      phone: user.phone || '',
      institution: user.institution || '',
      updatedAt: user.updatedAt,
    });
  }

  return result;
}

function userFilter({ search, role, status }) {
  const filter = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: new RegExp(escaped, 'i') }, { email: new RegExp(escaped, 'i') }];
  }
  if (role === 'student') filter.role = 'student';
  if (role === 'admin') {
    filter.role = 'admin';
    filter.isSuperAdmin = { $ne: true };
  }
  if (role === 'super_admin') filter.isSuperAdmin = true;
  if (status === 'active') filter.isActive = { $ne: false };
  if (status === 'disabled') filter.isActive = false;
  return filter;
}

export async function listUsers(req, res, next) {
  try {
    const parsed = superAdminUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed) });
    }

    const { page, limit } = parsed.data;
    const filter = userFilter(parsed.data);
    const [users, total, totalUsers, students, admins, activeUsers, disabledUsers] = await Promise.all([
      User.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin', isSuperAdmin: { $ne: true } }),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isActive: false }),
    ]);

    return res.status(200).json({
      success: true,
      users: users.map((user) => safeUser(user)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { totalUsers, students, admins, activeUsers, disabledUsers },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUserDetails(req, res, next) {
  try {
    const parsedId = objectIdSchema.safeParse(req.params.id);
    if (!parsedId.success || !mongoose.isValidObjectId(parsedId.data)) {
      return res.status(400).json({ success: false, message: 'A valid user ID is required.' });
    }
    const user = await User.findById(parsedId.data).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user: safeUser(user, true) });
  } catch (error) {
    return next(error);
  }
}

async function changeOrdinaryUser(req, res, next, { set, expected, successMessage }) {
  try {
    const parsedId = objectIdSchema.safeParse(req.params.id);
    if (!parsedId.success || !mongoose.isValidObjectId(parsedId.data)) {
      return res.status(400).json({ success: false, message: 'A valid user ID is required.' });
    }

    if (String(req.user._id) === parsedId.data) {
      return res.status(409).json({ success: false, message: 'You cannot change your own Seed Admin account.' });
    }

    const filter = { _id: parsedId.data, isSuperAdmin: { $ne: true }, ...expected };
    const user = await User.findOneAndUpdate(
      filter,
      { $set: set, $inc: { sessionVersion: 1 } },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      const existing = await User.findById(parsedId.data).select('_id isSuperAdmin').lean();
      if (!existing) return res.status(404).json({ success: false, message: 'User not found.' });
      if (existing.isSuperAdmin) {
        return res.status(409).json({ success: false, message: 'The Seed Admin account is protected.' });
      }
      return res.status(409).json({ success: false, message: 'The account no longer matches this action.' });
    }

    return res.status(200).json({ success: true, message: successMessage, user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function promoteUser(req, res, next) {
  return changeOrdinaryUser(req, res, next, {
    set: { role: 'admin' },
    expected: { role: 'student' },
    successMessage: 'Student promoted to admin.',
  });
}

export function demoteUser(req, res, next) {
  return changeOrdinaryUser(req, res, next, {
    set: { role: 'student' },
    expected: { role: 'admin' },
    successMessage: 'Admin demoted to student.',
  });
}

export function disableUser(req, res, next) {
  return changeOrdinaryUser(req, res, next, {
    set: { isActive: false },
    expected: { isActive: { $ne: false } },
    successMessage: 'Account disabled.',
  });
}

export function enableUser(req, res, next) {
  return changeOrdinaryUser(req, res, next, {
    set: { isActive: true },
    expected: { isActive: false },
    successMessage: 'Account re-enabled.',
  });
}
