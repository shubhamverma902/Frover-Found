import { Response, NextFunction } from 'express';
import SeatingTable from '../models/SeatingTable';
import { sendSuccess } from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import type { AuthRequest } from '../types';
import { ownerId } from '../helpers/authHelpers';

const serialize = (t: InstanceType<typeof SeatingTable>) => ({
  _id:      String(t._id),
  name:     t.name,
  capacity: t.capacity,
  shape:    t.shape,
  guestIds: t.guestIds,
});

// GET /api/v1/seating
export const getTables = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tables = await SeatingTable.find({ userId: ownerId(req) }).sort({ createdAt: 1 });
    sendSuccess(res, { tables: tables.map(serialize) });
  } catch (err) { next(err); }
};

// POST /api/v1/seating
export const createTable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, capacity = 8, shape = 'round' } = req.body;
    if (!name?.trim()) return next(new ApiError(400, 'Table name is required'));
    const table = await SeatingTable.create({ userId: ownerId(req), name: name.trim(), capacity, shape });
    sendSuccess(res, { table: serialize(table) }, 'Table created', 201);
  } catch (err) { next(err); }
};

// PUT /api/v1/seating/:id
export const updateTable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, capacity, shape } = req.body;
    const table = await SeatingTable.findOne({ _id: req.params.id, userId: ownerId(req) });
    if (!table) return next(new ApiError(404, 'Table not found'));
    if (name     !== undefined) table.name     = String(name).trim();
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (shape    !== undefined) table.shape    = shape;
    await table.save();
    sendSuccess(res, { table: serialize(table) });
  } catch (err) { next(err); }
};

// DELETE /api/v1/seating/:id
export const deleteTable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const table = await SeatingTable.findOneAndDelete({ _id: req.params.id, userId: ownerId(req) });
    if (!table) return next(new ApiError(404, 'Table not found'));
    sendSuccess(res, null, 'Table removed');
  } catch (err) { next(err); }
};

// POST /api/v1/seating/assign
// body: { guestId: string, tableId: string | null }
// Atomically moves a guest to a table (or back to unassigned pool).
// Returns all tables so the frontend can update in one shot.
export const assignGuest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { guestId, tableId } = req.body as { guestId: string; tableId: string | null };
    if (!guestId) return next(new ApiError(400, 'guestId is required'));
    const uid = ownerId(req);

    // Remove guest from every table they're currently in
    await SeatingTable.updateMany(
      { userId: uid, guestIds: guestId },
      { $pull: { guestIds: guestId } }
    );

    // Add to target table (if provided)
    if (tableId) {
      const target = await SeatingTable.findOne({ _id: tableId, userId: uid });
      if (!target) return next(new ApiError(404, 'Target table not found'));
      if (!target.guestIds.includes(guestId)) {
        target.guestIds.push(guestId);
        await target.save();
      }
    }

    const tables = await SeatingTable.find({ userId: uid }).sort({ createdAt: 1 });
    sendSuccess(res, { tables: tables.map(serialize) });
  } catch (err) { next(err); }
};
