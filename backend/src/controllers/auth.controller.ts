import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import generateToken from '../utils/generateToken';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return next(new ApiError(400, 'Email and password are required'));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  const token = generateToken({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return res
    .status(200)
    .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    .json(
      ApiResponse.success(
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        'Login successful'
      )
    );
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  return res.status(200).json(ApiResponse.success(user, 'Current user fetched'));
};

export const register = async (_req: Request, res: Response): Promise<Response> => {
  return res.status(501).json(ApiResponse.success(null, 'Registration is reserved for future integration'));
};
