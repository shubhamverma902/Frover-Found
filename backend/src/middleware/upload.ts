import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { RequestHandler } from 'express';
import Vendor from '../models/Vendor';
import Event from '../models/Event';
import ApiError from '../utils/ApiError';

export const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

const QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB per account

// ── Allowed MIME types ────────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

// ── Magic-byte signatures ─────────────────────────────────────────────────────
// We read the first 12 bytes from the buffer and compare against known file
// signatures. `file.mimetype` is whatever the client sent — this is the actual
// content check that makes spoofing impossible.

const SIGNATURES: { mime: string; check: (b: Buffer) => boolean }[] = [
  {
    mime:  'image/jpeg',
    check: b => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  },
  {
    mime:  'image/png',
    check: b =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 &&
      b[4] === 0x0D && b[5] === 0x0A && b[6] === 0x1A && b[7] === 0x0A,
  },
  {
    // RIFF....WEBP
    mime:  'image/webp',
    check: b =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    // GIF87a or GIF89a
    mime:  'image/gif',
    check: b =>
      b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61,
  },
  {
    // %PDF
    mime:  'application/pdf',
    check: b => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
];

function detectMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  for (const { mime, check } of SIGNATURES) {
    if (check(buffer)) return mime;
  }
  return null;
}

// ── Per-user disk quota ───────────────────────────────────────────────────────
// Sums byte usage across every vendor and event directory owned by the user.
// Directories are keyed by entity ID, so we query the DB for the user's IDs
// then walk each directory synchronously (fast for small attachment counts).

function dirBytes(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).reduce((sum, file) => {
    try { return sum + fs.statSync(path.join(dir, file)).size; }
    catch { return sum; }
  }, 0);
}

async function getUserDiskBytes(userId: string): Promise<number> {
  const [vendors, events] = await Promise.all([
    Vendor.find({ userId }).select('_id').lean(),
    Event.find({ userId }).select('_id').lean(),
  ]);

  let total = 0;
  for (const v of vendors) total += dirBytes(path.join(UPLOADS_ROOT, 'vendors', String(v._id)));
  for (const e of events)  total += dirBytes(path.join(UPLOADS_ROOT, 'events',  String(e._id)));
  return total;
}

// ── Upload error mapper ───────────────────────────────────────────────────────
// Maps multer error codes and our own upload errors to generic client-safe
// messages. Never expose internal limits, field names, or magic-byte details.

export function uploadErrorMessage(err: Error): string {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':       return 'File exceeds the maximum allowed size';
      case 'LIMIT_FILE_COUNT':      return 'Too many files in a single upload';
      case 'LIMIT_UNEXPECTED_FILE': return 'Unexpected file field in request';
      default:                      return 'File upload failed';
    }
  }
  // fileFilter rejections and magic-byte mismatches fall here — do not forward
  // the original message as it reveals accepted types and verification details
  return 'File type not permitted';
}

// ── CSV upload (memory only — no disk write, no magic-byte check) ─────────────

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okMime = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (okMime.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.csv'))
      cb(null, true);
    else
      cb(new Error('Only CSV files are allowed'));
  },
});

// ── Image / PDF upload (memory → validate → disk) ─────────────────────────────
// Returns a single RequestHandler so call sites stay as: upload(req, res, next)
// instead of multer().single('file')(req, res, next).
//
// Flow:
//   1. multer buffers the file to memory (declared MIME is checked against the
//      allowlist as a first gate)
//   2. Magic bytes in the buffer are verified against the declared MIME — this
//      is the gate that prevents a PHP shell renamed to photo.jpg from passing
//   3. Per-user disk quota is checked against current usage + incoming file size
//   4. File is written to disk only after all three gates pass
//   5. req.file.filename is set so controllers can use it unchanged

export const makeUpload = (entity: 'vendors' | 'events'): RequestHandler => {
  const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
      else cb(new Error('Only JPG, PNG, WebP, GIF images and PDFs are allowed'));
    },
  });

  return (req, res, next) => {
    multerInstance.single('file')(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      // ── Gate 2: magic-byte verification ──────────────────────────────────────
      const actual = detectMime(req.file.buffer);
      if (actual !== req.file.mimetype) {
        return next(
          new Error(`File content does not match its declared type (got ${actual ?? 'unknown'}, expected ${req.file.mimetype})`)
        );
      }

      // ── Gate 3: per-user disk quota ───────────────────────────────────────────
      // req.user is guaranteed here because protect() runs before this middleware.
      // dataOwnerId is set for collaborators so their uploads count against the
      // owner's quota rather than their own (shadow) account.
      try {
        const userId = (req as any).user?.dataOwnerId ?? (req as any).user?.id;
        if (userId) {
          const used = await getUserDiskBytes(userId);
          if (used + req.file.buffer.length > QUOTA_BYTES) {
            return next(new ApiError(413, `Storage quota exceeded. Maximum ${QUOTA_BYTES / (1024 * 1024)} MB per account.`));
          }
        }
      } catch (quotaErr) {
        return next(quotaErr);
      }

      // ── Write to disk (only after all gates pass) ─────────────────────────────
      const dir  = path.join(UPLOADS_ROOT, entity, String(req.params.id));
      fs.mkdirSync(dir, { recursive: true });

      const ext  = path.extname(req.file.originalname).toLowerCase() || '';
      const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const dest = path.join(dir, safe);
      fs.writeFileSync(dest, req.file.buffer);

      // Patch req.file so controllers can read filename exactly as before
      req.file.filename = safe;

      next();
    });
  };
};
