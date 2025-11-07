import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { SendErrorResponse } from "../utils/send-error-response";
import { RATE_LIMIT_EXCEEDED } from "../constants/error-codes";
import { v4 as uuid } from "uuid";

const SYSTEM_CURRENT_FEATURES = {
  RATE_LIMITER: "RATE_LIMITER"
};

function buildErrorPayload(
  endpoint: string,
  functionName: string,
  method: string,
  message: string,
  error: { code: string; message: string },
  customMsg: string
) {
  return {
    message,
    data: {
      clientError: { ...error, message: customMsg },
      endpoint,
      functionName,
      method,
      service: SYSTEM_CURRENT_FEATURES.RATE_LIMITER,
      id: uuid()
    }
  };
}

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        "apiLimiter",
        req.method.toUpperCase(),
        "Too many requests",
        RATE_LIMIT_EXCEEDED,
        "You have exceeded the rate limit. Please try again later."
      )
    });
  }
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        "authLimiter",
        req.method.toUpperCase(),
        "Too many authentication attempts",
        RATE_LIMIT_EXCEEDED,
        "Too many login attempts. Please try again after 15 minutes."
      )
    });
  }
});

// Rate limiter for registration
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        "registrationLimiter",
        req.method.toUpperCase(),
        "Too many registration attempts",
        RATE_LIMIT_EXCEEDED,
        "Too many accounts created from this IP. Please try again after an hour."
      )
    });
  }
});

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        "passwordResetLimiter",
        req.method.toUpperCase(),
        "Too many password reset attempts",
        RATE_LIMIT_EXCEEDED,
        "Too many password reset attempts. Please try again after an hour."
      )
    });
  }
});