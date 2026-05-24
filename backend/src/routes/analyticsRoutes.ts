import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();
router.use(protect);

router.get('/', getAnalytics);

export default router;
