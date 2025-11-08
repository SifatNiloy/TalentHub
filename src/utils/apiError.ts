export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  name = "ApiError";

  constructor(message: string, statusCode = 500, code?: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
