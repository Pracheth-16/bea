import { Router } from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  addMaintenanceRecord,
  deleteAsset
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAssets);
router.get('/:id', getAssetById);

// Admin & Supervisor & Agent management routes
router.post('/', authorizeRoles(ROLES.ADMIN, ROLES.SUPERVISOR), createAsset);
router.patch('/:id', authorizeRoles(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.AGENT), updateAsset);
router.post(
  '/:id/maintenance',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.AGENT),
  addMaintenanceRecord
);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteAsset);

export default router;

