import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { NOTIFICATION_DEFAULTS } from '../constants/notifications';
import { fmtDateISO } from '../helpers/dateHelpers';
import { signToken } from '../helpers/authHelpers';
import { sanitize } from '../utils/sanitize';

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
      name:  sanitize(name),
      email: sanitize(email).toLowerCase(),
      phone: sanitize(phone),
    };
    if (partnerName !== undefined && sanitize(partnerName)) {
      updates['weddingProfile.partner2'] = sanitize(partnerName);
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
        ...(venue       !== undefined && { 'weddingProfile.venue':      sanitize(venue)    }),
        ...(city        && { 'weddingProfile.city':       sanitize(city)        }),
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

// ── Partner invite ─────────────────────────────────────────────────────────────

// GET /api/v1/settings/partner
export const getPartner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).populate<{
      linkedPartner: { _id: unknown; name: string; email: string } | null;
    }>('linkedPartner', 'name email');

    if (!user) return next(new ApiError(404, 'User not found'));

    const linked = user.linkedPartner
      ? {
          id:       String(user.linkedPartner._id),
          name:     user.linkedPartner.name,
          email:    user.linkedPartner.email,
          linkedAt: user.linkedAt?.toISOString() ?? '',
        }
      : null;

    const pending = user.pendingInviteEmail
      ? { email: user.pendingInviteEmail, expiresAt: user.partnerInviteExpiry?.toISOString() ?? '' }
      : null;

    sendSuccess(res, { linked, pending });
  } catch (err) { next(err); }
};

// POST /api/v1/settings/partner/invite
export const invitePartner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return next(new ApiError(422, 'Email is required'));
    if (email.trim().toLowerCase() === req.user!.email.toLowerCase())
      return next(new ApiError(422, 'You cannot invite yourself'));

    const me = await User.findById(req.user!.id);
    if (!me) return next(new ApiError(404, 'User not found'));
    if (me.linkedPartner)
      return next(new ApiError(409, 'You already have a linked partner. Remove them first.'));

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 h

    await User.findByIdAndUpdate(req.user!.id, {
      partnerInviteToken:  token,
      partnerInviteExpiry: expiry,
      pendingInviteEmail:  email.trim().toLowerCase(),
    });

    const appUrl    = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}`;

    sendSuccess(res, {
      inviteUrl,
      email:     email.trim().toLowerCase(),
      expiresAt: expiry.toISOString(),
    }, 'Invite created');
  } catch (err) { next(err); }
};

// POST /api/v1/settings/partner/accept
export const acceptInvite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) return next(new ApiError(422, 'Token is required'));

    const inviter = await User.findOne({
      partnerInviteToken:  token,
      partnerInviteExpiry: { $gt: new Date() },
    });
    if (!inviter) return next(new ApiError(404, 'Invite not found or has expired'));
    if (String(inviter._id) === req.user!.id)
      return next(new ApiError(422, 'You cannot accept your own invite'));

    const me = await User.findById(req.user!.id);
    if (!me) return next(new ApiError(404, 'User not found'));
    if (me.linkedPartner)
      return next(new ApiError(409, 'Your account is already linked to a partner'));

    const now = new Date();

    await Promise.all([
      // Inviter becomes primary: clear invite fields, set link
      User.findByIdAndUpdate(inviter._id, {
        linkedPartner:       me._id,
        linkedAt:            now,
        partnerInviteToken:  null,
        partnerInviteExpiry: null,
        pendingInviteEmail:  null,
      }),
      // Acceptor becomes secondary: dataOwner → inviter
      User.findByIdAndUpdate(me._id, {
        linkedPartner: inviter._id,
        linkedAt:      now,
        dataOwner:     inviter._id,
      }),
    ]);

    // Issue a new token that encodes the secondary user's dataOwnerId
    const newToken = signToken(req.user!.id, req.user!.email, req.user!.role, String(inviter._id));
    sendSuccess(res, { token: newToken }, 'Partner linked successfully');
  } catch (err) { next(err); }
};

// DELETE /api/v1/settings/partner
export const removePartner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const me = await User.findById(req.user!.id);
    if (!me) return next(new ApiError(404, 'User not found'));
    if (!me.linkedPartner) return next(new ApiError(404, 'No linked partner to remove'));

    const partnerId = me.linkedPartner;

    await Promise.all([
      User.findByIdAndUpdate(req.user!.id, {
        linkedPartner: null, linkedAt: null, dataOwner: null,
        partnerInviteToken: null, partnerInviteExpiry: null, pendingInviteEmail: null,
      }),
      User.findByIdAndUpdate(partnerId, {
        linkedPartner: null, linkedAt: null, dataOwner: null,
        partnerInviteToken: null, partnerInviteExpiry: null, pendingInviteEmail: null,
      }),
    ]);

    // Issue a fresh token without dataOwnerId
    const newToken = signToken(req.user!.id, req.user!.email, me.role);
    sendSuccess(res, { token: newToken }, 'Partner removed');
  } catch (err) { next(err); }
};
