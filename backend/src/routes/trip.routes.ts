import { Router } from 'express';
import { createTrip, deleteTrip, getTrip, listTrips, updateTrip } from '../controllers/trip.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Dispatcher'), listTrips);
router.post('/', requireRoles('Fleet Manager', 'Dispatcher'), createTrip);
router.get('/:id', requireRoles('Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'), getTrip);
router.patch('/:id', requireRoles('Fleet Manager', 'Dispatcher'), updateTrip);
router.delete('/:id', requireRoles('Fleet Manager'), deleteTrip);

export default router;