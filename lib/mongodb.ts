import mongoose, { Connection } from 'mongoose';

/**
 * Cached connection object to prevent multiple connections during development.
 * This is stored in the global scope to persist across hot module reloads in Next.js.
 */
interface GlobalWithMongo {
  mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

declare const global: GlobalWithMongo;

// Initialize the global mongoose cache if it doesn't exist
if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connects to MongoDB using Mongoose with proper error handling and connection caching.
 * Prevents multiple connections during development and hot module reloads.
 *
 * @returns Promise<Connection> - The active Mongoose connection
 * @throws Error if MONGODB_URI environment variable is not defined
 */
async function connectToDatabase(): Promise<Connection> {
  // Return cached connection if already established
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // Return the promise if a connection is already being established
  if (global.mongoose.promise) {
    const conn = await global.mongoose.promise;
    return conn;
  }

  // Validate that MongoDB URI is configured
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI environment variable is not defined. Please add it to your .env.local file.'
    );
  }

  // Create a new connection promise
  const promise = mongoose
    .connect(mongoUri, {
      // These options prevent deprecation warnings and provide better defaults
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then((mongoose) => {
      // Return the active connection
      return mongoose.connection;
    })
    .catch((error) => {
      // Clear the promise on error to allow retry on next connection attempt
      global.mongoose.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    });

  global.mongoose.promise = promise;

  // Cache the resolved connection
  const conn = await promise;
  global.mongoose.conn = conn;

  return conn;
}

/**
 * Disconnects from MongoDB and clears the cached connection.
 * Useful for cleanup in tests or when shutting down the application.
 *
 * @returns Promise<void>
 */
async function disconnectFromDatabase(): Promise<void> {
  if (global.mongoose.conn) {
    await mongoose.disconnect();
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }
}

// Export functions for database operations
export { connectToDatabase, disconnectFromDatabase };
