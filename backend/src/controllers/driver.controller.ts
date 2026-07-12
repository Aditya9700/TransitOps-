import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Driver') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listDrivers = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getDriver = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createDriver = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Driver created placeholder'));
export const updateDriver = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteDriver = (_req: Request, res: Response) => placeholder(res, 'deleted');