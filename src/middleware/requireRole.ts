import { Request, Response, NextFunction } from "express";
import { SendErrorResponse } from "../utils/send-error-response";
import { FORBIDDEN } from "../constants/error-codes";
import { v4 as uuid } from "uuid";
import { UserRole } from "../constants/user.constants";

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
 * Middleware to check if user has required role(s)
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const functionName = "requireRole";
    const user = res.locals.user;

    if (!user) {
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

    if (!allowedRoles.includes(user.role)) {
      return SendErrorResponse.forbidden({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Insufficient permissions",
          FORBIDDEN,
          `Access denied. This resource is only accessible to ${allowedRoles.join(", ")} users.`
        )
      });
    }

    next();
  };
};

export default requireRole;