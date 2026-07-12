import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
};

export default requireRoles;