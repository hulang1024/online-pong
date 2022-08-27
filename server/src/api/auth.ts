import { Request } from 'express-jwt';
import jwt from 'jsonwebtoken';
import User from "../user/user";

export const SECRET_KEY = '777';

export function createToken(user: User) {
  return jwt.sign({ user }, SECRET_KEY, { expiresIn: '3h' });
}

export function verifyToken(token: string): string | jwt.JwtPayload {
  try {
    return (token && jwt.verify(token, SECRET_KEY)) as User;
  } catch (e) {
    return '';
  }
}

export interface AuthRequest extends Request {
  auth: {
    user: User;
  }
}