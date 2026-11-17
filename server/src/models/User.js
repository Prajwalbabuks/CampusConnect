import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxLength: [70, 'Name cannot exceed 70 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Incremented when role or account status changes to revoke existing JWTs.
    sessionVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    usn: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // Allows null/omitted for faculty/admin while maintaining unique student USNs
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true,
    },
    branchCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'CSE',
    },
    year: {
      type: String,
      trim: true,
      default: '2nd Year',
    },
    semester: {
      type: String,
      trim: true,
      default: '4th Semester',
    },
    section: {
      type: String,
      trim: true,
      default: 'Section A',
    },
    batch: {
      type: String,
      trim: true,
      default: '2024',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    institution: {
      type: String,
      default: 'National Institute of Engineering',
    },
  },
  {
    timestamps: true,
  }
);

// At most one account may carry the protected Seed Admin designation.
UserSchema.index(
  { isSuperAdmin: 1 },
  {
    unique: true,
    partialFilterExpression: { isSuperAdmin: true },
    name: 'one_seed_admin_only',
  }
);

// Hash password before saving document
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
