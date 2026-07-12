import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

const placeholder = (res: Response, action: string, resource = 'Expense') => {
  return res.status(200).json(ApiResponse.success({ resource, action }, `${resource} ${action}`));
};

export const listExpenses = (_req: Request, res: Response) => placeholder(res, 'list fetched');
export const getExpense = (_req: Request, res: Response) => placeholder(res, 'details fetched');
export const createExpense = (_req: Request, res: Response) => res.status(201).json(ApiResponse.success(null, 'Expense created placeholder'));
export const updateExpense = (_req: Request, res: Response) => placeholder(res, 'updated');
export const deleteExpense = (_req: Request, res: Response) => placeholder(res, 'deleted');