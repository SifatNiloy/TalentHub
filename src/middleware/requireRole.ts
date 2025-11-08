import { Request, Response, NextFunction } from "express";
import { FORBIDDEN } from "../constants/error-codes";
import { UserRole } from "../constants/user.constant";
import { buildErrorPayload } from "./helpers";
import { SendErrorResponse } from "../utils/responseHandler";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireRole",
          "User not authenticated",
          FORBIDDEN,
          "You must be logged in to access this resource.",
          "AUTHORIZATION"
        )
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return SendErrorResponse.forbidden({
        res,
        ...buildErrorPayload(
          req,
          "requireRole",
          "Insufficient permissions",
          FORBIDDEN,
          `Access denied. This resource is only accessible to ${allowedRoles.join(", ")} users.`,
          "AUTHORIZATION"
        )
      });
    }

    next();
  };
};