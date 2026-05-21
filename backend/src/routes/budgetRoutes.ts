import { Router } from 'express';
import {
  getBudget,
  updateTotal,
  updateAllocated,
  addExpense,
  deleteExpense,
} from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/',                                   getBudget);
router.patch('/total',                            updateTotal);
router.patch('/categories/:id/allocated',         updateAllocated);
router.post('/categories/:id/expenses',           addExpense);
router.delete('/categories/:id/expenses/:expId',  deleteExpense);

export default router;
