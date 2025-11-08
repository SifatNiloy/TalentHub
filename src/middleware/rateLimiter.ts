import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RATE_LIMIT_EXCEEDED } from "../constants/error-codes";
import { buildErrorPayload } from "./helpers";
import { SendErrorResponse } from "../utils/responseHandler";

const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string,
  skipSuccessfulRequests = false
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req: Request, res: Response) => {
      return SendErrorResponse.tooManyRequests({
        res,
        ...buildErrorPayload(
          req,
          "rateLimiter",
          "Too many requests",
          RATE_LIMIT_EXCEEDED,
          message,
          "RATE_LIMITER"
        )
      });
    }
  });
};

export const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  "You have exceeded the rate limit. Please try again later."
);

export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  "Too many login attempts. Please try again after 15 minutes.",
  true
);

export const registrationLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  "Too many accounts created from this IP. Please try again after an hour."
);

export const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  "Too many password reset attempts. Please try again after an hour."
);