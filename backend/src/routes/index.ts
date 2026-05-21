import { Router } from 'express';
import authRoutes        from './authRoutes';
import onboardingRoutes  from './onboardingRoutes';
import eventRoutes       from './eventRoutes';
import checklistRoutes   from './checklistRoutes';
import budgetRoutes      from './budgetRoutes';
import guestRoutes       from './guestRoutes';
import vendorRoutes      from './vendorRoutes';
import settingsRoutes    from './settingsRoutes';
import dashboardRoutes      from './dashboardRoutes';
import notificationRoutes  from './notificationRoutes';

const router = Router();

router.use('/auth',        authRoutes);
router.use('/onboarding',  onboardingRoutes);
router.use('/events',      eventRoutes);
router.use('/checklist',   checklistRoutes);
router.use('/budget',      budgetRoutes);
router.use('/guests',      guestRoutes);
router.use('/vendors',     vendorRoutes);
router.use('/settings',    settingsRoutes);
router.use('/dashboard',      dashboardRoutes);
router.use('/notifications',  notificationRoutes);

export default router;
