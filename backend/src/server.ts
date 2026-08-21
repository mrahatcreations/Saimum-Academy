import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { admissionsRouter } from './routes/admissions';
import { formBuilderRouter } from './routes/formBuilder';
import { academicRouter } from './routes/academic';
import { workshopExamsRouter } from './routes/workshopExams';
import { staffRouter } from './routes/staff';
import { workshopRouter } from './routes/workshops';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Saimum Central Academy Backend API', timestamp: new Date() });
});

// API Routes
app.use('/api/admissions', admissionsRouter);
app.use('/api/form-builder', formBuilderRouter);
app.use('/api/academic', academicRouter);
app.use('/api/workshop-exams', workshopExamsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/workshops', workshopRouter);

// Global error-handling middleware — catches unhandled errors from routes
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
});

// Start Server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Saimum Academy Backend Server running on http://localhost:${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or set a different PORT in .env`);
  } else {
    console.error('❌ Server failed to start:', err.message);
  }
  process.exit(1);
});
