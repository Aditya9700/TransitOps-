import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Trip') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listTrips = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getTrip = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createTrip = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Trip created placeholder'));
export const updateTrip = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteTrip = (_req: Request, res: Response) => placeholder(res, 'deleted');