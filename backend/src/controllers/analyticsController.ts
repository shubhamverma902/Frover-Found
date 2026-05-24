import { Response, NextFunction } from 'express';
import { ownerId } from '../helpers/authHelpers';
import ChecklistCategory from '../models/Checklist';
import { BudgetCategory, BudgetConfig } from '../models/Budget';
import Guest from '../models/Guest';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ── Week helpers ──────────────────────────────────────────────────────────────

interface WeekBand { start: Date; end: Date; label: string }

function buildWeeks(n = 8): WeekBand[] {
  const now  = new Date();
  const dow  = now.getDay(); // 0 = Sunday
  const base = new Date(now);
  base.setDate(now.getDate() - dow);
  base.setHours(0, 0, 0, 0);

  return Array.from({ length: n }, (_, i) => {
    const start = new Date(base);
    start.setDate(base.getDate() - (n - 1 - i) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return { start, end, label };
  });
}

function inWeek(date: Date | undefined | null, band: WeekBand): boolean {
  if (!date) return false;
  const t = new Date(date).getTime();
  return t >= band.start.getTime() && t <= band.end.getTime();
}

// ── GET /api/v1/analytics ─────────────────────────────────────────────────────

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const uid = ownerId(req);

    const [budgetConfig, budgetCats, checklistCats, guests] = await Promise.all([
      BudgetConfig.findOne({ userId: uid }),
      BudgetCategory.find({ userId: uid }),
      ChecklistCategory.find({ userId: uid }),
      Guest.find({ userId: uid }, { rsvp: 1, updatedAt: 1 }),
    ]);

    const weeks = buildWeeks(8);

    // ── Budget burn ───────────────────────────────────────────────────────────
    const allExpenses = budgetCats.flatMap(c => c.expenses);

    let cumulative = 0;
    const budgetBurn = weeks.map(w => {
      const spent = allExpenses
        .filter(e => inWeek(e.date, w))
        .reduce((s, e) => s + e.amount, 0);
      cumulative += spent;
      return { week: w.label, spent, cumulative };
    });

    const budgetTotal = budgetConfig?.total ?? 0;
    const budgetSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

    // ── RSVP trend ────────────────────────────────────────────────────────────
    // Use updatedAt on non-pending guests as proxy for when they responded
    const respondedGuests = guests.filter(g => g.rsvp !== 'pending');

    const rsvpTrend = weeks.map(w => ({
      week:      w.label,
      confirmed: respondedGuests.filter(g => g.rsvp === 'confirmed' && inWeek(g.updatedAt, w)).length,
      declined:  respondedGuests.filter(g => g.rsvp === 'declined'  && inWeek(g.updatedAt, w)).length,
    }));

    const guestsTotal     = guests.length;
    const guestsConfirmed = guests.filter(g => g.rsvp === 'confirmed').length;

    // ── Task velocity (uses completedAt, stamped going forward) ───────────────
    const allTasks = checklistCats.flatMap(c => c.tasks);

    const taskVelocity = weeks.map(w => ({
      week:      w.label,
      completed: allTasks.filter(t => t.done && inWeek(t.completedAt, w)).length,
    }));

    // ── Task completion by category ───────────────────────────────────────────
    const taskByCategory = checklistCats
      .filter(c => c.tasks.length > 0)
      .map(c => ({
        category: c.category,
        done:     c.tasks.filter(t => t.done).length,
        total:    c.tasks.length,
      }))
      .sort((a, b) => b.total - a.total);

    const tasksTotal = allTasks.length;
    const tasksDone  = allTasks.filter(t => t.done).length;

    // ── Response ──────────────────────────────────────────────────────────────
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
      taskByCategory,
    });
  } catch (err) { next(err); }
};
