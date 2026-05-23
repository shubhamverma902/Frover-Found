import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { fmtDateISO } from '../helpers/dateHelpers';

// GET /api/v1/public/wedding/:slug — no auth required
export const getPublicWedding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Resolve via publicSlug; also follow dataOwner so partner accounts share the same page
    const user = await User.findOne({ publicSlug: req.params.slug });
    if (!user) return next(new ApiError(404, 'Wedding page not found'));

    const wp = user.weddingProfile;
    if (!wp) return next(new ApiError(404, 'Wedding details not set up yet'));

    sendSuccess(res, {
      partner1:    wp.partner1,
      partner2:    wp.partner2,
      weddingDate: fmtDateISO(wp.weddingDate),
      venue:       wp.venue ?? '',
      city:        wp.city,
      guestCount:  wp.guestCount,
      style:       wp.style ?? '',
    });
  } catch (err) { next(err); }
};

// POST /api/v1/public/wedding/generate — protected; creates slug if not present
export const generatePublicSlug = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Follow dataOwner so partners/collaborators generate the owner's slug
    const ownerId = (req.user!.dataOwnerId ?? req.user!.id);
    let user = await User.findById(ownerId);
    if (!user) return next(new ApiError(404, 'User not found'));

    if (!user.publicSlug) {
      // 10-char hex token — 40 bits of entropy, URL-safe, memorable enough
      user.publicSlug = crypto.randomBytes(5).toString('hex');
      await user.save();
    }

    sendSuccess(res, { slug: user.publicSlug });
  } catch (err) { next(err); }
};
