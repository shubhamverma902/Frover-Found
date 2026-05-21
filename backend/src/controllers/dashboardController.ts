import { Response, NextFunction } from 'express';
import User from '../models/User';
import ChecklistCategory from '../models/Checklist';
import { BudgetCategory } from '../models/Budget';
import Guest from '../models/Guest';
import Vendor from '../models/Vendor';
import Activity from '../models/Activity';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { fmtRelative, fmtDateLong } from '../helpers/dateHelpers';

// GET /api/v1/dashboard
export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.user!.id;

    const [user, checklistCats, budgetCats, guestCounts, vendorCounts, activities] = await Promise.all([
      User.findById(uid),
      ChecklistCategory.find({ userId: uid }),
      BudgetCategory.find({ userId: uid }),
      Guest.aggregate([
        { $match: { userId: { $eq: require('mongoose').Types.ObjectId.createFromHexString(uid) } } },
        { $group: { _id: '$rsvp', count: { $sum: 1 } } },
      ]),
      Vendor.aggregate([
        { $match: { userId: { $eq: require('mongoose').Types.ObjectId.createFromHexString(uid) } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Activity.find({ userId: uid }).sort({ createdAt: -1 }).limit(8),
    ]);

    const wp = user?.weddingProfile ?? null;

    // Days left
    const daysLeft = wp?.weddingDate
      ? Math.max(0, Math.ceil((wp.weddingDate.getTime() - Date.now()) / 86400000))
      : null;

    // Tasks
    const allTasks = checklistCats.flatMap(c => c.tasks.map(t => ({
      _id:          t._id,
      label:        t.label,
      due:          t.due,
      done:         t.done,
      category:     c.category,
      categoryIcon: c.icon,
    })));
    const tasksDone  = allTasks.filter(t => t.done).length;
    const tasksTotal = allTasks.length;

    // Upcoming tasks — undone, sorted by due date
    const upcomingTasks = allTasks
      .filter(t => !t.done && t.due)
      .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
      .slice(0, 6)
      .map(t => ({
        _id:          String(t._id),
        label:        t.label,
        due:          t.due,
        done:         t.done,
        categoryIcon: t.categoryIcon,
      }));

    // Budget
    const budgetTotal = user?.weddingProfile?.budget ?? 0;
    const budgetSpent = budgetCats.reduce((s, c) => s + c.expenses.reduce((es, e) => es + e.amount, 0), 0);

    // Guests
    const guestMap  = Object.fromEntries(guestCounts.map((g: any) => [g._id, g.count]));
    const guestsConfirmed = guestMap['confirmed'] ?? 0;
    const guestsTotal     = Object.values(guestMap).reduce((a: any, b: any) => a + b, 0) as number;

    // Vendors
    const vendorMap   = Object.fromEntries(vendorCounts.map((v: any) => [v._id, v.count]));
    const vendorsBooked = vendorMap['booked'] ?? 0;
    const vendorsTotal  = Object.values(vendorMap).reduce((a: any, b: any) => a + b, 0) as number;

    sendSuccess(res, {
      user: {
        name:        user?.name ?? '',
        partner:     wp?.partner2 ?? wp?.partner1 ?? '',
        weddingDate: wp ? fmtDateLong(wp.weddingDate) : '',
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
