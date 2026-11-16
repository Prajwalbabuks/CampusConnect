import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Registration requires an associated student user'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Registration requires a target event'],
    },
    ticketCode: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Checked In'],
      default: 'Confirmed',
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Strictly prevents duplicate registrations per student per event
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model('Registration', RegistrationSchema);
