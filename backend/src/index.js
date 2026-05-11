const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const herbRoutes = require('./routes/herbs');

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
// The frontend Vite proxy rewrites /api/* → http://localhost:5000/*
// So routes are mounted WITHOUT the /api prefix.
app.use('/auth', authRoutes);
app.use('/herbs', herbRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: 'Herb-Tracechain API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register'
      },
      herbs: {
        harvest: 'POST /herbs/harvest',
        transfer: 'POST /herbs/transfer',
        process: 'POST /herbs/process',
        package: 'POST /herbs/package',
        distribute: 'POST /herbs/distribute',
        myHerbs: 'GET /herbs/my-herbs',
        inProgress: 'GET /herbs/in-progress',
        all: 'GET /herbs/all',
        verify: 'GET /herbs/verify/:herbId'
      },
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    fabricEnabled: process.env.FABRIC_ENABLED === 'true',
    ethereumEnabled: process.env.ETHEREUM_ENABLED === 'true'
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Connect to MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI is not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
      console.log(`   Fabric:   ${process.env.FABRIC_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   Ethereum: ${process.env.ETHEREUM_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
