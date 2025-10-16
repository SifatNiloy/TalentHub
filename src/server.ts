import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Start server function
async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`🚀 TalentHub server running at http://localhost:${PORT}`);
  });
}

// Global error handling
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION!', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION!', err);
  process.exit(1);
});

// Start the app
startServer();
