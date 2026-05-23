import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { signToken, signRefreshToken, userPayload } from '../helpers/authHelpers';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  // Restrict to the refresh endpoint so the cookie is never sent on other requests
  path:     '/api/v1/auth/refresh',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

const setRefreshCookie = (res: Response, token: string) =>
  res.cookie(REFRESH_COOKIE, token, cookieOptions);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError(409, 'Email already in use'));

    const user         = await User.create({ name, email, password });
    const id           = String(user._id);
    const accessToken  = signToken(id, user.email, user.role); // new user — no dataOwner yet
    const refreshToken = signRefreshToken(id);

    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { token: accessToken, user: userPayload(user) }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const id           = String(user._id);
    const accessToken  = signToken(id, user.email, user.role, user.dataOwner?.toString(), user.collaboratorRole ?? undefined);
    const refreshToken = signRefreshToken(id);

    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { token: accessToken, user: userPayload(user) }, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return next(new ApiError(401, 'No refresh token'));

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET not defined');

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, secret) as jwt.JwtPayload;
    } catch {
      // Cookie is stale — clear it so the browser doesn't keep sending it
      res.clearCookie(REFRESH_COOKIE, { ...cookieOptions });
      return next(new ApiError(401, 'Refresh token expired or invalid'));
    }

    const user = await User.findById(payload.id);
    if (!user) return next(new ApiError(401, 'User not found'));

    const newAccessToken  = signToken(String(user._id), user.email, user.role, user.dataOwner?.toString(), user.collaboratorRole ?? undefined);
    const newRefreshToken = signRefreshToken(String(user._id));

    // Rotate: issue a fresh refresh token on every use
    setRefreshCookie(res, newRefreshToken);
    sendSuccess(res, { token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions });
  res.status(200).json({ success: true, message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));
    sendSuccess(res, { user: userPayload(user) });
  } catch (err) {
    next(err);
  }
};
