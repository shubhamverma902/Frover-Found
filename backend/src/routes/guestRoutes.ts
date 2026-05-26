import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import validate from '../middleware/validate';
import { getGuests, createGuest, updateGuest, patchGuestRsvp, deleteGuest, importGuests, exportGuests } from '../controllers/guestController';
import { csvUpload } from '../middleware/upload';
import { csvImportLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(protect);

// static sub-paths must come before /:id
router.get('/export',          exportGuests);
router.post('/import',         requireWrite, csvImportLimiter, csvUpload.single('file'), importGuests);

router.get('/',                getGuests);
router.post('/',               requireWrite, [
  body('name').trim().notEmpty().withMessage('Guest name is required'),
  body('rsvp').optional().isIn(['confirmed', 'pending', 'declined']).withMessage('Invalid RSVP value'),
  body('meal').optional().isIn(['Veg', 'Non-veg', 'Jain']).withMessage('Invalid meal preference'),
  body('plusOne').optional().isBoolean().withMessage('plusOne must be a boolean'),
], validate, createGuest);
router.put('/:id',            requireWrite, [
  body('name').trim().notEmpty().withMessage('Guest name is required'),
  body('rsvp').optional().isIn(['confirmed', 'pending', 'declined']).withMessage('Invalid RSVP value'),
  body('meal').optional().isIn(['Veg', 'Non-veg', 'Jain']).withMessage('Invalid meal preference'),
  body('plusOne').optional().isBoolean().withMessage('plusOne must be a boolean'),
], validate, updateGuest);
router.patch('/:id/rsvp',     requireWrite, [
  body('rsvp').isIn(['confirmed', 'pending', 'declined']).withMessage('Invalid RSVP value'),
], validate, patchGuestRsvp);
router.delete('/:id',         requireWrite, deleteGuest);

export default router;
