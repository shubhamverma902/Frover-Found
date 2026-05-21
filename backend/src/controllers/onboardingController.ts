import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ── Validation rules (exported so the router can compose them) ──
export const onboardingValidation = [
  body('partner1').trim().notEmpty().withMessage('Partner 1 name is required'),
  body('partner2').trim().notEmpty().withMessage('Partner 2 name is required'),
  body('weddingDate').isISO8601().withMessage('Valid wedding date is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be a positive integer'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
  body('style').trim().notEmpty().withMessage('Wedding style is required'),
  body('events').isArray({ min: 1 }).withMessage('Select at least one event'),
  body('events.*').isString().notEmpty(),
];

// POST /api/v1/onboarding  — save profile, mark completed
export const saveOnboarding = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { partner1, partner2, weddingDate, city, guestCount, budget, style, events } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        onboardingCompleted: true,
        weddingProfile: {
          partner1,
          partner2,
          weddingDate: new Date(weddingDate),
          city,
          guestCount: Number(guestCount),
          budget:     Number(budget),
          style,
          events,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, 'User not found'));

    sendSuccess(res, {
      onboardingCompleted: user.onboardingCompleted,
      weddingProfile:      user.weddingProfile,
    }, 'Onboarding saved');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/onboarding  — fetch saved profile
export const getOnboarding = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('onboardingCompleted weddingProfile');
    if (!user) return next(new ApiError(404, 'User not found'));

    sendSuccess(res, {
      onboardingCompleted: user.onboardingCompleted,
      weddingProfile:      user.weddingProfile,
    });
  } catch (err) {
    next(err);
  }
};
