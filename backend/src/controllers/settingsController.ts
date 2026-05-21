import { Response, NextFunction } from 'express';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { NOTIFICATION_DEFAULTS } from '../constants/notifications';
import { fmtDateISO } from '../helpers/dateHelpers';

// GET /api/v1/settings
export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    const wp = user.weddingProfile;

    // Merge stored prefs with defaults so new notification keys always appear
    const notifications = NOTIFICATION_DEFAULTS.map(n => ({
      ...n,
      on: user.notificationPrefs?.get(n.key) ?? n.on,
    }));

    sendSuccess(res, {
      profile: {
        name:        user.name,
        partnerName: wp?.partner2 ?? '',
        email:       user.email,
        phone:       user.phone ?? '',
      },
      wedding: wp ? {
        weddingDate: fmtDateISO(wp.weddingDate),
        venue:       wp.venue ?? '',
        city:        wp.city,
        guestCount:  wp.guestCount,
      } : null,
      notifications,
    });
  } catch (err) { next(err); }
};

// PATCH /api/v1/settings/profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, partnerName, email, phone } = req.body;
    if (!name?.trim())  return next(new ApiError(422, 'Name is required'));
    if (!email?.trim()) return next(new ApiError(422, 'Email is required'));

    const updates: Record<string, any> = {
      name:  name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? '',
    };
    if (partnerName !== undefined && partnerName.trim()) {
      updates['weddingProfile.partner2'] = partnerName.trim();
    }

    const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true, runValidators: true });
    if (!user) return next(new ApiError(404, 'User not found'));

    sendSuccess(res, {
      name:        user.name,
      partnerName: user.weddingProfile?.partner2 ?? '',
      email:       user.email,
      phone:       user.phone,
    }, 'Profile updated');
  } catch (err) { next(err); }
};

// PATCH /api/v1/settings/wedding
export const updateWedding = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { weddingDate, venue, city, guestCount } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        ...(weddingDate && { 'weddingProfile.weddingDate': new Date(weddingDate) }),
        ...(venue       !== undefined && { 'weddingProfile.venue':      venue.trim()       }),
        ...(city        && { 'weddingProfile.city':       city.trim()        }),
        ...(guestCount  && { 'weddingProfile.guestCount': Number(guestCount) }),
      },
      { new: true }
    );
    if (!user) return next(new ApiError(404, 'User not found'));

    const wp = user.weddingProfile;
    sendSuccess(res, {
      weddingDate: wp ? fmtDateISO(wp.weddingDate) : '',
      venue:       wp?.venue ?? '',
      city:        wp?.city  ?? '',
      guestCount:  wp?.guestCount ?? 0,
    }, 'Wedding details updated');
  } catch (err) { next(err); }
};

// PATCH /api/v1/settings/notifications
export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prefs } = req.body; // { [key: string]: boolean }
    if (!prefs || typeof prefs !== 'object') return next(new ApiError(422, 'Invalid prefs'));

    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    Object.entries(prefs).forEach(([key, val]) => {
      user.notificationPrefs.set(key, !!val);
    });
    await user.save();

    const prefsObj: Record<string, boolean> = {};
    user.notificationPrefs.forEach((val, key) => { prefsObj[key] = val; });
    sendSuccess(res, { prefs: prefsObj }, 'Notifications updated');
  } catch (err) { next(err); }
};

// DELETE /api/v1/settings/account
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.user!.id);
    sendSuccess(res, null, 'Account deleted');
  } catch (err) { next(err); }
};
