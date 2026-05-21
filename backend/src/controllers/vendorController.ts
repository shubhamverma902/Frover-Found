import { Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logActivity from '../utils/logActivity';
import { serializeVendor } from '../helpers/serializers';

// GET /api/v1/vendors
export const getVendors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendors = await Vendor.find({ userId: req.user!.id }).sort({ createdAt: 1 });
    sendSuccess(res, { vendors: vendors.map(serializeVendor) });
  } catch (err) { next(err); }
};

// POST /api/v1/vendors
export const createVendor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { icon, category, name, contact, location, status, rating, notes } = req.body;
    if (!name?.trim())     return next(new ApiError(422, 'Vendor name is required'));
    if (!category?.trim()) return next(new ApiError(422, 'Category is required'));

    const vendor = await Vendor.create({
      userId: req.user!.id,
      icon:     icon     ?? '🏢',
      category: category.trim(),
      name:     name.trim(),
      contact:  contact  ?? '',
      location: location ?? '',
      status:   status   ?? 'pending',
      rating:   Number(rating) || 3,
      notes:    notes    ?? '',
    });

    logActivity(req.user!.id, vendor.icon, `Vendor added: ${vendor.name} (${vendor.category})`);
    sendSuccess(res, { vendor: serializeVendor(vendor) }, 'Vendor added', 201);
  } catch (err) { next(err); }
};

// PUT /api/v1/vendors/:id
export const updateVendor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { icon, category, name, contact, location, status, rating, notes } = req.body;
    if (!name?.trim())     return next(new ApiError(422, 'Vendor name is required'));
    if (!category?.trim()) return next(new ApiError(422, 'Category is required'));

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { icon, category: category.trim(), name: name.trim(), contact, location, status, rating: Number(rating), notes },
      { new: true, runValidators: true }
    );
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));
    sendSuccess(res, { vendor: serializeVendor(vendor) });
  } catch (err) { next(err); }
};

// PATCH /api/v1/vendors/:id/status
export const patchVendorStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['booked', 'shortlisted', 'pending'].includes(status))
      return next(new ApiError(422, 'Invalid status'));

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { status },
      { new: true }
    );
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));
    if (status === 'booked') logActivity(req.user!.id, vendor.icon, `Vendor booked: ${vendor.name}`);
    sendSuccess(res, { vendor: serializeVendor(vendor) });
  } catch (err) { next(err); }
};

// DELETE /api/v1/vendors/:id
export const deleteVendor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));
    sendSuccess(res, null, 'Vendor removed');
  } catch (err) { next(err); }
};
