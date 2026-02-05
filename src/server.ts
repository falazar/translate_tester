import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { getDatabase } from './database/connection';

// Import routes
import authRoutes from './routes/auth';
import levelRoutes from './routes/levels';
import progressRoutes from './routes/progress';
import sessionRoutes from './routes/sessions';
import textRoutes from './routes/text';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3123;

// Initialize database connection
getDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/text', textRoutes);

// Serve frontend for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('French Learning Game is ready!');
});
