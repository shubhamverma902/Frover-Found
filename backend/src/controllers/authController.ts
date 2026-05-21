import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { signToken, userPayload } from '../helpers/authHelpers';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new ApiError(409, 'Email already in use'));

    const user  = await User.create({ name, email, password });
    const token = signToken(String(user._id), user.email, user.role);

    sendSuccess(res, { token, user: userPayload(user) }, 'Registered successfully', 201);
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

    const token = signToken(String(user._id), user.email, user.role);
    sendSuccess(res, { token, user: userPayload(user) }, 'Logged in successfully');
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
