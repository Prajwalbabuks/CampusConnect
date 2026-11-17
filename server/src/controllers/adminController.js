import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { eventStartDateTime } from '../utils/eventTime.js';

// @desc    Get events owned by the authenticated administrator
// @route   GET /api/admin/events
// @access  Admin Only
export async function getMyEvents(req, res, next) {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ date: 1 });
    return res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
}

// @desc    Get aggregate metrics for Administrator Dashboard
// @route   GET /api/admin/dashboard
// @access  Admin Only
export async function getDashboardStats(req, res, next) {
  try {
    const events = await Event.find({ createdBy: req.user._id }).select('_id capacity registeredCount date time');
    const eventIds = events.map((event) => event._id);
    const totalEvents = events.length;
    const upcomingEvents = events.filter((event) => eventStartDateTime(event) >= new Date()).length;
    const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });

    // Calculate capacity metrics only across this administrator's events.
    let totalCapacity = 0;
    let totalBooked = 0;

    events.forEach((ev) => {
      totalCapacity += ev.capacity || 0;
      totalBooked += ev.registeredCount || 0;
    });

    const averageFillRate = totalCapacity > 0 ? `${Math.round((totalBooked / totalCapacity) * 100)}%` : '0%';

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        totalRegistrations,
        averageFillRate,
        totalCapacity,
        totalBooked,
      },
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Get complete participant & attendance roster for an event
// @route   GET /api/admin/events/:id/participants
// @access  Admin Only
export async function getEventParticipants(req, res, next) {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Campus event not found',
      });
    }

    const registrations = await Registration.find({ event: event._id })
      .populate('user', 'name email usn section department batch')
      .sort({ registeredAt: 1 });

    const participants = registrations.map((r, idx) => ({
      id: r._id,
      ticketCode: r.ticketCode,
      name: r.user?.name || 'Enrolled Student',
      email: r.user?.email || 'N/A',
      usn: r.user?.usn || 'N/A',
      section: r.user?.section || 'N/A',
      branch: r.user?.department || 'CSE',
      status: r.status,
      checkedInAt: r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      registeredAt: r.registeredAt,
    }));

    const checkedInCount = participants.filter((p) => p.status === 'Checked In').length;

    return res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        time: event.time,
        venue: event.venue,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      count: participants.length,
      checkedInCount,
      participants,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Toggle physical attendance check-in for an attendee
// @route   PATCH /api/admin/registrations/:registrationId/checkin
// @access  Admin Only
export async function toggleAttendanceCheckIn(req, res, next) {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('user', 'name usn')
      .populate('event', 'createdBy');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration entry not found',
      });
    }

    if (!registration.event || String(registration.event.createdBy) !== String(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: 'Registration entry not found',
      });
    }

    const isPresent = registration.status === 'Checked In';
    registration.status = isPresent ? 'Confirmed' : 'Checked In';
    registration.checkedInAt = isPresent ? null : new Date();

    await registration.save();

    return res.status(200).json({
      success: true,
      message: `Attendance updated: ${registration.user?.name} (${registration.user?.usn}) marked as ${registration.status}`,
      data: {
        id: registration._id,
        status: registration.status,
        checkedInAt: registration.checkedInAt ? new Date(registration.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      },
    });
  } catch (error) {
    next(error);
  }
}
