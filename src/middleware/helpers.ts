import { Request } from "express";
import { v4 as uuid } from "uuid";

export const buildErrorPayload = (
  req: Request,
  functionName: string,
  message: string,
  error: { code: string; message: string },
  customMsg: string,
  service: string,
  stack?: string,
  validationErrors?: Array<{ path: string; message: string }>
) => ({
  message,
  data: {
    clientError: { ...error, message: customMsg },
    endpoint: req.originalUrl,
    functionName,
    method: req.method.toUpperCase(),
    service,
    id: uuid(),
    ...(stack && process.env.NODE_ENV === "development" && { stack }),
    ...(validationErrors && { validationErrors })
  }
});
