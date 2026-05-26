import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

const FRIENDLY_FIELDS: Record<string, string> = {
  email:      'Email address',
  publicSlug: 'Public URL slug',
};

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose field-level validation failure (maxlength, enum, required, etc.)
  if (err instanceof MongooseError.ValidationError) {
    const message = Object.values(err.errors).map(e => e.message).join('; ');
    res.status(422).json({ success: false, message });
    return;
  }

  // Mongoose invalid ObjectId (malformed :id param)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
    return;
  }

  // MongoDB duplicate key (E11000)
  const mongoErr = err as { code?: number; keyPattern?: Record<string, unknown> };
  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyPattern ?? {})[0] ?? 'field';
    const label = FRIENDLY_FIELDS[field] ?? field;
    res.status(409).json({ success: false, message: `${label} is already in use` });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
};

export default errorHandler;
