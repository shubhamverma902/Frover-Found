import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getVendors, createVendor, updateVendor, patchVendorStatus, deleteVendor } from '../controllers/vendorController';

const router = Router();

router.use(protect);

router.get('/',              getVendors);
router.post('/',             createVendor);
router.put('/:id',           updateVendor);
router.patch('/:id/status',  patchVendorStatus);
router.delete('/:id',        deleteVendor);

export default router;
