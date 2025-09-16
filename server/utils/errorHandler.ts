import { Response } from "express";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function handleRouteError(error: any, res: Response, operation: string): void {
  console.error(`Error in ${operation}:`, error);

  // Handle specific error types
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request data",
      errors: error.errors,
      operation
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      message: error.message,
      details: error.details,
      operation
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      message: error.message,
      operation
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      message: error.message,
      operation
    });
    return;
  }

  // Handle database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === '57P01') {
    res.status(503).json({
      message: "Database service temporarily unavailable",
      operation
    });
    return;
  }

  // Generic server error
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    message: error.message || "Internal server error",
    operation
  });
}

export function asyncHandler(fn: (req: any, res: Response, next: any) => Promise<any>) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequestBody(schema: any) {
  return (req: any, res: Response, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Invalid request data",
          errors: error.errors
        });
      } else {
        next(error);
      }
    }
  };
}