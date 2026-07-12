import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ROLES } from './constants';

type TokenUser = {
  id: string;
  role: (typeof ROLES)[number];
  email: string;
  name: string;
};

export const generateToken = (user: TokenUser): string => {
  return jwt.sign(user, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
export default generateToken;
