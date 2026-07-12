import { Router } from 'express';
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from '../controllers/expense.controller';
import authMiddleware from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', requireRoles('Fleet Manager', 'Financial Analyst'), listExpenses);
router.post('/', requireRoles('Fleet Manager', 'Financial Analyst'), createExpense);
router.get('/:id', requireRoles('Fleet Manager', 'Financial Analyst'), getExpense);
router.patch('/:id', requireRoles('Fleet Manager', 'Financial Analyst'), updateExpense);
router.delete('/:id', requireRoles('Fleet Manager'), deleteExpense);

export default router;