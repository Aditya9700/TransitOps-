import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Fuel log') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listFuelLogs = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getFuelLog = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createFuelLog = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Fuel log created placeholder'));
export const updateFuelLog = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteFuelLog = (_req: Request, res: Response) => placeholder(res, 'deleted');