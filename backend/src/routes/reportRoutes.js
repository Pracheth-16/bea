import { Router } from 'express';
import { getDashboardMetrics, exportReportCSV } from '../controllers/reportController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardMetrics);
router.get('/export-csv', exportReportCSV);

export default router;

