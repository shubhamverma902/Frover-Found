import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ownerId } from '../helpers/authHelpers';
import ChecklistCategory from '../models/Checklist';
import { BudgetCategory, BudgetConfig } from '../models/Budget';
import Guest from '../models/Guest';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ── Week helpers ──────────────────────────────────────────────────────────────

const N_WEEKS    = 8;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function buildWeeks(n = N_WEEKS) {
  const now  = new Date();
  const dow  = now.getDay(); // 0 = Sunday
  const base = new Date(now);
  base.setDate(now.getDate() - dow);
  base.setHours(0, 0, 0, 0);

  return Array.from({ length: n }, (_, i) => {
    const start = new Date(base);
    start.setDate(base.getDate() - (n - 1 - i) * 7);
    const label = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return { start, label };
  });
}

// Shared pipeline stage: bucket a date field into a 0-indexed week slot
// relative to windowStart.  Dates outside the window produce negative or ≥N
// values, which are filtered by the $match that must follow.
function weekIdxStage(dateField: string, windowStart: Date) {
  return {
    $addFields: {
      _weekIdx: {
        $floor: {
          $divide: [{ $subtract: [dateField, windowStart] }, MS_PER_WEEK],
        },
      },
    },
  };
}

const AGG_TIMEOUT_MS = 8_000;

// ── GET /api/v1/analytics ─────────────────────────────────────────────────────

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const uid  = ownerId(req);
    const oid  = new Types.ObjectId(uid);
    const weeks = buildWeeks();
    const windowStart = weeks[0].start;

    const [
      budgetSpentAgg,   // total spent across all categories
      budgetBurnAgg,    // weekly expense sums
      budgetConfig,     // configured total budget
      guestStatusAgg,   // count by rsvp status (all time)
      rsvpTrendAgg,     // weekly rsvp counts within window
      taskCatAgg,       // per-category done/total
      taskVelocityAgg,  // weekly completed-task counts within window
    ] = await Promise.all([

      // Total spent: sum all expense amounts in DB — no expense docs shipped
      BudgetCategory.aggregate<{ totalSpent: number }>([
        { $match: { userId: oid } },
        { $project: { _categorySpent: { $sum: '$expenses.amount' } } },
        { $group: { _id: null, totalSpent: { $sum: '$_categorySpent' } } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),

      // Weekly budget burn: unwind expenses, bucket by week index
      BudgetCategory.aggregate<{ _id: number; spent: number }>([
        { $match: { userId: oid } },
        { $unwind: '$expenses' },
        { $match: { 'expenses.date': { $gte: windowStart } } },
        weekIdxStage('$expenses.date', windowStart),
        { $match: { _weekIdx: { $gte: 0, $lt: N_WEEKS } } },
        { $group: { _id: '$_weekIdx', spent: { $sum: '$expenses.amount' } } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),

      BudgetConfig.findOne({ userId: uid }).maxTimeMS(AGG_TIMEOUT_MS).lean(),

      // Guest counts by RSVP status
      Guest.aggregate<{ _id: string; count: number }>([
        { $match: { userId: oid } },
        { $group: { _id: '$rsvp', count: { $sum: 1 } } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),

      // Weekly RSVP responses: bucket updatedAt of non-pending guests
      Guest.aggregate<{ _id: { weekIdx: number; rsvp: string }; count: number }>([
        { $match: { userId: oid, rsvp: { $ne: 'pending' }, updatedAt: { $gte: windowStart } } },
        weekIdxStage('$updatedAt', windowStart),
        { $match: { _weekIdx: { $gte: 0, $lt: N_WEEKS } } },
        { $group: { _id: { weekIdx: '$_weekIdx', rsvp: '$rsvp' }, count: { $sum: 1 } } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),

      // Task breakdown per category — done count computed entirely in MongoDB
      ChecklistCategory.aggregate<{ category: string; done: number; total: number }>([
        { $match: { userId: oid } },
        { $project: {
          category: 1,
          total: { $size: '$tasks' },
          done: {
            $size: { $filter: { input: '$tasks', cond: '$$this.done' } },
          },
        }},
        { $match: { total: { $gt: 0 } } },
        { $sort: { total: -1 } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),

      // Weekly task velocity: unwind tasks, filter completed, bucket completedAt
      ChecklistCategory.aggregate<{ _id: number; completed: number }>([
        { $match: { userId: oid } },
        { $unwind: '$tasks' },
        { $match: { 'tasks.done': true, 'tasks.completedAt': { $gte: windowStart } } },
        weekIdxStage('$tasks.completedAt', windowStart),
        { $match: { _weekIdx: { $gte: 0, $lt: N_WEEKS } } },
        { $group: { _id: '$_weekIdx', completed: { $sum: 1 } } },
      ]).option({ maxTimeMS: AGG_TIMEOUT_MS }),
    ]);

    // ── Assemble response ─────────────────────────────────────────────────────

    const budgetTotal = budgetConfig?.total ?? 0;
    const budgetSpent = budgetSpentAgg[0]?.totalSpent ?? 0;

    // Budget burn — fill 8 slots, accumulate cumulative
    const burnMap = new Map(budgetBurnAgg.map(r => [r._id, r.spent]));
    let cumulative = 0;
    const budgetBurn = weeks.map((w, i) => {
      const spent = burnMap.get(i) ?? 0;
      cumulative += spent;
      return { week: w.label, spent, cumulative };
    });

    // Guest summary
    const guestMap        = Object.fromEntries(guestStatusAgg.map(g => [g._id, g.count]));
    const guestsTotal     = (Object.values(guestMap) as number[]).reduce((a, b) => a + b, 0);
    const guestsConfirmed = guestMap['confirmed'] ?? 0;

    // RSVP trend — fill 8 slots
    const rsvpMap = new Map<number, { confirmed: number; declined: number }>();
    for (const r of rsvpTrendAgg) {
      const slot = rsvpMap.get(r._id.weekIdx) ?? { confirmed: 0, declined: 0 };
      if (r._id.rsvp === 'confirmed') slot.confirmed += r.count;
      if (r._id.rsvp === 'declined')  slot.declined  += r.count;
      rsvpMap.set(r._id.weekIdx, slot);
    }
    const rsvpTrend = weeks.map((w, i) => ({
      week:      w.label,
      confirmed: rsvpMap.get(i)?.confirmed ?? 0,
      declined:  rsvpMap.get(i)?.declined  ?? 0,
    }));

    // Task summary
    const tasksTotal = taskCatAgg.reduce((s, c) => s + c.total, 0);
    const tasksDone  = taskCatAgg.reduce((s, c) => s + c.done,  0);

    // Task velocity — fill 8 slots
    const velocityMap = new Map(taskVelocityAgg.map(r => [r._id, r.completed]));
    const taskVelocity = weeks.map((w, i) => ({
      week:      w.label,
      completed: velocityMap.get(i) ?? 0,
    }));

    sendSuccess(res, {
      summary: {
        budgetSpent,
        budgetTotal,
        burnPct:  budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0,
        rsvpRate: guestsTotal > 0 ? Math.round((guestsConfirmed / guestsTotal) * 100) : 0,
        taskRate: tasksTotal > 0  ? Math.round((tasksDone / tasksTotal) * 100)  : 0,
        guestsTotal,
        guestsConfirmed,
        tasksTotal,
        tasksDone,
      },
      budgetBurn,
      rsvpTrend,
      taskVelocity,
      taskByCategory: taskCatAgg,
    });
  } catch (err) { next(err); }
};
