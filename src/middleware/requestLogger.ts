import { Request, Response, NextFunction } from "express";
import morgan from "morgan";

// Custom token for response time
morgan.token("response-time-ms", (req: Request, res: Response) => {
  const responseTime = res.getHeader("X-Response-Time");
  return responseTime ? `${responseTime}ms` : "-";
});

// Custom morgan format
const morganFormat = ":method :url :status :response-time ms - :res[content-length]";

// Development logger
export const devLogger = morgan(morganFormat, {
  skip: (req: Request) => {
    // Skip logging for health check endpoints
    return req.url === "/health" || req.url === "/api/health";
  }
});

// Production logger
export const prodLogger = morgan("combined", {
  skip: (req: Request, res: Response) => {
    // Skip logging for successful health checks
    return (req.url === "/health" || req.url === "/api/health") && res.statusCode < 400;
  }
});

// Response time middleware
export const responseTime = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    res.setHeader("X-Response-Time", duration);
  });

  next();
};

// Request logger based on environment
export const requestLogger = process.env.NODE_ENV === "production" ? prodLogger : devLogger;