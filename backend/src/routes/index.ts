import { Router } from 'express';
import authRoutes        from './authRoutes';
import publicRoutes      from './publicRoutes';
import onboardingRoutes  from './onboardingRoutes';
import eventRoutes       from './eventRoutes';
import checklistRoutes   from './checklistRoutes';
import budgetRoutes      from './budgetRoutes';
import guestRoutes       from './guestRoutes';
import vendorRoutes      from './vendorRoutes';
import seatingRoutes     from './seatingRoutes';
import settingsRoutes    from './settingsRoutes';
import dashboardRoutes      from './dashboardRoutes';
import notificationRoutes  from './notificationRoutes';
import collaboratorRoutes  from './collaboratorRoutes';

const router = Router();

router.use('/auth',           authRoutes);
router.use('/onboarding',     onboardingRoutes);
router.use('/events',      eventRoutes);
router.use('/checklist',   checklistRoutes);
router.use('/budget',      budgetRoutes);
router.use('/guests',      guestRoutes);
router.use('/vendors',     vendorRoutes);
router.use('/seating',     seatingRoutes);
router.use('/settings',    settingsRoutes);
router.use('/dashboard',      dashboardRoutes);
router.use('/notifications',   notificationRoutes);
router.use('/collaborators',   collaboratorRoutes);
router.use('/public',          publicRoutes);

export default router;
