import { Router } from 'express';
import { protect } from '../middleware/auth';
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
router.post('/',            createVendor);
router.put('/:id',          updateVendor);
router.patch('/:id/status', patchVendorStatus);
router.delete('/:id',       deleteVendor);

// Attachment routes — multer error converted to ApiError so the client gets JSON
router.post('/:id/attachments', (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) return next(new ApiError(400, err.message));
    next();
  });
}, addVendorAttachment);

router.delete('/:id/attachments/:fileId', removeVendorAttachment);

export default router;
