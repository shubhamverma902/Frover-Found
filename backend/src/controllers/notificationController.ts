import { Response, NextFunction } from 'express';
import Activity from '../models/Activity';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { fmtRelative } from '../helpers/dateHelpers';
import { ownerId } from '../helpers/authHelpers';

// GET /api/v1/notifications
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = ownerId(req);
    const [items, unreadCount] = await Promise.all([
      Activity.find({ userId: uid }).sort({ createdAt: -1 }).limit(20),
      Activity.countDocuments({ userId: uid, read: { $ne: true } }),
    ]);
    sendSuccess(res, {
      notifications: items.map(a => ({
        _id:  String(a._id),
        icon: a.icon,
        text: a.text,
        time: fmtRelative(a.createdAt),
        read: a.read ?? false,
      })),
      unreadCount,
    });
  } catch (err) { next(err); }
};

// PATCH /api/v1/notifications/read-all
export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = ownerId(req);
    await Activity.updateMany({ userId: uid, read: { $ne: true } }, { $set: { read: true } });
    sendSuccess(res, { unreadCount: 0 });
  } catch (err) { next(err); }
};
