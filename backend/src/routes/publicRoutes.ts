import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getPublicWedding, generatePublicSlug } from '../controllers/publicController';
import { publicWeddingLimiter } from '../middleware/rateLimiters';

const router = Router();

// No protect() on GET — public read
router.get('/wedding/:slug', publicWeddingLimiter, getPublicWedding);

// POST requires auth (owner generates their own slug)
router.post('/wedding/generate', protect, generatePublicSlug);

export default router;
