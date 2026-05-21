import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getSettings,
  updateProfile,
  updateWedding,
  updateNotifications,
  deleteAccount,
} from '../controllers/settingsController';

const router = Router();

router.use(protect);

router.get('/',                   getSettings);
router.patch('/profile',          updateProfile);
router.patch('/wedding',          updateWedding);
router.patch('/notifications',    updateNotifications);
router.delete('/account',         deleteAccount);

export default router;
