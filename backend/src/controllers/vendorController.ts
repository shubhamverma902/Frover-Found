import path from 'path';
import fs from 'fs';
import { Response, NextFunction } from 'express';
import Vendor from '../models/Vendor';
import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import logActivity from '../utils/logActivity';
import { serializeVendor } from '../helpers/serializers';
import { UPLOADS_ROOT } from '../middleware/upload';
import { ownerId } from '../helpers/authHelpers';
import { sanitize, sanitizeOpt } from '../utils/sanitize';
import { parsePage } from '../utils/parsePage';

const MAX_ATTACHMENTS = 5;

// GET /api/v1/vendors?page=1&limit=10
export const getVendors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const uid   = ownerId(req);
    const { page, limit, skip } = parsePage(req.query, 10);

    const [vendors, total, booked, shortlisted] = await Promise.all([
      Vendor.find({ userId: uid }).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Vendor.countDocuments({ userId: uid }),
      Vendor.countDocuments({ userId: uid, status: 'booked' }),
      Vendor.countDocuments({ userId: uid, status: 'shortlisted' }),
    ]);

    sendSuccess(res, {
      vendors:     vendors.map(serializeVendor),
      total,
      page,
      totalPages:  Math.ceil(total / limit) || 1,
      booked,
      shortlisted,
    });
  } catch (err) { next(err); }
};

// POST /api/v1/vendors
export const createVendor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { icon, category, name, contact, location, status, rating, notes } = req.body;
    if (!name?.trim())     return next(new ApiError(422, 'Vendor name is required'));
    if (!category?.trim()) return next(new ApiError(422, 'Category is required'));

    const vendor = await Vendor.create({
      userId: ownerId(req),
      icon:     sanitize(icon) || '🏢',
      category: sanitize(category),
      name:     sanitize(name),
      contact:  sanitize(contact),
      location: sanitize(location),
      status:   status   ?? 'pending',
      rating:   Number(rating) || 3,
      notes:    sanitize(notes),
    });

    logActivity(ownerId(req), vendor.icon, `Vendor added: ${vendor.name} (${vendor.category})`);
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
      { _id: req.params.id, userId: ownerId(req) },
      {
        icon:     sanitizeOpt(icon),
        category: sanitize(category),
        name:     sanitize(name),
        contact:  sanitizeOpt(contact),
        location: sanitizeOpt(location),
        status,
        rating:   Number(rating),
        notes:    sanitizeOpt(notes),
      },
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
      { _id: req.params.id, userId: ownerId(req) },
      { status },
      { new: true }
    );
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));
    if (status === 'booked') logActivity(ownerId(req), vendor.icon, `Vendor booked: ${vendor.name}`);
    sendSuccess(res, { vendor: serializeVendor(vendor) });
  } catch (err) { next(err); }
};

// DELETE /api/v1/vendors/:id
export const deleteVendor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, userId: ownerId(req) });
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));

    if (vendor.attachments.length > 0) {
      const dir = path.join(UPLOADS_ROOT, 'vendors', String(req.params.id));
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* dir may not exist */ }
    }

    sendSuccess(res, null, 'Vendor removed');
  } catch (err) { next(err); }
};

// POST /api/v1/vendors/:id/attachments
export const addVendorAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, userId: ownerId(req) });
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));
    if (!req.file)  return next(new ApiError(400, 'No file uploaded'));
    if (vendor.attachments.length >= MAX_ATTACHMENTS)
      return next(new ApiError(400, `Maximum ${MAX_ATTACHMENTS} attachments allowed`));

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    vendor.attachments.push({
      filename:     req.file.filename,
      originalName: req.file.originalname,
      url:          `${baseUrl}/uploads/vendors/${req.params.id}/${req.file.filename}`,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
      uploadedAt:   new Date(),
    });

    await vendor.save();
    sendSuccess(res, { vendor: serializeVendor(vendor) }, 'File uploaded');
  } catch (err) { next(err); }
};

// DELETE /api/v1/vendors/:id/attachments/:fileId
export const removeVendorAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, userId: ownerId(req) });
    if (!vendor) return next(new ApiError(404, 'Vendor not found'));

    const att = vendor.attachments.id(String(req.params.fileId));
    if (!att) return next(new ApiError(404, 'Attachment not found'));

    const filePath = path.join(UPLOADS_ROOT, 'vendors', String(req.params.id), att.filename);
    try { fs.unlinkSync(filePath); } catch { /* file already gone */ }

    att.deleteOne();
    await vendor.save();
    sendSuccess(res, { vendor: serializeVendor(vendor) }, 'File removed');
  } catch (err) { next(err); }
};
