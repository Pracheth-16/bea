import { Router } from 'express';
import { login, register, getMe, getAllUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, getAllUsers);

export default router;

