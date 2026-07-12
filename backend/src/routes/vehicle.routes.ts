import { Router } from 'express';
import { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from '../controllers/vehicle.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { ROLES } from '../utils/constants';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles(...ROLES), listVehicles);
router.post('/', requireRoles('Fleet Manager'), createVehicle);
router.get('/:id', requireRoles(...ROLES), getVehicle);
router.patch('/:id', requireRoles('Fleet Manager', 'Dispatcher'), updateVehicle);
router.delete('/:id', requireRoles('Fleet Manager'), deleteVehicle);

export default router;