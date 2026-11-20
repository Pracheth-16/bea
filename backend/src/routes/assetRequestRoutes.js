import { Router } from 'express';
import {
  getAssetRequests,
  createAssetRequest,
  reviewAssetRequest
} from '../controllers/assetRequestController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getAssetRequests);
router.post('/', createAssetRequest);
router.patch(
  '/:id/review',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPERVISOR),
  reviewAssetRequest
);

export default router;

