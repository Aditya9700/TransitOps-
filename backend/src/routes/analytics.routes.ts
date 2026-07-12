import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'), getDashboardAnalytics);

export default router;