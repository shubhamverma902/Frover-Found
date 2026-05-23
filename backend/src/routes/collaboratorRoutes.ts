import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireOwnerOrPartner } from '../helpers/authHelpers';
import {
  listCollaborators,
  inviteCollaborator,
  acceptCollaboratorInvite,
  removeCollaborator,
} from '../controllers/collaboratorController';

const router = Router();

router.use(protect);

// Anyone authenticated can accept an invite (collaborators call this before they have a role)
router.post('/accept', acceptCollaboratorInvite);

// All other operations require owner or partner access
router.get('/',         requireOwnerOrPartner, listCollaborators);
router.post('/invite',  requireOwnerOrPartner, inviteCollaborator);
router.delete('/:id',   requireOwnerOrPartner, removeCollaborator);

export default router;
