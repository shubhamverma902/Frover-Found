import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import notFound from './middleware/notFound';
import logger from './utils/logger';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Logging & parsing
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check — verifies DB connectivity
app.get('/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbUp = state === 1;

  if (!dbUp) {
    res.status(503).json({
      status: 'error',
      uptime: process.uptime(),
      db: { connected: false, state },
    });
    return;
  }

  try {
    const t0 = Date.now();
    await mongoose.connection.db!.admin().ping();
    const latencyMs = Date.now() - t0;
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      db: { connected: true, latencyMs },
    });
  } catch (err) {
    logger.error({ err }, 'health check DB ping failed');
    res.status(503).json({
      status: 'error',
      uptime: process.uptime(),
      db: { connected: false, state },
    });
  }
});

// Serve uploaded files — allow cross-origin loading (helmet sets same-origin by default)
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', routes);

// 404 & error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
