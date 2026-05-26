import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';
import ApiError from '../utils/ApiError';

export const signToken = (
  id: string,
  email: string,
  role: string,
  dataOwnerId?: string,
  collaboratorRole?: 'planner' | 'viewer',
): string => {
  const secret    = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
  if (!secret) throw new Error('JWT_SECRET not defined');
  const payload: Record<string, unknown> = { id, email, role };
  if (dataOwnerId)      payload.dataOwnerId      = dataOwnerId;
  if (collaboratorRole) payload.collaboratorRole = collaboratorRole;
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/** Blocks viewer-role collaborators from mutating data. */
export const requireWrite = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (req.user!.collaboratorRole === 'viewer')
    return next(new ApiError(403, 'Viewers cannot make changes'));
  next();
};

/** Blocks all collaborators from owner-only operations (settings, partner mgmt, etc.). */
export const requireOwnerOrPartner = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (req.user!.collaboratorRole)
    return next(new ApiError(403, 'Only the couple can access this'));
  next();
};

/** Returns the data-owner user ID for this request.
 *  For primary accounts this equals their own ID.
 *  For secondary (partner) accounts it equals the primary user's ID. */
export const ownerId = (req: AuthRequest): string =>
  req.user!.dataOwnerId ?? req.user!.id;

export const signRefreshToken = (id: string, tokenVersion: number): string => {
  const secret    = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
  if (!secret) throw new Error('JWT_REFRESH_SECRET not defined');
  return jwt.sign({ id, tokenVersion }, secret, { expiresIn } as jwt.SignOptions);
};

export const userPayload = (user: InstanceType<typeof User>) => ({
  id:                  String(user._id),
  name:                user.name,
  email:               user.email,
  plan:                user.plan,
  role:                user.role,
  onboardingCompleted: user.onboardingCompleted,
  collaboratorRole:    user.collaboratorRole ?? null,
});
