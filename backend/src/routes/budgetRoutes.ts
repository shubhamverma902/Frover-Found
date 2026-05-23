import { Router } from 'express';
import {
  getBudget,
  updateTotal,
  updateAllocated,
  addExpense,
  deleteExpense,
} from '../controllers/budgetController';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';

const router = Router();

router.use(protect);

router.get('/',                                   getBudget);
router.patch('/total',                            requireWrite, updateTotal);
router.patch('/categories/:id/allocated',         requireWrite, updateAllocated);
router.post('/categories/:id/expenses',           requireWrite, addExpense);
router.delete('/categories/:id/expenses/:expId',  requireWrite, deleteExpense);

export default router;
