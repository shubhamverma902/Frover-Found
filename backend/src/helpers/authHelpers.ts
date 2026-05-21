import jwt from 'jsonwebtoken';
import User from '../models/User';

export const signToken = (id: string, email: string, role: string): string => {
  const secret    = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
  if (!secret) throw new Error('JWT_SECRET not defined');
  return jwt.sign({ id, email, role }, secret, { expiresIn } as jwt.SignOptions);
};

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
