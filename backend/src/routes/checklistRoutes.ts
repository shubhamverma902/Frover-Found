import { Router } from 'express';
import {
  getChecklist,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
} from '../controllers/checklistController';
import { protect } from '../middleware/auth';
import { requireWrite } from '../helpers/authHelpers';

const router = Router();

router.use(protect);

router.get('/',                       getChecklist);
router.post('/tasks',                 requireWrite, createTask);
router.patch('/tasks/:taskId/toggle', requireWrite, toggleTask);
router.put('/tasks/:taskId',          requireWrite, updateTask);
router.delete('/tasks/:taskId',       requireWrite, deleteTask);

export default router;
