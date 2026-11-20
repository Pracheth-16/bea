import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  reassignTicket,
  escalateTicket
} from '../controllers/ticketController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id/status', updateTicketStatus);
router.patch(
  '/:id/reassign',
  authorizeRoles(ROLES.SUPERVISOR, ROLES.ADMIN),
  reassignTicket
);
router.patch('/:id/escalate', escalateTicket);

export default router;

