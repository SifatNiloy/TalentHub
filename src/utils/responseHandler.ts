import { Response } from "express";

export interface ErrorPayload {
  message: string;
  data: {
    clientError: {
      code: string;
      message: string;
    };
    endpoint: string;
    functionName: string;
    method: string;
    service: string;
    id: string;
    stack?: string;
    validationErrors?: Array<{
      path: string;
      message: string;
    }>;
  };
}

interface ErrorResponseParams {
  res: Response;
  message: string;
  data: {
    clientError: {
      code: string;
      message: string;
    };
    endpoint: string;
    functionName: string;
    method: string;
    service: string;
    id: string;
    stack?: string;
    validationErrors?: Array<{
      path: string;
      message: string;
    }>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SuccessResponseParams<T = any> {
  res: Response;
  message: string;
  data?: T;
  statusCode?: number;
}

export class SendErrorResponse {
  static badRequest({ res, message, data }: ErrorResponseParams): Response {
    return res.status(400).json({
      success: false,
      message,
      data
    });
  }

  static unauthorized({ res, message, data }: ErrorResponseParams): Response {
    return res.status(401).json({
      success: false,
      message,
      data
    });
  }

  static forbidden({ res, message, data }: ErrorResponseParams): Response {
    return res.status(403).json({
      success: false,
      message,
      data
    });
  }

  static notFound({ res, message, data }: ErrorResponseParams): Response {
    return res.status(404).json({
      success: false,
      message,
      data
    });
  }

  static conflict({ res, message, data }: ErrorResponseParams): Response {
    return res.status(409).json({
      success: false,
      message,
      data
    });
  }

  static tooManyRequests({ res, message, data }: ErrorResponseParams): Response {
    return res.status(429).json({
      success: false,
      message,
      data
    });
  }

  static error({ res, message, data }: ErrorResponseParams): Response {
    return res.status(500).json({
      success: false,
      message,
      data
    });
  }

  static custom({
    res,
    statusCode,
    message,
    data
  }: ErrorResponseParams & { statusCode: number }): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      data
    });
  }
}

export class SendSuccessResponse {
  static success<T>({ res, message, data, statusCode = 200 }: SuccessResponseParams<T>): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data && { data })
    });
  }

  static created<T>({ res, message, data }: SuccessResponseParams<T>): Response {
    return res.status(201).json({
      success: true,
      message,
      ...(data && { data })
    });
  }

  static noContent({ res }: { res: Response }): Response {
    return res.status(204).send();
  }
}