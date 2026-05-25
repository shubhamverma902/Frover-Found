import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import User from '../models/User';
import type { ICollaborator } from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { signToken } from '../helpers/authHelpers';
import logAudit from '../utils/logAudit';

const serializeCollab = (c: ICollaborator) => ({
  _id:       String(c._id),
  email:     c.email,
  name:      c.name ?? '',
  role:      c.role as 'planner' | 'viewer',
  accepted:  !!c.linkedAt,
  linkedAt:  c.linkedAt?.toISOString() ?? null,
});

// GET /api/v1/collaborators
export const listCollaborators = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));
    sendSuccess(res, { collaborators: user.collaborators.map(serializeCollab) });
  } catch (err) { next(err); }
};

// POST /api/v1/collaborators/invite
// body: { email, role: 'planner' | 'viewer' }
export const inviteCollaborator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role } = req.body;
    if (!email?.trim())                           return next(new ApiError(422, 'Email is required'));
    if (!['planner', 'viewer'].includes(role))    return next(new ApiError(422, "Role must be 'planner' or 'viewer'"));
    if (email.toLowerCase() === req.user!.email.toLowerCase())
      return next(new ApiError(422, 'You cannot invite yourself'));

    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    // Prevent duplicate pending invites for the same email
    const already = user.collaborators.find(c => c.email === email.toLowerCase());
    if (already && !already.linkedAt)
      return next(new ApiError(409, 'A pending invite for this email already exists'));

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 h

    user.collaborators.push({
      email:        email.trim().toLowerCase(),
      role,
      inviteToken:  token,
      inviteExpiry: expiry,
    });
    await user.save();

    const appUrl    = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}&type=collab`;

    sendSuccess(res, { inviteUrl, email: email.trim().toLowerCase(), role, expiresAt: expiry.toISOString() }, 'Invite created', 201);
  } catch (err) { next(err); }
};

// POST /api/v1/collaborators/accept
// body: { token }
export const acceptCollaboratorInvite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { token } = req.body;
    if (!token) return next(new ApiError(422, 'Token is required'));

    let newToken!: string;
    let role!: string;

    await session.withTransaction(async () => {
      const owner = await User.findOne({
        'collaborators.inviteToken':  token,
        'collaborators.inviteExpiry': { $gt: new Date() },
      }).session(session);
      if (!owner) throw new ApiError(404, 'Invite not found or has expired');
      if (String(owner._id) === req.user!.id)
        throw new ApiError(422, 'You cannot accept your own invite');

      const me = await User.findById(req.user!.id).session(session);
      if (!me) throw new ApiError(404, 'User not found');
      if (me.dataOwner)
        throw new ApiError(409, 'Your account is already linked to a wedding plan');

      const collab = owner.collaborators.find(c => c.inviteToken === token)!;
      role = collab.role;
      const now = new Date();

      collab.userId       = me._id as Types.ObjectId;
      collab.name         = me.name;
      collab.linkedAt     = now;
      collab.inviteToken  = undefined;
      collab.inviteExpiry = undefined;
      await owner.save({ session });

      await User.findByIdAndUpdate(me._id, {
        dataOwner:           owner._id,
        collaboratorRole:    role,
        onboardingCompleted: true,
      }, { session });

      newToken = signToken(req.user!.id, req.user!.email, req.user!.role, String(owner._id), role);
    });

    logAudit(req, 'collaborator.invite_accepted', req.user!.id, { role });
    sendSuccess(res, { token: newToken, role }, 'Joined as collaborator');
  } catch (err) { next(err); } finally { session.endSession(); }
};

// DELETE /api/v1/collaborators/me  (collaborator removes themselves)
export const leaveCollaboration = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const ownerId = req.user!.dataOwnerId;
    if (!ownerId)
      return next(new ApiError(403, 'Only collaborators can leave a wedding plan'));

    await session.withTransaction(async () => {
      const owner = await User.findById(ownerId).session(session);
      if (!owner) throw new ApiError(404, 'Owner not found');

      const collab = owner.collaborators.find(c => String(c.userId) === req.user!.id);
      if (!collab) throw new ApiError(404, 'Collaborator entry not found');

      collab.deleteOne();
      await owner.save({ session });

      await User.findByIdAndUpdate(req.user!.id, { dataOwner: null, collaboratorRole: null }, { session });
    });

    logAudit(req, 'collaborator.left', req.user!.id);
    sendSuccess(res, null, 'You have left the wedding plan');
  } catch (err) { next(err); } finally { session.endSession(); }
};

// DELETE /api/v1/collaborators/:id  (the subdoc _id)
export const removeCollaborator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    let remaining: ReturnType<typeof serializeCollab>[] = [];

    await session.withTransaction(async () => {
      const user = await User.findById(req.user!.id).session(session);
      if (!user) throw new ApiError(404, 'User not found');

      const collab = user.collaborators.id(String(req.params.id));
      if (!collab) throw new ApiError(404, 'Collaborator not found');

      const linkedUserId = collab.userId;
      collab.deleteOne();
      await user.save({ session });

      if (linkedUserId) {
        await User.findByIdAndUpdate(linkedUserId, {
          dataOwner: null, collaboratorRole: null,
        }, { session });
      }

      remaining = user.collaborators.map(serializeCollab);
    });

    logAudit(req, 'collaborator.removed', req.user!.id, { collaboratorId: req.params.id });
    sendSuccess(res, { collaborators: remaining }, 'Collaborator removed');
  } catch (err) { next(err); } finally { session.endSession(); }
};
