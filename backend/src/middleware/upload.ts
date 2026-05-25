import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { RequestHandler } from 'express';

export const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

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
//   3. File is written to disk only after both checks pass
//   4. req.file.filename is set so controllers can use it unchanged

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
    multerInstance.single('file')(req, res, (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      // ── Gate 2: magic-byte verification ──────────────────────────────────────
      const actual = detectMime(req.file.buffer);
      if (actual !== req.file.mimetype) {
        return next(
          new Error(`File content does not match its declared type (got ${actual ?? 'unknown'}, expected ${req.file.mimetype})`)
        );
      }

      // ── Write to disk (only after both gates pass) ────────────────────────────
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
