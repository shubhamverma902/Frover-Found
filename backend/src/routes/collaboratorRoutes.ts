import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireOwnerOrPartner } from '../helpers/authHelpers';
import validate from '../middleware/validate';
import {
  listCollaborators,
  inviteCollaborator,
  acceptCollaboratorInvite,
  removeCollaborator,
  leaveCollaboration,
} from '../controllers/collaboratorController';

const router = Router();

router.use(protect);

// Anyone authenticated can accept an invite (collaborators call this before they have a role)
router.post('/accept', [
  body('token').trim().notEmpty().withMessage('Token is required'),
], validate, acceptCollaboratorInvite);

// Collaborator self-removal — no ownership check; /me must come before /:id
router.delete('/me', leaveCollaboration);

// All other operations require owner or partner access
router.get('/',         requireOwnerOrPartner, listCollaborators);
router.post('/invite',  requireOwnerOrPartner, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['planner', 'viewer']).withMessage("Role must be 'planner' or 'viewer'"),
], validate, inviteCollaborator);
router.delete('/:id',   requireOwnerOrPartner, removeCollaborator);

export default router;
