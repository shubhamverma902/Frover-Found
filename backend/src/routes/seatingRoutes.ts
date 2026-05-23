import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';
import { getTables, createTable, updateTable, deleteTable, assignGuest } from '../controllers/seatingController';

const router = Router();
router.use(protect);

// Static routes before parameterised ones to avoid conflicts
router.post('/assign', requireWrite, assignGuest);

router.get('/',       getTables);
router.post('/',      requireWrite, createTable);
router.put('/:id',    requireWrite, updateTable);
router.delete('/:id', requireWrite, deleteTable);

export default router;
