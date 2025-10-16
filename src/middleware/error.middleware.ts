import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    logger.error(`${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
}
