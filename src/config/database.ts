import mongoose from 'mongoose';
import logger from '../utils/logger';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talenthub';

export default async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, {
  } as mongoose.ConnectOptions);
  logger.info('Connected to MongoDB');
}
