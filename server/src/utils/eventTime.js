// CampusConnect events are scheduled in Mysuru, India (Asia/Kolkata).
// Store calendar dates independently from the time input and use the campus
// timezone when deciding whether registration or cancellation is still open.
export function eventStartDateTime(event) {
  const date = new Date(event?.date);
  if (Number.isNaN(date.getTime())) return null;

  const datePart = date.toISOString().slice(0, 10);
  const match = String(event?.time || '12:00 AM').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return new Date(`${datePart}T23:59:59+05:30`);

  let hours = Number(match[1]);
  if (match[3]) {
    hours %= 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
  }
  const hourPart = String(hours).padStart(2, '0');
  return new Date(`${datePart}T${hourPart}:${match[2]}:00+05:30`);
}
