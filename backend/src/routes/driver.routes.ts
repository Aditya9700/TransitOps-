import { Router } from 'express';
import { createDriver, deleteDriver, getDriver, listDrivers, updateDriver } from '../controllers/driver.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Dispatcher', 'Safety Officer'), listDrivers);
router.post('/', requireRoles('Fleet Manager'), createDriver);
router.get('/:id', requireRoles('Fleet Manager', 'Dispatcher', 'Safety Officer'), getDriver);
router.patch('/:id', requireRoles('Fleet Manager', 'Dispatcher'), updateDriver);
router.delete('/:id', requireRoles('Fleet Manager'), deleteDriver);

export default router;