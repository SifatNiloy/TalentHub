import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { VALIDATION_ERROR } from "../constants/error-codes";
import { SendErrorResponse } from "../utils/responseHandler";
import { buildErrorPayload } from "./helpers";

type ValidationMode = "body" | "query" | "params";

export const validate = <T>(schema: ZodSchema<T>, mode: ValidationMode = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const toValidate = mode === "body" ? req.body : mode === "query" ? req.query : req.params;

    const result = schema.safeParse(toValidate);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message
      }));

      return SendErrorResponse.badRequest({
        res,
        ...buildErrorPayload(
          req,
          "validate",
          "Validation failed",
          VALIDATION_ERROR,
          "Please check your input and try again.",
          "VALIDATION",
          undefined,
          errors
        )
      });
    }

    if (mode === "body") req.body = result.data;
    if (mode === "query") req.query = result.data as Record<string, string>;
    if (mode === "params") req.params = result.data as Record<string, string>;

    next();
  };
};