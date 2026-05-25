import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';
import { loginLimiter, forgotPasswordLimiter } from '../middleware/rateLimiters';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  ],
  validate,
  resetPassword
);

// No auth middleware needed — the httpOnly cookie is the credential
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
