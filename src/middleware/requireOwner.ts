import { Request, Response, NextFunction } from "express";
import { FORBIDDEN } from "../constants/error-codes";
import { SendErrorResponse } from "../utils/responseHandler";
import { buildErrorPayload } from "./helpers";

export const requireOwner = (userIdParam: string = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authenticatedUserId = res.locals.user?.id;
    const resourceUserId = req.params[userIdParam] || res.locals.resourceUserId;

    if (!authenticatedUserId) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireOwner",
          "User not authenticated",
          FORBIDDEN,
          "You must be logged in to access this resource.",
          "AUTHORIZATION"
        )
      });
    }

    if (authenticatedUserId !== resourceUserId) {
      return SendErrorResponse.forbidden({
        res,
        ...buildErrorPayload(
          req,
          "requireOwner",
          "Access denied",
          FORBIDDEN,
          "You do not have permission to access or modify this resource.",
          "AUTHORIZATION"
        )
      });
    }

    next();
  };
};