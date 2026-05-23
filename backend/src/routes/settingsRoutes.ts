import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireOwnerOrPartner } from '../helpers/authHelpers';
import {
  getSettings,
  updateProfile,
  updateWedding,
  updateNotifications,
  deleteAccount,
  getPartner,
  invitePartner,
  acceptInvite,
  removePartner,
} from '../controllers/settingsController';

const router = Router();

router.use(protect);

router.get('/',                   getSettings);
router.patch('/profile',          requireOwnerOrPartner, updateProfile);
router.patch('/wedding',          requireOwnerOrPartner, updateWedding);
router.patch('/notifications',    updateNotifications);
router.delete('/account',         requireOwnerOrPartner, deleteAccount);

router.get('/partner',            requireOwnerOrPartner, getPartner);
router.post('/partner/invite',    requireOwnerOrPartner, invitePartner);
router.post('/partner/accept',    acceptInvite);
router.delete('/partner',         requireOwnerOrPartner, removePartner);

export default router;
