import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { SendErrorResponse } from "../utils/send-error-response";
import { VALIDATION_ERROR } from "../constants/error-codes";
import { v4 as uuid } from "uuid";

const SYSTEM_CURRENT_FEATURES = {
  VALIDATION: "VALIDATION"
};

function buildErrorPayload(
  endpoint: string,
  functionName: string,
  method: string,
  message: string,
  error: { code: string; message: string },
  customMsg: string,
  validationErrors?: any
) {
  return {
    message,
    data: {
      clientError: { ...error, message: customMsg },
      endpoint,
      functionName,
      method,
      service: SYSTEM_CURRENT_FEATURES.VALIDATION,
      id: uuid(),
      validationErrors
    }
  };
}

const validateResource = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const functionName = "validateResource";

    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message
        }));

        return SendErrorResponse.error({
          res,
          ...buildErrorPayload(
            req.originalUrl,
            functionName,
            req.method.toUpperCase(),
            "Validation failed",
            VALIDATION_ERROR,
            "Please check your input and try again.",
            errors
          )
        });
      }

      return SendErrorResponse.error({
        res,
        ...buildErrorPayload(
          req.originalUrl,
          functionName,
          req.method.toUpperCase(),
          "Validation error",
          VALIDATION_ERROR,
          "An error occurred during validation."
        )
      });
    }
  };
};

export default validateResource;