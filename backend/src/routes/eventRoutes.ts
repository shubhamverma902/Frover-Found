import { Router } from 'express';
import { body } from 'express-validator';
import { requireWrite } from '../helpers/authHelpers';
import { uploadAttachmentLimiter } from '../middleware/rateLimiters';
import validate from '../middleware/validate';
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
import { makeUpload, uploadErrorMessage } from '../middleware/upload';
import ApiError from '../utils/ApiError';

const router = Router();
const upload = makeUpload('events');

const eventBody = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('guests').isInt({ min: 0 }).withMessage('Guests must be a non-negative integer'),
  body('status').isIn(['confirmed', 'planning', 'pending']).withMessage('Invalid status'),
];

router.use(protect);

router.get('/',             getEvents);
router.post('/',            requireWrite, eventBody, validate, createEvent);
router.put('/:id',          requireWrite, eventBody, validate, updateEvent);
router.patch('/:id/status', requireWrite, [
  body('status').isIn(['confirmed', 'planning', 'pending']).withMessage('Invalid status'),
], validate, patchEventStatus);
router.delete('/:id',       requireWrite, deleteEvent);

// Attachment routes — multer error converted to ApiError so the client gets JSON
router.post('/:id/attachments', requireWrite, uploadAttachmentLimiter, (req, res, next) => {
  upload(req, res, err => {
    if (err) return next(new ApiError(400, uploadErrorMessage(err)));
    next();
  });
}, addEventAttachment);

router.delete('/:id/attachments/:fileId', requireWrite, removeEventAttachment);

export default router;
