import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { signToken, signRefreshToken, userPayload } from '../helpers/authHelpers';
import logAudit from '../utils/logAudit';

const REFRESH_COOKIE     = 'refreshToken';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_WINDOW_MS     = 15 * 60 * 1000; // 15 minutes

// Constant-time sentinel: ensures the null-user path runs a full bcrypt round
// so response time cannot reveal whether an email exists in the database.
const DUMMY_HASH = bcrypt.hashSync('__frover_timing_sentinel__', 12);

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
    const { name, email, password, plan } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError(409, 'Email already in use'));

    const user         = await User.create({ name, email, password, plan: plan === 'premium' ? 'premium' : 'free' });
    const id           = String(user._id);
    const accessToken  = signToken(id, user.email, user.role);
    // New accounts start at version 0 — tokenVersion field default
    const refreshToken = signRefreshToken(id, 0);

    logAudit(req, 'auth.register', id);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { token: accessToken, user: userPayload(user) }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +tokenVersion');

    // Locked account — check before the password comparison to avoid timing leaks
    if (user?.lockUntil && user.lockUntil > new Date()) {
      const minsLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60_000);
      return next(new ApiError(429, `Too many failed attempts. Try again in ${minsLeft} minute${minsLeft === 1 ? '' : 's'}.`));
    }

    // Always run bcrypt.compare — never short-circuit on a null user.
    // The DUMMY_HASH path returns false but burns the same ~200 ms as a real compare,
    // making response time identical whether the email exists or not.
    const passwordOk = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !passwordOk) {
      logAudit(req, 'auth.login.failure', user ? String(user._id) : null, { email });
      if (user) {
        const newAttempts = (user.loginAttempts ?? 0) + 1;
        const lock        = newAttempts >= MAX_LOGIN_ATTEMPTS;
        await User.findByIdAndUpdate(user._id, {
          // Reset counter to 0 on lock so the user gets a fresh window after lockout expires
          loginAttempts: lock ? 0 : newAttempts,
          lockUntil:     lock ? new Date(Date.now() + LOCK_WINDOW_MS) : null,
        });
      }
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Successful login — clear any residual lockout state
    if (user.loginAttempts || user.lockUntil) {
      await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: null });
    }

    const id           = String(user._id);
    const accessToken  = signToken(id, user.email, user.role, user.dataOwner?.toString(), user.collaboratorRole ?? undefined);
    const refreshToken = signRefreshToken(id, user.tokenVersion ?? 0);

    logAudit(req, 'auth.login.success', id);
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
      res.clearCookie(REFRESH_COOKIE, { ...cookieOptions });
      return next(new ApiError(401, 'Refresh token expired or invalid'));
    }

    const user = await User.findById(payload.id).select('+tokenVersion');
    if (!user) return next(new ApiError(401, 'User not found'));

    // Version mismatch means this token was already rotated — possible replay attack.
    // Bump the version immediately so every currently-valid token for this user is killed.
    if ((payload.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      await User.findByIdAndUpdate(user._id, { $inc: { tokenVersion: 1 } });
      res.clearCookie(REFRESH_COOKIE, { ...cookieOptions });
      return next(new ApiError(401, 'Refresh token already used'));
    }

    // Valid — rotate: increment version so this token can never be reused
    const newVersion      = (user.tokenVersion ?? 0) + 1;
    await User.findByIdAndUpdate(user._id, { tokenVersion: newVersion });

    const newAccessToken  = signToken(String(user._id), user.email, user.role, user.dataOwner?.toString(), user.collaboratorRole ?? undefined);
    const newRefreshToken = signRefreshToken(String(user._id), newVersion);

    setRefreshCookie(res, newRefreshToken);
    sendSuccess(res, { token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const secret  = process.env.JWT_REFRESH_SECRET!;
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      // Invalidate all outstanding refresh tokens for this user
      await User.findByIdAndUpdate(payload.id, { $inc: { tokenVersion: 1 } });
      logAudit(req, 'auth.logout', payload.id);
    } catch { /* token already expired — nothing to invalidate */ }
  }
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions });
  res.status(200).json({ success: true, message: 'Logged out' });
};

// POST /api/v1/auth/forgot-password
// Always responds 200 with the same message regardless of whether the email exists
// to prevent both existence enumeration (different messages) and timing attacks.
// TODO: replace the logger.info line below with an email send (Nodemailer / Resend / SendGrid).
const RESET_SENT_MSG = 'If that email is registered, a reset link has been sent';

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      logAudit(req, 'auth.password_reset_request', null, { email });
      sendSuccess(res, null, RESET_SENT_MSG);
      return;
    }

    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry      = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken:  hashedToken,
      passwordResetExpiry: expiry,
    });

    const appUrl   = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${rawToken}`;

    // TODO: await sendEmail({ to: user.email, subject: 'Reset your password', resetUrl, expiry });
    logAudit(req, 'auth.password_reset_request', String(user._id), { resetUrl });
    sendSuccess(res, null, RESET_SENT_MSG);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Select the token field back (it is select:false by default)
    const user = await User.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken');

    if (!user) return next(new ApiError(400, 'Reset token is invalid or has expired'));

    user.password            = password;
    user.passwordResetToken  = null;
    user.passwordResetExpiry = null;
    await user.save(); // bcrypt pre-save hook re-hashes the new password

    // Account ownership proven — clear lockout and invalidate all active sessions
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lockUntil: null },
      $inc: { tokenVersion: 1 },
    });

    logAudit(req, 'auth.password_reset_complete', String(user._id));
    sendSuccess(res, null, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
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
