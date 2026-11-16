// Shared event display helpers — these were previously duplicated (with drift)
// across six different components.

export function getCategoryColor(cat) {
  switch (cat?.toLowerCase()) {
    case 'technical': return 'blue';
    case 'workshop': return 'violet';
    case 'cultural': return 'amber';
    case 'sports': return 'emerald';
    case 'seminar': return 'cyan';
    default: return 'amber';
  }
}

export function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Date TBA';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatEventDateLong(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Date TBA';
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Renders the stored `time` field ("10:00 AM" or "10:00"), falling back to the
// date-derived time. NaN/undefined inputs are always guarded.
export function formatEventTime(event) {
  const raw = event?.time;
  if (raw) {
    const m = String(raw).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
    if (m) {
      const minutes = m[2];
      let hours = parseInt(m[1], 10);
      const suffix = m[3] ? m[3].toUpperCase() : (hours >= 12 ? 'PM' : 'AM');
      if (!m[3]) hours = hours % 12 || 12;
      return `${hours}:${minutes} ${suffix}`;
    }
    return raw;
  }
  const d = new Date(event?.date);
  if (isNaN(d.getTime())) return 'Time TBA';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Single capacity/seat calculation used by every card, gauge and detail panel.
export function getSeatsInfo(event) {
  const capacity = Number(event?.capacity) || 0;
  const registered = Math.max(0, Number(event?.registeredCount) || 0);
  const seatsLeft = Math.max(0, capacity - registered);
  const fillPercentage = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const isFull = capacity > 0 && seatsLeft === 0;
  return { capacity, registered, seatsLeft, fillPercentage, isFull };
}

// <input type="date"> yields "YYYY-MM-DD". Parsing that as-is produces UTC
// midnight, which displayed as the previous day for users ahead of UTC (IST).
// Anchoring to local noon keeps the calendar date stable in every timezone.
export function toLocalNoonISO(dateStr) {
  if (!dateStr) return dateStr;
  const d = new Date(`${dateStr}T12:00:00`);
  return isNaN(d.getTime()) ? dateStr : d.toISOString();
}

// ISO date string → value for <input type="date">
export function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).slice(0, 10);
}
