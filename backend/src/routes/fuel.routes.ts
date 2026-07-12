import { Router } from 'express';
import { createFuelLog, deleteFuelLog, getFuelLog, listFuelLogs, updateFuelLog } from '../controllers/fuel.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Financial Analyst'), listFuelLogs);
router.post('/', requireRoles('Fleet Manager', 'Dispatcher'), createFuelLog);
router.get('/:id', requireRoles('Fleet Manager', 'Financial Analyst', 'Dispatcher'), getFuelLog);
router.patch('/:id', requireRoles('Fleet Manager', 'Financial Analyst'), updateFuelLog);
router.delete('/:id', requireRoles('Fleet Manager'), deleteFuelLog);

export default router;