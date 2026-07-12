import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): Response => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((item) => item.message),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}`,
      errors: [err.message],
    });
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error';
  logger.error(message, err);

  return res.status(500).json({
    success: false,
    message: 'Unexpected server error',
    errors: [message],
  });
};

export default errorMiddleware;
