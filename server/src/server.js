import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { securityHeaders } from './middleware/securityMiddleware.js';
import { authRateLimiter, apiRateLimiter } from './middleware/rateLimitMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Fail fast on missing critical configuration (a missing secret previously made
// every register/login request 500 at runtime with no explanation).
if (!process.env.JWT_SECRET) {
  console.error('[Config] JWT_SECRET is not set. Copy server/.env.example to server/.env and generate a secret with:');
  console.error('[Config]   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// Middleware Pipeline
app.use(securityHeaders);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    institution: 'National Institute of Engineering, Mysuru',
    service: 'CampusConnect REST API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
// Rate limiting: strict on credential endpoints, generous backstop on the rest.
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/events', apiRateLimiter, eventRoutes);
app.use('/api/registrations', apiRateLimiter, registrationRoutes);
app.use('/api/admin', apiRateLimiter, adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server (only after the database is reachable — see config/db.js)
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[CampusConnect API] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[CORS Policy] Whitelisted client origin: ${CLIENT_URL}`);
    });
  } catch {
    console.error('[CampusConnect API] Startup aborted: could not connect to the database.');
    process.exit(1);
  }
}

// Process-level resilience
process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err);
  process.exit(1);
});

// Graceful shutdown: close MongoDB connections before exiting
async function shutdown(signal) {
  console.log(`[CampusConnect API] ${signal} received — shutting down...`);
  try {
    await mongoose.connection.close();
  } catch {
    // Connection may already be closed
  }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
