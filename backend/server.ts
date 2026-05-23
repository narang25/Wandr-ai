import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import tripsRoutes from './routes/trips';
import chatRoutes from './routes/chat';
import { generalLimiter } from './middleware/rateLimiter';

// Load env from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3000'];

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

// Apply general rate limit to all /api routes
app.use('/api/', generalLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/chat', chatRoutes);

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || '';

if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Wandr.ai backend running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      // Start server anyway for health checks and development
      app.listen(PORT, () => {
        console.log(`⚠️ Server running without MongoDB on http://localhost:${PORT}`);
      });
    });
} else {
  console.warn('⚠️ No MONGODB_URI set — starting without database');
  app.listen(PORT, () => {
    console.log(`⚠️ Wandr.ai backend running on http://localhost:${PORT} (no DB)`);
  });
}

export default app;
