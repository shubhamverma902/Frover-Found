import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export const makeUpload = (entity: 'vendors' | 'events') =>
  multer({
    storage: multer.diskStorage({
      destination: (req, _file, cb) => {
        const dir = path.join(UPLOADS_ROOT, entity, String(req.params.id));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext  = path.extname(file.originalname).toLowerCase() || '';
        const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, safe);
      },
    }),
    limits:     { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
      else cb(new Error('Only JPG, PNG, WebP, GIF images and PDFs are allowed'));
    },
  });
