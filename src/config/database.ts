import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
