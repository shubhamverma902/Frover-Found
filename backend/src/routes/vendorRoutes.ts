import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import { uploadAttachmentLimiter } from '../middleware/rateLimiters';
import validate from '../middleware/validate';
import {
  getVendors,
  createVendor,
  updateVendor,
  patchVendorStatus,
  deleteVendor,
  addVendorAttachment,
  removeVendorAttachment,
} from '../controllers/vendorController';
import { makeUpload, uploadErrorMessage } from '../middleware/upload';
import ApiError from '../utils/ApiError';

const router = Router();
const upload = makeUpload('vendors');

const vendorBody = [
  body('name').trim().notEmpty().withMessage('Vendor name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('contact').optional().isLength({ max: 200 }).withMessage('Contact must not exceed 200 characters'),
  body('location').optional().isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes must not exceed 2000 characters'),
  body('status').optional().isIn(['booked', 'shortlisted', 'pending']).withMessage('Invalid status'),
  body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

router.use(protect);

router.get('/',             getVendors);
router.post('/',            requireWrite, vendorBody, validate, createVendor);
router.put('/:id',          requireWrite, vendorBody, validate, updateVendor);
router.patch('/:id/status', requireWrite, [
  body('status').isIn(['booked', 'shortlisted', 'pending']).withMessage('Invalid status'),
], validate, patchVendorStatus);
router.delete('/:id',       requireWrite, deleteVendor);

// Attachment routes — multer error converted to ApiError so the client gets JSON
router.post('/:id/attachments', requireWrite, uploadAttachmentLimiter, (req, res, next) => {
  upload(req, res, err => {
    if (err) return next(new ApiError(400, uploadErrorMessage(err)));
    next();
  });
}, addVendorAttachment);

router.delete('/:id/attachments/:fileId', requireWrite, removeVendorAttachment);

export default router;
