import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

export const getDashboardAnalytics = (_req: Request, res: Response): Response => {
  return res.status(200).json(
    ApiResponse.success(
      {
        totalRevenue: 0,
        activeTrips: 0,
        pendingMaintenance: 0,
      },
      'Analytics placeholder response'
    )
  );
};