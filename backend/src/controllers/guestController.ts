import { Response, NextFunction } from 'express';
import Guest from '../models/Guest';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logActivity from '../utils/logActivity';
import { serializeGuest } from '../helpers/serializers';

// GET /api/v1/guests?page=1&limit=10
export const getGuests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid   = req.user!.id;
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [guests, total] = await Promise.all([
      Guest.find({ userId: uid }).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Guest.countDocuments({ userId: uid }),
    ]);

    sendSuccess(res, {
      guests:     guests.map(serializeGuest),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/guests
export const createGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, relation, phone, rsvp, meal, plusOne } = req.body;
    if (!name?.trim()) return next(new ApiError(422, 'Guest name is required'));

    const guest = await Guest.create({
      userId: req.user!.id,
      name:     name.trim(),
      relation: relation?.trim() ?? '',
      phone:    phone?.trim()    ?? '',
      rsvp:     rsvp    ?? 'pending',
      meal:     meal    ?? 'Veg',
      plusOne:  Boolean(plusOne),
    });

    logActivity(req.user!.id, '👤', `Guest added: ${guest.name}`);
    sendSuccess(res, { guest: serializeGuest(guest) }, 'Guest added', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/guests/:id/rsvp
export const patchGuestRsvp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rsvp } = req.body;
    if (!['confirmed', 'pending', 'declined'].includes(rsvp))
      return next(new ApiError(422, 'Invalid RSVP value'));

    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { rsvp },
      { new: true }
    );
    if (!guest) return next(new ApiError(404, 'Guest not found'));
    if (rsvp === 'confirmed') logActivity(req.user!.id, '✉', `${guest.name} confirmed attendance`);
    if (rsvp === 'declined')  logActivity(req.user!.id, '✉', `${guest.name} declined invitation`);
    sendSuccess(res, { guest: serializeGuest(guest) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/guests/:id
export const deleteGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!guest) return next(new ApiError(404, 'Guest not found'));
    sendSuccess(res, null, 'Guest removed');
  } catch (err) {
    next(err);
  }
};
