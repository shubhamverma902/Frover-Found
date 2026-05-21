import { Router } from 'express';
import {
  getChecklist,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
} from '../controllers/checklistController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/',                       getChecklist);
router.post('/tasks',                 createTask);
router.patch('/tasks/:taskId/toggle', toggleTask);
router.put('/tasks/:taskId',          updateTask);
router.delete('/tasks/:taskId',       deleteTask);

export default router;
