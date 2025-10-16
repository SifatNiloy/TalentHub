import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import connectDB from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    const server = createServer(app);
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err as Error);
    process.exit(1);
  }
}

start();
