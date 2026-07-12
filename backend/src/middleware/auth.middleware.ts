import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import ApiError from '../utils/ApiError';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const cookieToken = typeof req.cookies?.token === 'string' ? req.cookies.token : undefined;
  const token = headerToken || cookieToken;

  if (!token) {
    next(new ApiError(401, 'Authentication token is missing'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      throw new Error('Invalid token payload');
    }

    req.user = {
      id: String(decoded.id),
      role: typeof decoded.role === 'string' ? decoded.role : 'Unknown',
      email: typeof decoded.email === 'string' ? decoded.email : undefined,
      name: typeof decoded.name === 'string' ? decoded.name : undefined,
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

export default authMiddleware;