import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import type { ICollaborator } from '../models/User';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { signToken } from '../helpers/authHelpers';

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
  try {
    const { token } = req.body;
    if (!token) return next(new ApiError(422, 'Token is required'));

    // Find the owner whose collaborators array has this token
    const owner = await User.findOne({
      'collaborators.inviteToken':  token,
      'collaborators.inviteExpiry': { $gt: new Date() },
    });
    if (!owner) return next(new ApiError(404, 'Invite not found or has expired'));
    if (String(owner._id) === req.user!.id)
      return next(new ApiError(422, 'You cannot accept your own invite'));

    const me = await User.findById(req.user!.id);
    if (!me) return next(new ApiError(404, 'User not found'));
    if (me.dataOwner)
      return next(new ApiError(409, 'Your account is already linked to a wedding plan'));

    const collab = owner.collaborators.find(c => c.inviteToken === token)!;
    const role   = collab.role;
    const now    = new Date();

    // Update collaborator entry on owner's doc
    collab.userId       = me._id as Types.ObjectId;
    collab.name         = me.name;
    collab.linkedAt     = now;
    collab.inviteToken  = undefined;
    collab.inviteExpiry = undefined;
    await owner.save();

    // Mark the collaborator's own account
    await User.findByIdAndUpdate(me._id, {
      dataOwner:           owner._id,
      collaboratorRole:    role,
      onboardingCompleted: true,   // collaborators skip onboarding
    });

    const newToken = signToken(req.user!.id, req.user!.email, req.user!.role, String(owner._id), role);
    sendSuccess(res, { token: newToken, role }, 'Joined as collaborator');
  } catch (err) { next(err); }
};

// DELETE /api/v1/collaborators/me  (collaborator removes themselves)
export const leaveCollaboration = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ownerId = req.user!.dataOwnerId;
    if (!ownerId)
      return next(new ApiError(403, 'Only collaborators can leave a wedding plan'));

    const owner = await User.findById(ownerId);
    if (!owner) return next(new ApiError(404, 'Owner not found'));

    const collab = owner.collaborators.find(c => String(c.userId) === req.user!.id);
    if (!collab) return next(new ApiError(404, 'Collaborator entry not found'));

    collab.deleteOne();
    await owner.save();

    // Clear this account's link so future requests get a fresh token
    await User.findByIdAndUpdate(req.user!.id, { dataOwner: null, collaboratorRole: null });

    sendSuccess(res, null, 'You have left the wedding plan');
  } catch (err) { next(err); }
};

// DELETE /api/v1/collaborators/:id  (the subdoc _id)
export const removeCollaborator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return next(new ApiError(404, 'User not found'));

    const collab = user.collaborators.id(String(req.params.id));
    if (!collab) return next(new ApiError(404, 'Collaborator not found'));

    const linkedUserId = collab.userId;
    collab.deleteOne();
    await user.save();

    // Clear the collaborator's own account so their next token refresh works correctly
    if (linkedUserId) {
      await User.findByIdAndUpdate(linkedUserId, {
        dataOwner: null, collaboratorRole: null,
      });
    }

    sendSuccess(res, { collaborators: user.collaborators.map(serializeCollab) }, 'Collaborator removed');
  } catch (err) { next(err); }
};
