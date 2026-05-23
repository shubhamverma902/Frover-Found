import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  id:                string;
  email:             string;
  role:              string;
  dataOwnerId?:      string;           // partner or collaborator: data belongs to this user
  collaboratorRole?: 'planner' | 'viewer'; // absent = owner or partner (full write access)
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type UserRole = 'user' | 'admin';
