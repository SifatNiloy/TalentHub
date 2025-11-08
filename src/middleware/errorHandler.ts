import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { INTERNAL_SERVER_ERROR } from "../constants/error-codes";
import { SendErrorResponse } from "../utils/responseHandler";
import { buildErrorPayload } from "./helpers";

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyPattern: Record<string, unknown>;
}

interface MongooseCastError extends MongooseError.CastError {
  path: string;
  value: unknown;
}

interface ApiErrorType extends Error {
  name: "ApiError";
  code?: string;
  statusCode?: number;
}

export const errorHandler = (
  err: Error | MongooseError.ValidationError | MongooseDuplicateKeyError | MongooseCastError | ApiErrorType,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError" && "errors" in err) {
    const validationError = err as MongooseError.ValidationError;
    const errors = Object.values(validationError.errors).map((e) => ({
      path: e.path,
      message: e.message
    }));

    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "errorHandler",
        "Validation error",
        { code: "VALIDATION_ERROR", message: "Validation failed" },
        "Please check your input and try again.",
        "ERROR_HANDLER",
        err.stack,
        errors
      )
    });
  }

  // Mongoose duplicate key error
  if ("code" in err && err.code === 11000) {
    const duplicateError = err as MongooseDuplicateKeyError;
    const field = Object.keys(duplicateError.keyPattern)[0];
    return SendErrorResponse.conflict({
      res,
      ...buildErrorPayload(
        req,
        "errorHandler",
        "Duplicate entry",
        { code: "DUPLICATE_ENTRY", message: "Duplicate entry detected" },
        `${field} already exists. Please use a different value.`,
        "ERROR_HANDLER",
        err.stack
      )
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    const castError = err as MongooseCastError;
    return SendErrorResponse.badRequest({
      res,
      ...buildErrorPayload(
        req,
        "errorHandler",
        "Invalid ID",
        { code: "INVALID_ID", message: "Invalid ID format" },
        `Invalid ${castError.path}: ${castError.value}`,
        "ERROR_HANDLER",
        err.stack
      )
    });
  }

  // Custom ApiError
  if (err.name === "ApiError") {
    const apiError = err as ApiErrorType;
    const statusCode = apiError.statusCode || 500;

    return SendErrorResponse.custom({
      res,
      statusCode,
      ...buildErrorPayload(
        req,
        "errorHandler",
        apiError.message,
        { code: apiError.code || "API_ERROR", message: apiError.message },
        apiError.message,
        "ERROR_HANDLER",
        apiError.stack
      )
    });
  }

  // Default error
  return SendErrorResponse.error({
    res,
    ...buildErrorPayload(
      req,
      "errorHandler",
      "Internal server error",
      INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      "ERROR_HANDLER",
      err.stack
    )
  });
};