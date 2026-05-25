import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';
import type { Request } from 'express';

// One shared MongoDB collection for all limiters.
// Each document carries its own expirationDate, so different windowMs values
// coexist safely — MongoDB TTL deletes each document when expirationDate passes.
const makeStore = (windowMs: number) =>
  new MongoStore({
    uri:            process.env.MONGO_URI!,
    collectionName: 'rateLimits',
    expireTimeMs:   windowMs,
    // Suppress store-level errors so a MongoDB hiccup never takes down a route.
    errorHandler: (err: Error) => {
      console.error('[rate-limit-mongo]', err.message);
    },
  });

// Helper that returns a JSON 429 body consistent with the rest of the API
const json429 = (msg: string) => (_req: Request, res: any) =>
  res.status(429).json({ success: false, message: msg });

// ── IP-based limiters (unauthenticated routes) ────────────────────────────────

// 5 attempts per IP per 15 min — brute-force login protection
export const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore(15 * 60 * 1000),
  handler:         json429('Too many login attempts. Please wait 15 minutes and try again.'),
});

// 3 requests per IP per hour — prevents email enumeration via reset endpoint
export const forgotPasswordLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             3,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore(60 * 60 * 1000),
  handler:         json429('Too many password reset requests. Please wait 1 hour and try again.'),
});

// 100 requests per IP per hour — public page; no auth, must still be throttled
export const publicWeddingLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore(60 * 60 * 1000),
  handler:         json429('Too many requests. Please try again later.'),
});

// ── Per-user limiters (authenticated routes — key by user ID, not IP) ─────────
// These run after protect(), so req.user is guaranteed to be set.

const userKey = (req: Request) =>
  (req as any).user?.id as string | undefined ?? req.ip ?? 'unknown';

// 10 CSV imports per user per hour — each import can hit insertMany with 500 docs
export const csvImportLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             10,
  keyGenerator:    userKey,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore(60 * 60 * 1000),
  handler:         json429('Too many import requests. Please wait 1 hour and try again.'),
});

// 20 file uploads per user per hour — each upload is disk + DB write
export const uploadAttachmentLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             20,
  keyGenerator:    userKey,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore(60 * 60 * 1000),
  handler:         json429('Too many file uploads. Please wait 1 hour and try again.'),
});
