import User from '../models/User.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/token.js';
import { parseStudentEmail } from '../utils/studentParser.js';
import { canonicalBranchCode, branchName } from '../utils/branches.js';
import { registerSchema, loginSchema, firstIssue } from '../validators/schemas.js';

// @desc    Register a new student with complete academic profile
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: firstIssue(parsed),
      });
    }
    const data = parsed.data;

    // 1. Check if user with this email already exists
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // 2. Check if student with this USN already exists
    const existingUsn = await User.findOne({ usn: data.usn });
    if (existingUsn) {
      return res.status(409).json({
        success: false,
        message: `A student account with USN ${data.usn} is already registered.`,
      });
    }

    // Optional institutional fallback if student didn't pick branch
    const studentData = parseStudentEmail(data.email);

    // 3. Strictly enforce student role on public self-registration
    const branchCode = canonicalBranchCode(data.branchCode || studentData.departmentCode) || 'CSE';
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'student',
      // No fallback USN: the schema makes it mandatory and pre-checked above, so
      // unrelated accounts can never collide on the sparse-unique USN index.
      usn: data.usn,
      department: data.department || branchName(branchCode) || 'Computer Science & Engineering',
      branchCode,
      year: data.year || '2nd Year',
      semester: data.semester || '4th Semester',
      section: data.section
        ? data.section.startsWith('Section')
          ? data.section
          : `Section ${data.section}`
        : studentData.section || 'Section A',
      batch: data.batch || studentData.batch || '2024',
      phone: data.phone || '',
      institution: 'National Institute of Engineering',
    });

    return sendTokenResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: firstIssue(parsed),
      });
    }
    const { email, password } = parsed.data;

    // Find user and explicitly include password hash for bcrypt check
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with this email.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
      });
    }

    return sendTokenResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
}

// @desc    Log out user & clear cookie
// @route   POST /api/auth/logout
// @access  Authenticated
export async function logout(req, res) {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Institutional session terminated successfully',
  });
}

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Authenticated
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}
