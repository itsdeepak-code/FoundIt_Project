import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

export const app = express();

// The React dev server runs on another port, so allow it to send cookies.
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Uploaded item photos, e.g. GET /uploads/3f2c....jpg
app.use('/uploads', express.static(env.uploadsDir, { maxAge: '7d' }));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);

app.use(notFound);
app.use(errorHandler);
