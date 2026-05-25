import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import { getGuests, createGuest, patchGuestRsvp, deleteGuest, importGuests, exportGuests } from '../controllers/guestController';
import { csvUpload } from '../middleware/upload';
import { csvImportLimiter } from '../middleware/rateLimiters';

const router = Router();

router.use(protect);

// static sub-paths must come before /:id
router.get('/export',          exportGuests);
router.post('/import',         requireWrite, csvImportLimiter, csvUpload.single('file'), importGuests);

router.get('/',                getGuests);
router.post('/',               requireWrite, createGuest);
router.patch('/:id/rsvp',     requireWrite, patchGuestRsvp);
router.delete('/:id',         requireWrite, deleteGuest);

export default router;
