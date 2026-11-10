import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';

const app = express();

// Security & Utility Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development and mobile network origin testing
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.nodeEnv !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint for container probes and load balancers
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'LPG Tracker National API',
    jurisdiction: 'Nepal Oil Corporation (NOC)',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount V1 API
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred within LPG Tracker service.',
    error: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`================================================================`);
    console.log(`  LPG TRACKER NEPAL — BACKEND SERVICE IS ACTIVE`);
    console.log(`  Listening on: http://localhost:${config.port}`);
    console.log(`  Health Check: http://localhost:${config.port}/api/health`);
    console.log(`  REST API Root: http://localhost:${config.port}/api/v1`);
    console.log(`  Jurisdiction: Nepal Oil Corporation (NOC)`);
    console.log(`================================================================`);
  });
}

export default app;
