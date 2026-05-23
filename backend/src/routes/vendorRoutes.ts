import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import {
  getVendors,
  createVendor,
  updateVendor,
  patchVendorStatus,
  deleteVendor,
  addVendorAttachment,
  removeVendorAttachment,
} from '../controllers/vendorController';
import { makeUpload } from '../middleware/upload';
import ApiError from '../utils/ApiError';

const router = Router();
const upload = makeUpload('vendors');

router.use(protect);

router.get('/',             getVendors);
router.post('/',            requireWrite, createVendor);
router.put('/:id',          requireWrite, updateVendor);
router.patch('/:id/status', requireWrite, patchVendorStatus);
router.delete('/:id',       requireWrite, deleteVendor);

// Attachment routes — multer error converted to ApiError so the client gets JSON
router.post('/:id/attachments', requireWrite, (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}, addVendorAttachment);

router.delete('/:id/attachments/:fileId', requireWrite, removeVendorAttachment);

export default router;
