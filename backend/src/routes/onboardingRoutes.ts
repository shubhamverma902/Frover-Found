import { Router } from 'express';
import { saveOnboarding, getOnboarding, onboardingValidation } from '../controllers/onboardingController';
import { protect } from '../middleware/auth';

const router = Router();

// All onboarding routes require a valid JWT
router.use(protect);

router.post('/', onboardingValidation, saveOnboarding);
router.get('/',                        getOnboarding);

export default router;
