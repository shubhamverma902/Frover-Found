import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getPublicWedding, generatePublicSlug } from '../controllers/publicController';

const router = Router();

// No protect() on GET — public read
router.get('/wedding/:slug', getPublicWedding);

// POST requires auth (owner generates their own slug)
router.post('/wedding/generate', protect, generatePublicSlug);

export default router;
