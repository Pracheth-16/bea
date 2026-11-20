import jwt from 'jsonwebtoken';
import { store } from '../services/dataStore.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'bmsit-enterprise-itsm-super-secure-token-2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }
    // Omit password from req.user
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

