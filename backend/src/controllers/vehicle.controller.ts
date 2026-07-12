import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Vehicle') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listVehicles = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getVehicle = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createVehicle = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Vehicle created placeholder'));
export const updateVehicle = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteVehicle = (_req: Request, res: Response) => placeholder(res, 'deleted');