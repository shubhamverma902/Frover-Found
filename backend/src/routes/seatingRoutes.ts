import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getTables, createTable, updateTable, deleteTable, assignGuest } from '../controllers/seatingController';

const router = Router();
router.use(protect);

// Static routes before parameterised ones to avoid conflicts
router.post('/assign', assignGuest);

router.get('/',     getTables);
router.post('/',    createTable);
router.put('/:id',  updateTable);
router.delete('/:id', deleteTable);

export default router;
