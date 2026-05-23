import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { AuthRequest } from '../types';

export const signToken = (id: string, email: string, role: string, dataOwnerId?: string): string => {
  const secret    = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
  if (!secret) throw new Error('JWT_SECRET not defined');
  const payload = dataOwnerId ? { id, email, role, dataOwnerId } : { id, email, role };
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/** Returns the data-owner user ID for this request.
 *  For primary accounts this equals their own ID.
 *  For secondary (partner) accounts it equals the primary user's ID. */
export const ownerId = (req: AuthRequest): string =>
  req.user!.dataOwnerId ?? req.user!.id;

export const signRefreshToken = (id: string): string => {
  const secret    = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  if (!secret) throw new Error('JWT_REFRESH_SECRET not defined');
  return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

export const userPayload = (user: InstanceType<typeof User>) => ({
  id:                  String(user._id),
  name:                user.name,
  email:               user.email,
  role:                user.role,
  onboardingCompleted: user.onboardingCompleted,
});
