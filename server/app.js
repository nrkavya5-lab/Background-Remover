import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import uploadRoutes from './routes/upload.js';
import processRoutes from './routes/process.js';
import downloadRoutes from './routes/download.js';
import replaceBgRoutes from './routes/replace-bg.js';
import editRoutes from './routes/edit.js';
import batchRoutes from './routes/batch.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import advancedRoutes from './routes/advanced.js';
import { generalLimiter, uploadLimiter, authLimiter, apiLimiter } from './middleware/rateLimit.js';
import { startCleanupCron } from './services/cleanup.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', generalLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/remove-bg', apiLimiter);
app.use('/api/replace-bg', apiLimiter);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));

// Database connection
connectDB();

// Start cleanup cron (hourly)
startCleanupCron();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/upload', uploadRoutes);
app.use('/api', processRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api', replaceBgRoutes);
app.use('/api', editRoutes);
app.use('/api', batchRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', advancedRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
