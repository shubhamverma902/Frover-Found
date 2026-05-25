import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

// Signs the pathname of an upload URL (e.g. "/uploads/vendors/123/abc.jpg").
// The resulting token is appended as ?token=<...> to the URL returned by the API.
// 24-hour TTL: long enough for a user session; short enough to limit window if leaked.
export function signUploadPath(pathname: string): string {
  return jwt.sign({ p: pathname }, SECRET, { expiresIn: '24h', subject: 'upload' });
}

// Returns the signed pathname on success, null if the token is missing, expired, or tampered.
export function verifyUploadToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET, { subject: 'upload' }) as jwt.JwtPayload;
    return typeof payload.p === 'string' ? payload.p : null;
  } catch {
    return null;
  }
}
