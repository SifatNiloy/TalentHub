/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

export const validate =
  (schema: ZodSchema<any>, mode: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const toValidate = mode === 'body' ? req.body : mode === 'query' ? req.query : req.params;
    const result = schema.safeParse(toValidate);
    if (!result.success) {
      const first = result.error.errors[0];
      throw new ApiError(`Validation error: ${first.path.join('.')} ${first.message}`, 400);
    }
    // replace with parsed data
    if (mode === 'body') req.body = result.data;
    if (mode === 'query') req.query = result.data as any;
    if (mode === 'params') req.params = result.data as any;
    next();
  };
