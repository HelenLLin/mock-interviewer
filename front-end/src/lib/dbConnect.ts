import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
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
  var mongooseCache: MongooseCache | undefined;
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
      // serverSelectionTimeoutMS: 5000,
    };

    // Add non-null assertion '!' here as the check at the top guarantees it's defined
    const uriToLog = MONGODB_URI!.replace(/\/\/(.*:.*)@/, '//<credentials>@');
    console.log(`Attempting to connect to MongoDB with URI: ${uriToLog}`);


    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('MongoDB connection promise resolved successfully.');
      return mongooseInstance;
    }).catch(err => {
      console.error('MongoDB mongoose.connect() promise rejected:', err);
      cached.promise = null;
      throw err;
    });
  } else {
    console.log('Reusing existing MongoDB connection promise.');
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    const error = e as Error;
    console.error('MongoDB connection error during await cached.promise:', error.message, error.name, error.stack);
    let detail = `Database connection failed. Original error: ${error.message}`;
    if (error.name) detail += ` (Name: ${error.name})`;
    throw new Error(detail);
  }

  if (!cached.conn) {
    console.error('MongoDB connection is null unexpectedly after promise resolution.');
    throw new Error('MongoDB connection failed unexpectedly after promise resolution.');
  }

  console.log('MongoDB connected successfully.');
  return cached.conn;
}

export default dbConnect;
