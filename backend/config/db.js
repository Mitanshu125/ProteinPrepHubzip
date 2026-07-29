import mongoose from "mongoose";

// In serverless environments (Vercel), this module can be re-imported on
// every cold start. Caching the connection promise on `global` means warm
// invocations reuse the existing connection instead of opening a new one
// each time, and concurrent cold-start requests all await the same promise
// instead of racing to connect separately.
let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        // Fail fast instead of hanging/buffering for a long time if the
        // connection can't be established.
        serverSelectionTimeoutMS: 10000,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB connected");
        return mongooseInstance;
      })
      .catch((error) => {
        // Reset so the next request can retry, instead of getting stuck
        // on a rejected promise forever.
        cached.promise = null;
        console.error("MongoDB connection error:", error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};