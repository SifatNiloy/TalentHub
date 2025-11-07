import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SendErrorResponse } from "../utils/send-error-response";
import { UNAUTHORIZED } from "../constants/error-codes";
import { v4 as uuid } from "uuid";
import { findUserById } from "../services/user.service";

const SYSTEM_CURRENT_FEATURES = {
  AUTHENTICATION: "AUTHENTICATION"
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
      service: SYSTEM_CURRENT_FEATURES.AUTHENTICATION,
      id: uuid()
    }
  };
}

const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  const functionName = "requireUser";

  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "No token provided",
          UNAUTHORIZED,
          "Authentication token is missing. Please login to continue."
        )
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Invalid token format",
          UNAUTHORIZED,
          "Invalid authentication token format. Please login again."
        )
      });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    // Check if user still exists
    const user = await findUserById(decoded.id);

    if (!user) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "User not found",
          UNAUTHORIZED,
          "Your account no longer exists. Please contact support."
        )
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Account inactive",
          UNAUTHORIZED,
          `Your account is ${user.status}. Please contact support for assistance.`
        )
      });
    }

    // Attach user to res.locals
    res.locals.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Invalid token",
          UNAUTHORIZED,
          "Your authentication token is invalid. Please login again."
        )
      });
    }

    if (error.name === "TokenExpiredError") {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Token expired",
          UNAUTHORIZED,
          "Your session has expired. Please login again."
        )
      });
    }

    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Authentication error",
        UNAUTHORIZED,
        "An error occurred during authentication. Please try again."
      )
    });
  }
};

export default requireUser;