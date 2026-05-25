import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import { ownerId } from '../helpers/authHelpers';
import ChecklistCategory from '../models/Checklist';
import { BudgetCategory } from '../models/Budget';
import Guest from '../models/Guest';
import Vendor from '../models/Vendor';
import Activity from '../models/Activity';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { fmtRelative, fmtDateLong } from '../helpers/dateHelpers';

// ── Aggregation result shapes ─────────────────────────────

interface ChecklistFacet {
  stats:    { total: number; done: number }[];
  upcoming: { _id: Types.ObjectId; label: string; due: string; done: boolean; categoryIcon: string }[];
}

interface StatusCount { _id: string; count: number; }
interface SpentResult { totalSpent: number; }

// GET /api/v1/dashboard
export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = ownerId(req);
    const oid = new Types.ObjectId(uid);

    const [user, [facet], [budgetAgg], guestCounts, vendorCounts, activities] = await Promise.all([

      User.findById(uid).lean(),

      // Checklist — one $facet pipeline: task stats + upcoming tasks
      ChecklistCategory.aggregate<ChecklistFacet>([
        { $match: { userId: oid } },
        { $unwind: { path: '$tasks', preserveNullAndEmptyArrays: false } },
        { $facet: {
          stats: [
            { $group: {
              _id:   null,
              total: { $sum: 1 },
              done:  { $sum: { $cond: ['$tasks.done', 1, 0] } },
            }},
          ],
          upcoming: [
            { $match: { 'tasks.done': false, 'tasks.due': { $gt: '' } } },
            { $project: {
              _id:          '$tasks._id',
              label:        '$tasks.label',
              due:          '$tasks.due',
              done:         '$tasks.done',
              categoryIcon: '$icon',
            }},
          ],
        }},
      ]),

      // Budget — sum all expenses in the DB, no expense documents shipped to Node
      BudgetCategory.aggregate<SpentResult>([
        { $match: { userId: oid } },
        { $project: { categorySpent: { $sum: '$expenses.amount' } } },
        { $group: { _id: null, totalSpent: { $sum: '$categorySpent' } } },
      ]),

      // Guest counts by RSVP status
      Guest.aggregate<StatusCount>([
        { $match: { userId: oid } },
        { $group: { _id: '$rsvp', count: { $sum: 1 } } },
      ]),

      // Vendor counts by booking status
      Vendor.aggregate<StatusCount>([
        { $match: { userId: oid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Activity.find({ userId: uid }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const wp = user?.weddingProfile ?? null;

    const daysLeft = wp?.weddingDate
      ? Math.max(0, Math.ceil((new Date(wp.weddingDate).getTime() - Date.now()) / 86400000))
      : null;

    // Task stats
    const tasksTotal = facet?.stats[0]?.total ?? 0;
    const tasksDone  = facet?.stats[0]?.done  ?? 0;

    // Upcoming: sort by due string in JS (format may vary), take first 6
    const upcomingTasks = (facet?.upcoming ?? [])
      .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
      .slice(0, 6)
      .map(t => ({
        _id:          String(t._id),
        label:        t.label,
        due:          t.due,
        done:         false as const,
        categoryIcon: t.categoryIcon,
      }));

    // Budget
    const budgetTotal = wp?.budget ?? 0;
    const budgetSpent = budgetAgg?.totalSpent ?? 0;

    // Guests
    const guestMap        = Object.fromEntries(guestCounts.map(g => [g._id, g.count]));
    const guestsTotal     = (Object.values(guestMap) as number[]).reduce((a, b) => a + b, 0);
    const guestsConfirmed = guestMap['confirmed'] ?? 0;

    // Vendors
    const vendorMap      = Object.fromEntries(vendorCounts.map(v => [v._id, v.count]));
    const vendorsTotal   = (Object.values(vendorMap) as number[]).reduce((a, b) => a + b, 0);
    const vendorsBooked  = vendorMap['booked'] ?? 0;

    sendSuccess(res, {
      user: {
        name:        user?.name ?? '',
        partner:     wp?.partner2 ?? wp?.partner1 ?? '',
        weddingDate: wp ? fmtDateLong(new Date(wp.weddingDate)) : '',
        venue:       wp?.venue ?? '',
        daysLeft,
      },
      stats: {
        daysLeft,
        tasksTotal,
        tasksDone,
        budgetTotal,
        budgetSpent,
        guestsTotal,
        guestsConfirmed,
        vendorsTotal,
        vendorsBooked,
      },
      tasks:    upcomingTasks,
      activity: activities.map(a => ({
        _id:  String(a._id),
        icon: a.icon,
        text: a.text,
        time: fmtRelative(a.createdAt),
      })),
    });
  } catch (err) { next(err); }
};
