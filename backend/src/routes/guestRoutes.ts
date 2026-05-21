import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getGuests, createGuest, patchGuestRsvp, deleteGuest } from '../controllers/guestController';

const router = Router();

router.use(protect);

router.get('/',           getGuests);
router.post('/',          createGuest);
router.patch('/:id/rsvp', patchGuestRsvp);
router.delete('/:id',     deleteGuest);

export default router;
