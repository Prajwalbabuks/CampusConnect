import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Shared request-validation schemas (zod).
// zod object schemas strip unknown keys by default, so passing parsed.data
// into Mongoose also blocks mass-assignment of unlisted fields.
// ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string({ message: 'Please provide your full name' })
    .trim()
    .min(2, 'Please provide your full name')
    .max(70, 'Name cannot exceed 70 characters'),
  email: z
    .string({ message: 'Please provide an email address' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(254, 'Email address is too long'),
  password: z
    .string({ message: 'Please provide a password' })
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password cannot exceed 72 characters'),
  // USN is mandatory for students and format-checked so unique-index collisions
  // (previously caused by random/hardcoded fallback USNs) cannot occur.
  usn: z
    .string({ message: 'Please provide your University Seat Number (USN)' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,12}$/, 'Please provide a valid University Seat Number (e.g. 4NI23CS045)'),
  department: z.string().trim().max(80).optional(),
  branchCode: z.string().trim().max(10).optional(),
  year: z.string().trim().max(30).optional(),
  semester: z.string().trim().max(30).optional(),
  section: z.string().trim().max(30).optional(),
  batch: z.string().trim().max(10).optional(),
  phone: z.string().trim().max(15).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Please provide your email address' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string({ message: 'Please provide your password' })
    .min(1, 'Please provide your password'),
});

export const superAdminUsersQuerySchema = z.object({
  search: z.string().trim().max(100, 'Search text cannot exceed 100 characters').optional(),
  role: z.enum(['student', 'admin', 'super_admin']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'A valid user ID is required');

export const createEventSchema = z.object({
  title: z
    .string({ message: 'Please provide an event title' })
    .trim()
    .min(3, 'Event title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({ message: 'Please provide an event description' })
    .trim()
    .min(10, 'Please provide a meaningful event description (min 10 characters)')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum(['Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar'], {
    message: 'Please choose a valid collegiate event category',
  }),
  date: z.coerce.date({ message: 'Please provide a valid event date' }),
  time: z.string().trim().max(20).optional(),
  venue: z
    .string({ message: 'Please provide a campus venue' })
    .trim()
    .min(2, 'Please provide a campus venue')
    .max(120, 'Venue cannot exceed 120 characters'),
  capacity: z.coerce
    .number({ message: 'Please define venue capacity' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1 seat')
    .max(100000, 'Capacity is unrealistically large'),
  department: z.string().trim().max(80).optional(),
  departmentCode: z.string().trim().max(10).optional(),
  status: z.enum(['upcoming', 'completed', 'cancelled']).optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Returns the first human-readable validation message from a safeParse result.
export function firstIssue(parsed) {
  const issue = parsed.error?.issues?.[0];
  return issue ? issue.message : 'Invalid input';
}
