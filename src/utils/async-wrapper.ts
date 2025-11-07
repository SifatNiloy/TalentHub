/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Request, Response, NextFunction } from "express";

/**
 * Wrapper for async route handlers to catch errors and pass them to error middleware
 */
const asyncWrapper = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncWrapper;