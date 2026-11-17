import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { canonicalBranchCode } from '../utils/branches.js';
import { createEventSchema, updateEventSchema, firstIssue } from '../validators/schemas.js';

// User input must be escaped before being compiled into a RegExp, otherwise
// metacharacters like (a+)+$ enable catastrophic backtracking (ReDoS).
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Normalize "HH:MM" (24h from <input type="time">) into the canonical "H:MM AM/PM"
// format used by the seed data, so every stored event has one consistent shape.
function normalizeTime(value) {
  if (!value) return '10:00 AM';
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return value;
  const minutes = match[2];
  if (match[3]) {
    return `${parseInt(match[1], 10)}:${minutes} ${match[3].toUpperCase()}`;
  }
  let hours = parseInt(match[1], 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

// @desc    Get all events with search, category & department filters
// @route   GET /api/events
// @access  Public
export async function getEvents(req, res, next) {
  try {
    const { search, category, dept } = req.query;

    // $and keeps independent filter groups from clobbering each other (the old
    // single $or was overwritten when both dept and search were provided).
    const conditions = [];

    if (category && category !== 'All') {
      conditions.push({ category });
    }

    if (dept && dept !== 'All') {
      const deptRegex = new RegExp(escapeRegex(dept), 'i');
      conditions.push({
        $or: [{ department: deptRegex }, { departmentCode: deptRegex }],
      });
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      conditions.push({
        $or: [{ title: searchRegex }, { description: searchRegex }, { venue: searchRegex }],
      });
    }

    const filter = conditions.length ? { $and: conditions } : {};

    // Pagination: fetches are bounded instead of returning the entire collection
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 100));

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Campus event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Create new event listing
// @route   POST /api/events
// @access  Admin Only
export async function createEvent(req, res, next) {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: firstIssue(parsed),
      });
    }
    const data = parsed.data;

    const event = await Event.create({
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date,
      time: normalizeTime(data.time),
      venue: data.venue,
      capacity: data.capacity,
      department: data.department || 'Computer Science & Engineering',
      departmentCode: canonicalBranchCode(data.departmentCode) || 'CSE',
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Event listing published successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Admin Only
export async function updateEvent(req, res, next) {
  try {
    const existing = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Campus event not found',
      });
    }

    // zod strips unknown keys, so registeredCount/createdBy/etc. sent by a
    // client are dropped instead of being written straight to the database
    // (the old findByIdAndUpdate(req.body) allowed full mass-assignment).
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: firstIssue(parsed),
      });
    }
    const updates = parsed.data;

    // Capacity can never drop below the seats that are already booked
    if (updates.capacity !== undefined) {
      const booked = await Registration.countDocuments({ event: existing._id });
      if (updates.capacity < booked) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be lower than the ${booked} seats already booked for this event`,
        });
      }
    }

    if (updates.time !== undefined) {
      updates.time = normalizeTime(updates.time);
    }
    if (updates.departmentCode !== undefined) {
      updates.departmentCode = canonicalBranchCode(updates.departmentCode);
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Event specifications updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Delete event & cascade remove its registrations
// @route   DELETE /api/events/:id
// @access  Admin Only
export async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Campus event not found',
      });
    }

    // Cascade delete any student registrations for this event
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Event and associated registrations successfully removed',
    });
  } catch (error) {
    next(error);
  }
}
