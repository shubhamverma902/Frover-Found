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
import { verifyUploadToken } from './utils/fileToken';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'"],
        imgSrc:         ["'self'", 'data:', 'blob:'],
        connectSrc:     ["'self'", CLIENT_URL],
        fontSrc:        ["'self'"],
        objectSrc:      ["'none'"],
        frameAncestors: ["'none'"],  // stronger than X-Frame-Options
      },
    },
    // HSTS: enforce HTTPS for 1 year in production; off in dev (HTTP is fine locally)
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
  })
);
app.use(
  cors({
    origin: CLIENT_URL,
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

// Serve uploaded files — token-gated; CORP restricted to same-origin.
// The serializer signs each attachment URL with a 24 h JWT before returning it
// to the client. The token's `p` claim must exactly match the requested path,
// so a leaked URL cannot be replayed to access a different file, and an
// unauthenticated request (no token) is rejected before any file is read.
app.use('/uploads', (req, res, next) => {
  const token = req.query['token'];
  if (typeof token !== 'string' || !token) {
    res.status(401).json({ success: false, message: 'File access requires a signed token' });
    return;
  }

  const claimedPath = verifyUploadToken(token);
  if (!claimedPath) {
    res.status(403).json({ success: false, message: 'Invalid or expired file token' });
    return;
  }

  // req.path inside a sub-router is relative to the mount point ("/vendors/…")
  const requestedPath = '/uploads' + req.path;
  if (claimedPath !== requestedPath) {
    res.status(403).json({ success: false, message: 'Token path mismatch' });
    return;
  }

  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', routes);

// 404 & error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
