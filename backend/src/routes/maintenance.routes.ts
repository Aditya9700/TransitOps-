import { Router } from 'express';
import { createMaintenance, deleteMaintenance, getMaintenance, listMaintenance, updateMaintenance } from '../controllers/maintenance.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Safety Officer'), listMaintenance);
router.post('/', requireRoles('Fleet Manager', 'Safety Officer'), createMaintenance);
router.get('/:id', requireRoles('Fleet Manager', 'Safety Officer', 'Dispatcher'), getMaintenance);
router.patch('/:id', requireRoles('Fleet Manager', 'Safety Officer'), updateMaintenance);
router.delete('/:id', requireRoles('Fleet Manager'), deleteMaintenance);

export default router;