export const required    = (v: string)  => !v.trim() ? 'Required' : '';
export const positiveNum = (v: string)  => !v || Number(v) <= 0 ? 'Enter a value greater than 0' : '';
export const nonNegNum   = (v: string)  => v === '' || isNaN(Number(v)) || Number(v) < 0 ? 'Must be 0 or more' : '';

// ── Attachment constraints (shared between UI and API layer) ──────────────────

export const ATTACHMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export class AttachmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttachmentValidationError';
  }
}

export function validateAttachment(file: File): void {
  if (!(ATTACHMENT_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new AttachmentValidationError(
      `Unsupported file type "${file.type}". Allowed: JPG, PNG, WebP, GIF, PDF.`
    );
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    throw new AttachmentValidationError(
      `File too large (${(file.size / 1_048_576).toFixed(1)} MB). Maximum is 10 MB.`
    );
  }
}
