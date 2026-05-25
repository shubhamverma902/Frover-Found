import 'dotenv/config';
// db MUST be imported before app: the slow-query plugin in db.ts registers as a
// Mongoose global plugin at import time, and it must run before app.ts triggers
// model compilation (via routes → controllers → model imports).
import connectDB from './config/db';
import app from './app';
import logger from './utils/logger';

// ── Environment validation ────────────────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
] as const;

const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  logger.fatal({ missing }, 'Missing required environment variables — copy .env.example to .env');
  process.exit(1);
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV ?? 'development' }, 'Server running');
  });
};

start().catch(err => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
