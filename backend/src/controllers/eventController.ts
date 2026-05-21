import { Response, NextFunction } from 'express';
import Event, { EventStatus } from '../models/Event';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { serializeEvent } from '../helpers/serializers';
import { EVENT_SEED_NAMES } from '../constants/eventSeeds';

// GET /api/v1/events
// Returns all events for the user.  On first call (empty list), auto-seeds
// events from the user's onboarding wedding profile.
export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.user!.id;
    let events = await Event.find({ userId: uid }).sort({ date: 1 });

    if (events.length === 0) {
      const user = await User.findById(uid);
      if (user?.weddingProfile?.events?.length) {
        const weddingDate = user.weddingProfile.weddingDate;
        const seeds = user.weddingProfile.events.map(id => ({
          userId: uid,
          name:   EVENT_SEED_NAMES[id] ?? id,
          date:   weddingDate,
          time:   '',
          venue:  '',
          guests: 0,
          status: 'pending' as EventStatus,
          desc:   '',
        }));
        events = await Event.insertMany(seeds) as unknown as typeof events;
      }
    }

    sendSuccess(res, { events: events.map(serializeEvent) });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/events
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, date, time, venue, guests, status, desc } = req.body;
    if (!name?.trim() || !date) return next(new ApiError(422, 'Name and date are required'));

    const event = await Event.create({
      userId: req.user!.id,
      name:   name.trim(),
      date:   new Date(date),
      time:   time ?? '',
      venue:  venue ?? '',
      guests: Number(guests) || 0,
      status: status ?? 'pending',
      desc:   desc ?? '',
    });

    sendSuccess(res, { event: serializeEvent(event) }, 'Event created', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/events/:id
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, date, time, venue, guests, status, desc } = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      {
        name:   name?.trim(),
        date:   date ? new Date(date) : undefined,
        time:   time,
        venue:  venue,
        guests: Number(guests) || 0,
        status: status,
        desc:   desc,
      },
      { new: true, runValidators: true }
    );

    if (!event) return next(new ApiError(404, 'Event not found'));
    sendSuccess(res, { event: serializeEvent(event) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/events/:id/status
export const patchEventStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'planning', 'pending'].includes(status)) {
      return next(new ApiError(422, 'Invalid status value'));
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { status },
      { new: true }
    );

    if (!event) return next(new ApiError(404, 'Event not found'));
    sendSuccess(res, { event: serializeEvent(event) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/events/:id
export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!event) return next(new ApiError(404, 'Event not found'));
    sendSuccess(res, { id: req.params.id }, 'Event deleted');
  } catch (err) {
    next(err);
  }
};
