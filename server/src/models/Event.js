import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxLength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify an event category'],
      enum: {
        values: ['Technical', 'Workshop', 'Cultural', 'Sports', 'Seminar'],
        message: '{VALUE} is not a valid collegiate event category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Please specify the event date'],
    },
    time: {
      type: String,
      default: '10:00 AM',
    },
    venue: {
      type: String,
      required: [true, 'Please provide a campus venue'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please define venue capacity'],
      min: [1, 'Capacity must be at least 1 seat'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    departmentCode: {
      type: String,
      default: 'CSE',
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field to calculate available seats
EventSchema.virtual('seatsLeft').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

// Virtual field to calculate fill percentage
EventSchema.virtual('fillPercentage').get(function () {
  if (!this.capacity || this.capacity === 0) return 0;
  return Math.min(100, Math.round((this.registeredCount / this.capacity) * 100));
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

export default mongoose.model('Event', EventSchema);
