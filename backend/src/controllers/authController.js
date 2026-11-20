import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../services/dataStore.js';
import { JWT_SECRET } from '../middlewares/auth.js';

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = store.findOne('users', { email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid enterprise credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid enterprise credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  store.logAudit('USER_LOGIN', user.id, user.name, `User logged in with role ${user.role}`, req.ip);

  const { password: _, ...safeUser } = user;
  res.json({
    token,
    user: safeUser
  });
};

export const register = (req, res) => {
  const { name, email, password, role = 'employee', department, employeeId, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = store.findOne('users', { email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: 'An enterprise account with this email already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = store.create('users', {
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || 'employee',
    department: department || 'Information Science & Engineering',
    employeeId: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
    phone: phone || ''
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};

export const getAllUsers = (req, res) => {
  const users = store.getCollection('users').map(({ password, ...u }) => u);
  res.json({ users });
};

