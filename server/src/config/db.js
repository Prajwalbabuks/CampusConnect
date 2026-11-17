import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error(
      '[Config] MONGO_URI is not set. Copy server/.env.example to server/.env and add your MongoDB connection string.'
    );
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB. Verify MONGO_URI in server/.env.');
    console.error(`[Database Guidance] If using MongoDB Atlas, replace MONGO_URI in 'server/.env' with your Atlas connection string.`);
    console.error(`[Database Guidance] Error type: ${error.name || 'ConnectionError'}`);
    // Fail fast: the API is useless without its database, so surface the failure at
    // startup instead of serving a broken server that 500s on every request.
    throw error;
  }
}
