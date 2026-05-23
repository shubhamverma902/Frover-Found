import { Router } from 'express';
import { requireWrite } from '../helpers/authHelpers';
import {
  getEvents,
  createEvent,
  updateEvent,
  patchEventStatus,
  deleteEvent,
  addEventAttachment,
  removeEventAttachment,
} from '../controllers/eventController';
import { protect } from '../middleware/auth';
import { makeUpload } from '../middleware/upload';
import ApiError from '../utils/ApiError';

const router = Router();
const upload = makeUpload('events');

router.use(protect);

router.get('/',             getEvents);
router.post('/',            requireWrite, createEvent);
router.put('/:id',          requireWrite, updateEvent);
router.patch('/:id/status', requireWrite, patchEventStatus);
router.delete('/:id',       requireWrite, deleteEvent);

// Attachment routes — multer error converted to ApiError so the client gets JSON
router.post('/:id/attachments', requireWrite, (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}, addEventAttachment);

router.delete('/:id/attachments/:fileId', requireWrite, removeEventAttachment);

export default router;
