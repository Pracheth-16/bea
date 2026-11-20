import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { slaEngine } from './services/slaEngine.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import assetRequestRoutes from './routes/assetRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import automationRoutes from './routes/automationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for auditability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint (NFR-1 Availability)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Enterprise IT Helpdesk & Asset Management System (ITSM)',
    institution: 'BMS Institute of Technology & Management',
    course: 'Building Enterprise Applications (BCS703B)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount modular enterprise routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/asset-requests', assetRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/automation', automationRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server and background engines
const startServer = async () => {
  // Connect to DB (Atlas or embedded store)
  await connectDB();

  // Start background SLA monitoring & auto-escalation engine (FR-3, FR-6)
  slaEngine.start(30000);

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ITSM Enterprise Server active on http://localhost:${PORT}`);
    console.log(`📚 Project: Enterprise IT Helpdesk & Asset Management`);
    console.log(`🎓 Institution: BMSIT&M | Course: BCS703B`);
    console.log(`=======================================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});

