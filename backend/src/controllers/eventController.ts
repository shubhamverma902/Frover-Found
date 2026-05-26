import path from 'path';
import fs from 'fs';
import { Response, NextFunction } from 'express';
import Event, { EventStatus } from '../models/Event';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { serializeEvent } from '../helpers/serializers';
import { EVENT_SEED_NAMES } from '../constants/eventSeeds';
import { UPLOADS_ROOT } from '../middleware/upload';
import { ownerId } from '../helpers/authHelpers';
import { sanitize, sanitizeOpt } from '../utils/sanitize';
import { parsePage } from '../utils/parsePage';

const MAX_ATTACHMENTS = 5;

// GET /api/v1/events?page=1&limit=20
// Returns paginated events.  On first call (empty list), auto-seeds events
// from the user's onboarding wedding profile.
export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid   = ownerId(req);
    const { page, limit, skip } = parsePage(req.query, 20);

    // Auto-seed on first ever call before running the paginated query
    const existingCount = await Event.countDocuments({ userId: uid });
    if (existingCount === 0) {
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
        await Event.insertMany(seeds);
      }
    }

    const raw     = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const VALID_STATUS = new Set(['confirmed', 'planning', 'pending']);
    const statusParam  = typeof req.query.status === 'string' && VALID_STATUS.has(req.query.status)
      ? req.query.status : null;

    const searchFilter = escaped
      ? { $or: [
          { name:  { $regex: escaped, $options: 'i' } },
          { venue: { $regex: escaped, $options: 'i' } },
        ] }
      : {};
    const statusFilter = statusParam ? { status: statusParam } : {};
    const filter       = { userId: uid, ...searchFilter, ...statusFilter };
    const baseFilter   = { userId: uid };

    const [events, total, grandTotal, confirmed, planning, pending] = await Promise.all([
      Event.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
      Event.countDocuments(baseFilter),
      Event.countDocuments({ ...baseFilter, status: 'confirmed' }),
      Event.countDocuments({ ...baseFilter, status: 'planning' }),
      Event.countDocuments({ ...baseFilter, status: 'pending' }),
    ]);

    sendSuccess(res, {
      events:     events.map(serializeEvent),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      grandTotal,
      confirmed,
      planning,
      pending,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/events
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, date, time, venue, guests, status, desc } = req.body;
    if (!name?.trim() || !date) return next(new ApiError(422, 'Name and date are required'));
    if (desc?.length  > 2000)   return next(new ApiError(422, 'Description must not exceed 2000 characters'));
    if (venue?.length > 200)    return next(new ApiError(422, 'Venue must not exceed 200 characters'));

    const event = await Event.create({
      userId: ownerId(req),
      name:   sanitize(name),
      date:   new Date(date),
      time:   sanitize(time),
      venue:  sanitize(venue),
      guests: Number(guests) || 0,
      status: status ?? 'pending',
      desc:   sanitize(desc),
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
    if (desc?.length  > 2000) return next(new ApiError(422, 'Description must not exceed 2000 characters'));
    if (venue?.length > 200)  return next(new ApiError(422, 'Venue must not exceed 200 characters'));

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: ownerId(req) },
      {
        name:   sanitizeOpt(name),
        date:   date ? new Date(date) : undefined,
        time:   sanitizeOpt(time),
        venue:  sanitizeOpt(venue),
        guests: Number(guests) || 0,
        status: status,
        desc:   sanitizeOpt(desc),
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
      { _id: req.params.id, userId: ownerId(req) },
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
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: ownerId(req) });
    if (!event) return next(new ApiError(404, 'Event not found'));

    if (event.attachments.length > 0) {
      const dir = path.join(UPLOADS_ROOT, 'events', String(req.params.id));
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* dir may not exist */ }
    }

    sendSuccess(res, { id: req.params.id }, 'Event deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/events/:id/attachments
export const addEventAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: ownerId(req) });
    if (!event) return next(new ApiError(404, 'Event not found'));
    if (!req.file)  return next(new ApiError(400, 'No file uploaded'));
    if (event.attachments.length >= MAX_ATTACHMENTS)
      return next(new ApiError(400, `Maximum ${MAX_ATTACHMENTS} attachments allowed`));

    const baseUrl = process.env.BACKEND_URL!;
    event.attachments.push({
      filename:     req.file.filename,
      originalName: req.file.originalname,
      url:          `${baseUrl}/uploads/events/${req.params.id}/${req.file.filename}`,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
      uploadedAt:   new Date(),
    });

    await event.save();
    sendSuccess(res, { event: serializeEvent(event) }, 'File uploaded');
  } catch (err) { next(err); }
};

// DELETE /api/v1/events/:id/attachments/:fileId
export const removeEventAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: ownerId(req) });
    if (!event) return next(new ApiError(404, 'Event not found'));

    const att = event.attachments.id(String(req.params.fileId));
    if (!att) return next(new ApiError(404, 'Attachment not found'));

    const filePath = path.join(UPLOADS_ROOT, 'events', String(req.params.id), att.filename);
    try { fs.unlinkSync(filePath); } catch { /* file already gone */ }

    att.deleteOne();
    await event.save();
    sendSuccess(res, { event: serializeEvent(event) }, 'File removed');
  } catch (err) { next(err); }
};
