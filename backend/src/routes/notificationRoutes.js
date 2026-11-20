import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getDispatchLogs
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.get('/dispatch-logs', getDispatchLogs);

export default router;

