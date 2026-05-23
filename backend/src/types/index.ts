import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  id:            string;
  email:         string;
  role:          string;
  dataOwnerId?:  string; // set for secondary (partner) accounts; undefined = own data
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type UserRole = 'user' | 'admin';
