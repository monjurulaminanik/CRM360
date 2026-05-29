const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const clientRoutes = require('./routes/clients');
const whatsappRoutes = require('./routes/whatsapp');
const campaignRoutes = require('./routes/campaigns');
const aiRoutes = require('./routes/ai');
const hrRoutes = require('./routes/hr/index');
const tenantRoutes = require('./routes/tenants');
const taskRoutes = require('./routes/tasks');
const invoiceRoutes = require('./routes/invoices');
const projectRoutes = require('./routes/projects');
const expenseRoutes = require('./routes/expenses');
const recruitmentRoutes = require('./routes/recruitment');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time WhatsApp messaging
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes/controllers
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/recruitment', recruitmentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'D360 API is running' }));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// Connect to MongoDB and start server
const { connectDB, dbState } = require('./config/db');
const hijackAll = require('./config/dbOfflineHijack');

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  hijackAll();
  server.listen(PORT, () => logger.info(`D360 server running on port ${PORT} ${dbState.isOffline ? '(offline/fallback mode)' : ''}`));
});
