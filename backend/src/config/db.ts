import mongoose from 'mongoose';
import logger from '../utils/logger';

// ── Slow-query plugin ────────────────────────────────────────────────────────
// Registered as a side effect at import time — must happen before any model
// schema is compiled. server.ts imports this module before importing app.ts.

const SLOW_MS = Number(process.env.SLOW_QUERY_MS ?? 200);
const timings  = new WeakMap<object, number>();

mongoose.plugin(schema => {
  const ops = [
    'find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete',
    'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'countDocuments',
  ] as const;

  for (const op of ops) {
    schema.pre(op, function ()  { timings.set(this, Date.now()); });
    schema.post(op, function () {
      const start = timings.get(this);
      if (start === undefined) return;
      timings.delete(this);
      const ms = Date.now() - start;
      if (ms >= SLOW_MS) logger.warn({ ms, op }, 'slow query');
    });
  }

  schema.pre('aggregate', function ()  { timings.set(this, Date.now()); });
  schema.post('aggregate', function () {
    const start = timings.get(this);
    if (start === undefined) return;
    timings.delete(this);
    const ms = Date.now() - start;
    if (ms >= SLOW_MS) logger.warn({ ms, op: 'aggregate' }, 'slow query');
  });
});

// ── Connection ───────────────────────────────────────────────────────────────

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');
  const conn = await mongoose.connect(uri, {
    maxPoolSize:              20,   // max concurrent connections; default is 5
    minPoolSize:               2,   // keep 2 warm so cold requests don't pay connect cost
    serverSelectionTimeoutMS: 5000, // fail fast if no server reachable in 5 s
    socketTimeoutMS:         45000, // abort idle sockets after 45 s
  });
  logger.info({ host: conn.connection.host }, 'MongoDB connected');
};

export default connectDB;
