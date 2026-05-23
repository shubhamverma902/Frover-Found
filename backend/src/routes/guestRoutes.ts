import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import { getGuests, createGuest, patchGuestRsvp, deleteGuest } from '../controllers/guestController';

const router = Router();

router.use(protect);

router.get('/',           getGuests);
router.post('/',          requireWrite, createGuest);
router.patch('/:id/rsvp', requireWrite, patchGuestRsvp);
router.delete('/:id',     requireWrite, deleteGuest);

export default router;
