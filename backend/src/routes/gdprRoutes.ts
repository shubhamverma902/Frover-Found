import { Router } from 'express';
import { protect } from '../middleware/auth';
import { exportMyData, eraseMyData } from '../controllers/gdprController';

const router = Router();

router.use(protect);

router.get('/export', exportMyData);
router.delete('/',    eraseMyData);

export default router;
