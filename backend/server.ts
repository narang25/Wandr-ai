import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import tripsRoutes from './routes/trips';
import chatRoutes from './routes/chat';
import publicRoutes from './routes/public';
import { generalLimiter } from './middleware/rateLimiter';
import { connectToDatabase } from './utils/db';

// Load env from backend/.env (mostly for local development)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGINS = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3000', process.env.NEXT_PUBLIC_API_URL].filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());

// Ensure database is connected before handling requests
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

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
app.use('/api/public', publicRoutes);

// Only listen if NOT running on Vercel
if (!process.env.VERCEL) {
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Wandr.ai backend running on http://localhost:${PORT}`);
    });
  }).catch(() => {
    // If DB fails locally, still start server for debugging
    app.listen(PORT, () => {
      console.log(`⚠️ Server running without MongoDB on http://localhost:${PORT}`);
    });
  });
}

export default app;
