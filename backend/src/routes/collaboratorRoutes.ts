import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireOwnerOrPartner } from '../helpers/authHelpers';
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
router.post('/accept', acceptCollaboratorInvite);

// Collaborator self-removal — no ownership check; /me must come before /:id
router.delete('/me', leaveCollaboration);

// All other operations require owner or partner access
router.get('/',         requireOwnerOrPartner, listCollaborators);
router.post('/invite',  requireOwnerOrPartner, inviteCollaborator);
router.delete('/:id',   requireOwnerOrPartner, removeCollaborator);

export default router;
