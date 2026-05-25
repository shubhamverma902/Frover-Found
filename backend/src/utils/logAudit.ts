import type { Request } from 'express';
import AuditLog from '../models/AuditLog';

export type AuditAction =
  | 'auth.register'
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.logout'
  | 'auth.password_reset_request'
  | 'auth.password_reset_complete'
  | 'collaborator.invite_accepted'
  | 'collaborator.removed'
  | 'collaborator.left'
  | 'partner.linked'
  | 'partner.removed';

const logAudit = (
  req:    Request,
  action: AuditAction,
  userId?: string | null,
  meta?:   Record<string, unknown>,
): void => {
  AuditLog.create({
    userId:    userId ?? null,
    action,
    ip:        req.ip ?? '',
    userAgent: req.headers['user-agent'] ?? '',
    meta:      meta ?? {},
  }).catch(() => {}); // fire-and-forget — never block the response
};

export default logAudit;
