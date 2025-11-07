import { Request, Response, NextFunction } from "express";
import { SendErrorResponse } from "../utils/send-error-response";
import { FORBIDDEN } from "../constants/error-codes";
import { v4 as uuid } from "uuid";

const SYSTEM_CURRENT_FEATURES = {
  AUTHORIZATION: "AUTHORIZATION"
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
      service: SYSTEM_CURRENT_FEATURES.AUTHORIZATION,
      id: uuid()
    }
  };
}

/**
 * Middleware to check if the authenticated user is the owner of the resource
 * Expects the resource userId to be in req.params or res.locals
 */
export const requireOwner = (userIdParam: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const functionName = "requireOwner";
    const authenticatedUserId = res.locals.user?.id;
    const resourceUserId = req.params[userIdParam] || res.locals.resourceUserId;

    if (!authenticatedUserId) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "User not authenticated",
          FORBIDDEN,
          "You must be logged in to access this resource."
        )
      });
    }

    if (authenticatedUserId !== resourceUserId) {
      return SendErrorResponse.forbidden({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Access denied",
          FORBIDDEN,
          "You do not have permission to access or modify this resource."
        )
      });
    }

    next();
  };
};