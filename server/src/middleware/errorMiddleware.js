export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    // Keep the raw value out of the response — it is client-controlled input
    message = 'Resource not found: the identifier is not valid';
  }

  // Handle Mongoose Duplicate Key Error (Code 11000) — field-aware messages,
  // instead of the old catch-all that produced nonsense like
  // "An account with this ticketCode already exists."
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue || {});
    const field = keys[0] || 'field';

    if (keys.includes('user') && keys.includes('event')) {
      message = 'You have already registered for this event. One seat reservation per student USN.';
    } else if (field === 'ticketCode') {
      message = 'Ticket code conflict while issuing your pass. Please retry the registration.';
    } else if (field === 'usn') {
      message = 'A student account with this USN is already registered.';
    } else if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else {
      message = `Duplicate value for "${field}".`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
