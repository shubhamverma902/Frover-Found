import { Router } from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  patchEventStatus,
  deleteEvent,
} from '../controllers/eventController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/',              getEvents);
router.post('/',             createEvent);
router.put('/:id',           updateEvent);
router.patch('/:id/status',  patchEventStatus);
router.delete('/:id',        deleteEvent);

export default router;
