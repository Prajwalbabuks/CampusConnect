import crypto from 'crypto';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

const TICKET_RETRY_LIMIT = 5;

// @desc    Register logged-in student for an event (Atomic concurrency check)
// @route   POST /api/registrations/:eventId
// @access  Student Only
export async function registerForEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'The requested campus event does not exist',
      });
    }

    // 1. Refuse registration for cancelled or past events
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed: This event has been cancelled',
      });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed: This event has already taken place',
      });
    }

    // 2. Fast path: reject students who already hold a reservation
    const existingReg = await Registration.findOne({ user: userId, event: eventId });
    if (existingReg) {
      return res.status(409).json({
        success: false,
        message: 'You already hold a confirmed seat reservation for this event (Atomic Lock: 1 seat per USN)',
        data: existingReg,
      });
    }

    // 3. Atomic capacity gate — replaces the old check-then-act
    // countDocuments() race that allowed two concurrent requests to overbook.
    // The counter is only incremented if registeredCount < capacity, in a single
    // database operation. $ifNull covers legacy documents missing the counter.
    const gate = await Event.updateOne(
      {
        _id: eventId,
        status: { $ne: 'cancelled' },
        $expr: { $lt: [{ $ifNull: ['$registeredCount', 0] }, '$capacity'] },
      },
      { $inc: { registeredCount: 1 } }
    );

    if (gate.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hall allocation full: All available seats for this event are currently booked',
      });
    }

    // 4. Create the registration with a collision-resistant ticket code.
    // crypto.randomBytes gives a ~4.3-billion-code space (the old 4-digit
    // Math.random space was only 9,000 and collided on the unique index,
    // surfacing as nonsense 409s). The compound (user, event) unique index
    // still backstops duplicate registrations.
    try {
      let registration = null;
      let duplicateReservation = false;
      let lastError = null;

      for (let attempt = 0; attempt < TICKET_RETRY_LIMIT && !registration; attempt += 1) {
        try {
          registration = await Registration.create({
            user: userId,
            event: eventId,
            ticketCode: generateTicketCode(event.category),
            status: 'Confirmed',
          });
        } catch (createErr) {
          if (createErr?.code === 11000) {
            const keys = Object.keys(createErr.keyPattern || {});
            if (keys.includes('user') && keys.includes('event')) {
              // Lost a race against the unique (user, event) index
              duplicateReservation = true;
              break;
            }
            if (keys.includes('ticketCode')) {
              lastError = createErr;
              continue; // improbable collision — mint a fresh code and retry
            }
          }
          throw createErr;
        }
      }

      if (duplicateReservation) {
        await releaseSeat(eventId);
        return res.status(409).json({
          success: false,
          message: 'You already hold a confirmed seat reservation for this event (Atomic Lock: 1 seat per USN)',
        });
      }

      if (!registration) {
        // Exhausted ticket-code retries — should be practically impossible
        await releaseSeat(eventId);
        throw lastError || new Error('Unable to mint a unique ticket code');
      }

      // Populate event details for immediate frontend consumption
      const populated = await Registration.findById(registration._id).populate('event');

      return res.status(201).json({
        success: true,
        message: 'Seat confirmed! Your digital admission pass has been issued',
        data: populated,
      });
    } catch (createError) {
      // Roll back the seat hold so registeredCount never drifts from reality
      await releaseSeat(eventId);
      throw createError;
    }
  } catch (error) {
    next(error);
  }
}

// @desc    Get all registrations for current student
// @route   GET /api/registrations/my
// @access  Student Only
export async function getMyRegistrations(req, res, next) {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event')
      .sort({ registeredAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Cancel an existing seat reservation & release seat to peers
// @route   DELETE /api/registrations/:eventId
// @access  Student Only
export async function cancelRegistration(req, res, next) {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({ user: userId, event: eventId });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No active reservation found for this event under your account',
      });
    }

    // Attendance history for completed events is final — no retroactive cancels
    const event = await Event.findById(eventId);
    if (event && new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This event has already taken place; its attendance record can no longer be changed',
      });
    }

    await registration.deleteOne();

    // Guarded decrement: only ever decrements while the counter is positive, so
    // the old unconditional $inc can no longer drive it negative.
    await releaseSeat(eventId);

    return res.status(200).json({
      success: true,
      message: 'Seat reservation released. Seat returned to open collegiate pool',
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function generateTicketCode(category) {
  const prefix = category ? category.charAt(0).toUpperCase() : 'E';
  // CSPRNG — 4 bytes of hex (≈4.3 billion combinations per category prefix)
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `NIE-2026-${prefix}${random}`;
}

// Guarded counter release: never drives registeredCount below zero.
async function releaseSeat(eventId) {
  await Event.updateOne(
    { _id: eventId, registeredCount: { $gt: 0 } },
    { $inc: { registeredCount: -1 } }
  );
}
