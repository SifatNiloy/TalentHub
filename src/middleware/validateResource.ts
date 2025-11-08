import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError, ZodRawShape } from "zod";
import { VALIDATION_ERROR } from "../constants/error-codes";
import { SendErrorResponse } from "../utils/responseHandler";
import { buildErrorPayload } from "./helpers";

export const validateResource = (schema: ZodObject<ZodRawShape>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message
        }));

        return SendErrorResponse.badRequest({
          res,
          ...buildErrorPayload(
            req,
            "validateResource",
            "Validation failed",
            VALIDATION_ERROR,
            "Please check your input and try again.",
            "VALIDATION",
            undefined,
            errors
          )
        });
      }

      return SendErrorResponse.error({
        res,
        ...buildErrorPayload(
          req,
          "validateResource",
          "Validation error",
          VALIDATION_ERROR,
          "An error occurred during validation.",
          "VALIDATION"
        )
      });
    }
  };
};