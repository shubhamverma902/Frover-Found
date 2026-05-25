import { Response, NextFunction } from 'express';
import ChecklistCategory from '../models/Checklist';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logActivity from '../utils/logActivity';
import { serializeChecklistCategory } from '../helpers/serializers';
import { SEED_CATEGORIES } from '../constants/checklistSeeds';
import { ownerId } from '../helpers/authHelpers';
import { sanitize } from '../utils/sanitize';

// GET /api/v1/checklist
export const getChecklist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = ownerId(req);
    let cats = await ChecklistCategory.find({ userId: uid }).sort({ createdAt: 1 });

    if (cats.length === 0) {
      const inserted = await ChecklistCategory.insertMany(
        SEED_CATEGORIES.map(c => ({ ...c, userId: uid }))
      );
      cats = inserted as unknown as typeof cats;
    }

    sendSuccess(res, { categories: cats.map(serializeChecklistCategory) });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/checklist/tasks
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, label, due } = req.body;
    if (!label?.trim() || !category) return next(new ApiError(422, 'Category and label are required'));

    const cat = await ChecklistCategory.findOneAndUpdate(
      { userId: ownerId(req), category },
      { $push: { tasks: { label: sanitize(label), due: sanitize(due) || 'No due date', done: false } } },
      { new: true }
    );

    if (!cat) return next(new ApiError(404, 'Category not found'));
    sendSuccess(res, { category: serializeChecklistCategory(cat) }, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/checklist/tasks/:taskId/toggle
export const toggleTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid = ownerId(req);
    const cat = await ChecklistCategory.findOne({
      userId: uid,
      'tasks._id': req.params.taskId,
    });
    if (!cat) return next(new ApiError(404, 'Task not found'));

    const task = cat.tasks.find(t => String(t._id) === req.params.taskId);
    if (!task) return next(new ApiError(404, 'Task not found'));
    task.done        = !task.done;
    task.completedAt = task.done ? new Date() : null as unknown as Date;
    await cat.save();
    if (task.done) logActivity(uid, '✓', `Task completed: ${task.label}`);
    sendSuccess(res, { category: serializeChecklistCategory(cat) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/checklist/tasks/:taskId
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { label, due, category: newCategory, originalCategory } = req.body;
    const uid = ownerId(req);
    if (!label?.trim()) return next(new ApiError(422, 'Label is required'));

    if (!newCategory || !originalCategory || originalCategory === newCategory) {
      const cat = await ChecklistCategory.findOneAndUpdate(
        { userId: uid, 'tasks._id': req.params.taskId },
        { $set: { 'tasks.$.label': sanitize(label), 'tasks.$.due': sanitize(due) || 'No due date' } },
        { new: true }
      );
      if (!cat) return next(new ApiError(404, 'Task not found'));
      sendSuccess(res, { categories: [serializeChecklistCategory(cat)] });
    } else {
      const srcCat = await ChecklistCategory.findOne({ userId: uid, 'tasks._id': req.params.taskId });
      if (!srcCat) return next(new ApiError(404, 'Task not found'));

      const taskIdx = srcCat.tasks.findIndex(t => String(t._id) === String(req.params.taskId));
      if (taskIdx === -1) return next(new ApiError(404, 'Task not found'));
      const { done } = srcCat.tasks[taskIdx];

      srcCat.tasks.splice(taskIdx, 1);
      await srcCat.save();

      const destCat = await ChecklistCategory.findOneAndUpdate(
        { userId: uid, category: newCategory },
        { $push: { tasks: { label: sanitize(label), due: sanitize(due) || 'No due date', done } } },
        { new: true }
      );
      if (!destCat) return next(new ApiError(404, 'Target category not found'));

      sendSuccess(res, { categories: [serializeChecklistCategory(srcCat), serializeChecklistCategory(destCat)] });
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/checklist/tasks/:taskId
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cat = await ChecklistCategory.findOneAndUpdate(
      { userId: ownerId(req), 'tasks._id': req.params.taskId },
      { $pull: { tasks: { _id: req.params.taskId } } },
      { new: true }
    );
    if (!cat) return next(new ApiError(404, 'Task not found'));
    sendSuccess(res, { id: req.params.taskId, category: serializeChecklistCategory(cat) }, 'Task deleted');
  } catch (err) {
    next(err);
  }
};
