import { Request, Response, NextFunction } from "express";
import { SendErrorResponse } from "../utils/send-error-response";
import { INTERNAL_SERVER_ERROR } from "../constants/error-codes";
import { v4 as uuid } from "uuid";

const SYSTEM_CURRENT_FEATURES = {
  ERROR_HANDLER: "ERROR_HANDLER"
};

function buildErrorPayload(
  endpoint: string,
  functionName: string,
  method: string,
  message: string,
  error: { code: string; message: string },
  customMsg: string,
  stack?: string
) {
  return {
    message,
    data: {
      clientError: { ...error, message: customMsg },
      endpoint,
      functionName,
      method,
      service: SYSTEM_CURRENT_FEATURES.ERROR_HANDLER,
      id: uuid(),
      stack: process.env.NODE_ENV === "development" ? stack : undefined
    }
  };
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const functionName = "errorHandler";

  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));

    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Validation error",
        { code: "VALIDATION_ERROR", message: "Validation failed" },
        "Please check your input and try again.",
        err.stack
      )
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Duplicate entry",
        { code: "DUPLICATE_ENTRY", message: "Duplicate entry detected" },
        `${field} already exists. Please use a different value.`,
        err.stack
      )
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        "Invalid ID",
        { code: "INVALID_ID", message: "Invalid ID format" },
        `Invalid ${err.path}: ${err.value}`,
        err.stack
      )
    });
  }

  // Custom ApiError
  if (err.name === "ApiError") {
    return SendErrorResponse.error({
      res,
      ...buildErrorPayload(
        req.originalUrl,
        functionName,
        req.method.toUpperCase(),
        err.message,
        { code: err.code || "API_ERROR", message: err.message },
        err.message,
        err.stack
      )
    });
  }

  // Default error
  return SendErrorResponse.error({
    res,
    ...buildErrorPayload(
      req.originalUrl,
      functionName,
      req.method.toUpperCase(),
      "Internal server error",
      INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      err.stack
    )
  });
};

export default errorHandler;