const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const env = require('./src/config/env');
const { initializeMinio } = require('./src/config/minio');

// Import routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const agentRoutes = require('./src/routes/agent');
const clientManagerRoutes = require('./src/routes/clientManager');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: true, // Allow all for development, customize for production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes); // /api/auth/login, etc.
app.use('/api', adminRoutes);     // /api/clients, etc.
app.use('/api', agentRoutes);     // /api/agent/stores, etc.
app.use('/api', clientManagerRoutes); // /api/client/stores, etc.

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    error: message,
    code: code
  });
});

// Server Initialization
const PORT = env.PORT;

async function startServer() {
  try {
    // Idempotently check and create MinIO buckets on startup
    await initializeMinio();

    app.listen(PORT, () => {
      console.log(`Planogram Compliance Express server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Support running tests without starting the server
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // Export for testing
