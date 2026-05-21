import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getNotifications, markAllRead } from '../controllers/notificationController';

const router = Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);

export default router;
