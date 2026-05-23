import { Router } from 'express';
import { protect } from '../middleware/auth';
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
router.patch('/profile',          updateProfile);
router.patch('/wedding',          updateWedding);
router.patch('/notifications',    updateNotifications);
router.delete('/account',         deleteAccount);

router.get('/partner',            getPartner);
router.post('/partner/invite',    invitePartner);
router.post('/partner/accept',    acceptInvite);
router.delete('/partner',         removePartner);

export default router;
