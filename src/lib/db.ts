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

// Connect to the database
async function dbConnect() {
  require('../models/user');
  require('../models/transaction');
  require('../models/contract');

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Create a session for database transactions
async function createSession() {
  const db = await dbConnect();
  const session = db.startSession();
  console.log(`[DB] Session started with id: ${(await session).id}`);
  return session;
}

// Rollback the transaction
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

// Initialize all Mongoose models
async function initializeModels() {
  try {
    await dbConnect();

    const UserModel = require('../models/user');
    const TransactionModel = require('../models/transaction');
    const ContractModel = require('../models/contract');

    console.log('[DB] Models initialized:', {
      UserModel,
      TransactionModel,
      ContractModel
    });

    return {
      UserModel,
      TransactionModel,
      ContractModel
    };
  } catch (error) {
    console.error('[DB] Error initializing models:', error);
    throw new Error('Failed to initialize models');
  }
}

export { dbConnect, createSession, rollback, initializeModels };
