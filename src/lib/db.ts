import mongoose, { ClientSession } from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function createSession() {
  const db = await dbConnect();
  const session = db.startSession();
  console.log(`[DB] Session started with id: ${(await session).id}`);
  return session;
}

async function rollback(session: ClientSession) {
  try {
    await session.abortTransaction();
    console.log(
      `[DB] Transaction aborted successfully for session id: ${session.id}`
    );
  } catch (error) {
    console.error('[DB] Failed to abort transaction:', error);
  } finally {
    console.log(`[DB] Ending session with id: ${session.id}`);
    session.endSession();
  }
}

export { dbConnect, createSession, rollback };
