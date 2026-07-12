import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Maintenance') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listMaintenance = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getMaintenance = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createMaintenance = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Maintenance created placeholder'));
export const updateMaintenance = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteMaintenance = (_req: Request, res: Response) => placeholder(res, 'deleted');