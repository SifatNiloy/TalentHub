import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';


// import routes
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import jobRoutes from './routes/job.routes';
// import applicationRoutes from './routes/application.routes';
// import companyRoutes from './routes/company.routes'; 
import { logger } from './utils/logger';

dotenv.config();

const app: Application = express();

// --- Global Middlewares ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiter (for security)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100,
    message: 'Too many requests, please try again later.',
  })
);

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/applications', applicationRoutes);

// Optional company routes
// if (companyRoutes) app.use('/api/companies', companyRoutes);

// --- Health check endpoint ---
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'TalentHub API is running 🚀' });
});

// --- Global Error Handler ---
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
