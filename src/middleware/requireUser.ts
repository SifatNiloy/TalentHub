import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError, JwtPayload } from "jsonwebtoken";
import { UNAUTHORIZED } from "../constants/error-codes";
import { findUserById } from "../services/user.service";
import { buildErrorPayload } from "./helpers";
import { SendErrorResponse } from "../utils/responseHandler";

interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
}

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "No token provided",
          UNAUTHORIZED,
          "Authentication token is missing. Please login to continue.",
          "AUTHENTICATION"
        )
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "Invalid token format",
          UNAUTHORIZED,
          "Invalid authentication token format. Please login again.",
          "AUTHENTICATION"
        )
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const user = await findUserById(decoded.id);

    if (!user) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "User not found",
          UNAUTHORIZED,
          "Your account no longer exists. Please contact support.",
          "AUTHENTICATION"
        )
      });
    }

    if (user.status !== "active") {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "Account inactive",
          UNAUTHORIZED,
          `Your account is ${user.status}. Please contact support for assistance.`,
          "AUTHENTICATION"
        )
      });
    }

    res.locals.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "Invalid token",
          UNAUTHORIZED,
          "Your authentication token is invalid. Please login again.",
          "AUTHENTICATION"
        )
      });
    }

    if (error instanceof TokenExpiredError) {
      return SendErrorResponse.unauthorized({
        res,
        ...buildErrorPayload(
          req,
          "requireUser",
          "Token expired",
          UNAUTHORIZED,
          "Your session has expired. Please login again.",
          "AUTHENTICATION"
        )
      });
    }

    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req,
        "requireUser",
        "Authentication error",
        UNAUTHORIZED,
        "An error occurred during authentication. Please try again.",
        "AUTHENTICATION"
      )
    });
  }
};