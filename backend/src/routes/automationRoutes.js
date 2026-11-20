import { Router } from 'express';
import { evaluateSLA, aiClassify, getAuditLogs, resetDemoData } from '../controllers/automationController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/sla/evaluate', evaluateSLA);
router.post('/ai/classify', aiClassify);
router.get('/audit-logs', getAuditLogs);
router.post('/reset-demo', resetDemoData);

export default router;

