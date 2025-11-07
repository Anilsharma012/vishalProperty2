import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  console.error(`[Error] ${status} - ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export class CustomError extends Error implements ApiError {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'CustomError';
  }
}
