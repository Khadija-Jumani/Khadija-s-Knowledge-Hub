import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// 1. Extend the NodeJS global interface strictly
declare global {
    // eslint-disable-next-line no-var
    var mongooseConnection: MongooseConnection | undefined;
}

// 2. Define the cached variable layout
let cached: MongooseConnection = global.mongooseConnection || { conn: null, promise: null };

if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}

export const connectToDB = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
        dbName: 'university-notes',
        bufferCommands: false,
    });

    cached.conn = await cached.promise;
    return cached.conn;
}
