import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    res.status(422).json({ success: false, message: firstError.msg, errors: errors.array() });
    return;
  }
  next();
};

export default validate;
