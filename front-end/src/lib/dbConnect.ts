import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // This error will be thrown when the module is loaded if MONGODB_URI is not set at all.
  // This is good for catching issues during build or server startup.
  console.error("CRITICAL: MONGODB_URI environment variable is not defined.");
  throw new Error(
    'Please define the MONGODB_URI environment variable. This is a server configuration issue.'
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined; // Changed variable name for clarity
}

let cached: MongooseCache;

if (process.env.NODE_ENV === 'production') {
  cached = { conn: null, promise: null };
} else {
  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }
  cached = global.mongooseCache;
}


async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log('Using cached MongoDB connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection promise.');
    const opts = {
      bufferCommands: false,
      // Consider adding serverSelectionTimeoutMS if connections are timing out
      // serverSelectionTimeoutMS: 5000, // e.g., 5 seconds
    };

    // Log the URI being used (excluding credentials for security in production logs if possible)
    // For debugging, you might temporarily log the full URI, but be careful.
    const uriToLog = MONGODB_URI.replace(/\/\/(.*:.*)@/, '//<credentials>@');
    console.log(`Attempting to connect to MongoDB with URI: ${uriToLog}`);


    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('MongoDB connection promise resolved successfully.');
      return mongooseInstance;
    }).catch(err => {
      // This catch is for the promise itself, if mongoose.connect() promise rejects
      console.error('MongoDB mongoose.connect() promise rejected:', err);
      cached.promise = null; // Reset promise on failure
      throw err; // Re-throw to be caught by the await below or the caller
    });
  } else {
    console.log('Reusing existing MongoDB connection promise.');
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null; // Clear the promise on failure so a new attempt can be made
    const error = e as Error;
    console.error('MongoDB connection error during await cached.promise:', error.message, error.name, error.stack);
    // Construct a more detailed error message
    let detail = `Database connection failed. Original error: ${error.message}`;
    if (error.name) detail += ` (Name: ${error.name})`;
    // You might want to avoid sending full stacks to the client in production
    // if (error.stack) detail += ` Stack: ${error.stack.substring(0, 200)}...`;
    throw new Error(detail);
  }

  if (!cached.conn) {
    // This case should ideally be caught by the try/catch above,
    // but as a safeguard:
    console.error('MongoDB connection is null unexpectedly after promise resolution.');
    throw new Error('MongoDB connection failed unexpectedly after promise resolution.');
  }

  console.log('MongoDB connected successfully.');
  return cached.conn;
}

export default dbConnect;
