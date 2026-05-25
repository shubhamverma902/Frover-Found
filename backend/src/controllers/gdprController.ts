import fs from 'fs';
import path from 'path';
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Vendor from '../models/Vendor';
import Event from '../models/Event';
import Guest from '../models/Guest';
import Activity from '../models/Activity';
import AuditLog from '../models/AuditLog';
import ChecklistCategory from '../models/Checklist';
import { BudgetCategory, BudgetConfig } from '../models/Budget';
import SeatingTable from '../models/SeatingTable';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logAudit from '../utils/logAudit';
import { UPLOADS_ROOT } from '../middleware/upload';

// ── GET /api/v1/me/export ─────────────────────────────────────────────────────
// GDPR Article 20 — Right of data portability.
// Returns a single JSON file with all personal data held for the requesting
// user. Sensitive auth fields (password hash, reset tokens, etc.) are omitted.

export const exportMyData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = req.user!.id;
    // For collaborators: the planning data belongs to the owner; the collaborator
    // only has their own User document. Use dataOwnerId when querying collections.
    const dataUid = req.user!.dataOwnerId ?? uid;

    const [
      user,
      vendors,
      events,
      guests,
      checklist,
      budgetCategories,
      budgetConfig,
      seating,
    ] = await Promise.all([
      User.findById(uid)
        .select('-password -passwordResetToken -passwordResetExpiry -partnerInviteToken -inviteToken -loginAttempts -lockUntil -tokenVersion')
        .lean(),
      Vendor.find({ userId: dataUid }).lean(),
      Event.find({ userId: dataUid }).lean(),
      Guest.find({ userId: dataUid }).lean(),
      ChecklistCategory.find({ userId: dataUid }).lean(),
      BudgetCategory.find({ userId: dataUid }).lean(),
      BudgetConfig.findOne({ userId: dataUid }).lean(),
      SeatingTable.find({ userId: dataUid }).lean(),
    ]);

    if (!user) return next(new ApiError(404, 'User not found'));

    logAudit(req, 'gdpr.export', uid);

    const filename = `frover-data-${uid}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      exportedAt: new Date().toISOString(),
      profile: user,
      vendors,
      events,
      guests,
      checklist,
      budget: { config: budgetConfig, categories: budgetCategories },
      seating,
    });
  } catch (err) { next(err); }
};

// ── DELETE /api/v1/me ─────────────────────────────────────────────────────────
// GDPR Article 17 — Right to erasure ("right to be forgotten").
// Deletes the user document, all associated planning data, and uploaded files.
// Runs in a transaction so a partial failure leaves the DB consistent.

export const eraseMyData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const uid     = req.user!.id;
    const dataUid = req.user!.dataOwnerId ?? uid;
    const oid     = new mongoose.Types.ObjectId(dataUid);

    // Capture entity IDs before deletion so we can clean up files afterwards.
    // (The directories are named after the entity _id, not the userId.)
    const [vendorDocs, eventDocs] = await Promise.all([
      Vendor.find({ userId: oid }).select('_id').lean(),
      Event.find({ userId: oid }).select('_id').lean(),
    ]);

    await session.withTransaction(async () => {
      // If this account is a collaborator, remove it from the owner's array
      if (req.user!.dataOwnerId) {
        await User.findByIdAndUpdate(
          req.user!.dataOwnerId,
          { $pull: { collaborators: { userId: new mongoose.Types.ObjectId(uid) } } },
          { session },
        );
      }

      // If this account has a linked partner, sever both sides
      const me = await User.findById(uid).session(session);
      if (me?.linkedPartner) {
        await User.findByIdAndUpdate(me.linkedPartner, {
          linkedPartner: null, linkedAt: null, dataOwner: null,
        }, { session });
      }

      // Erase all planning data owned by this user / their data owner
      await Promise.all([
        Vendor.deleteMany({ userId: oid }, { session }),
        Event.deleteMany({ userId: oid }, { session }),
        Guest.deleteMany({ userId: oid }, { session }),
        ChecklistCategory.deleteMany({ userId: oid }, { session }),
        BudgetCategory.deleteMany({ userId: oid }, { session }),
        BudgetConfig.deleteMany({ userId: oid }, { session }),
        SeatingTable.deleteMany({ userId: oid }, { session }),
        Activity.deleteMany({ userId: oid }, { session }),
        AuditLog.deleteMany({ userId: new mongoose.Types.ObjectId(uid) }, { session }),
      ]);

      // Delete the user account last
      await User.findByIdAndDelete(uid, { session });
    });

    // Delete uploaded files from disk — best-effort outside the transaction so
    // a filesystem error cannot roll back the already-committed DB erasure.
    const rmDir = (dir: string) => {
      try { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); }
      catch { /* ignore — files may have already been removed */ }
    };
    for (const v of vendorDocs) rmDir(path.join(UPLOADS_ROOT, 'vendors', String(v._id)));
    for (const e of eventDocs)  rmDir(path.join(UPLOADS_ROOT, 'events',  String(e._id)));

    logAudit(req, 'gdpr.erasure', uid);

    // Clear the session cookie so the client is logged out immediately
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path:     '/api/v1/auth/refresh',
    });
    sendSuccess(res, null, 'Your account and all associated data have been permanently deleted');
  } catch (err) { next(err); } finally { session.endSession(); }
};
