import xss from 'xss';

// No HTML allowed in any user-supplied text field
const OPTS = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

/** Strip all HTML from a value. Returns '' for null/undefined. */
export const sanitize = (val: unknown): string =>
  val == null ? '' : xss(String(val), OPTS).trim();

/**
 * Like sanitize, but returns undefined when the input is undefined.
 * Use this for optional fields in update handlers so Mongoose skips
 * the field instead of overwriting it with an empty string.
 */
export const sanitizeOpt = (val: unknown): string | undefined =>
  val === undefined ? undefined : sanitize(val);
