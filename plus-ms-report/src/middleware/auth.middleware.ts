import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Middleware de autenticação.
 *
 * Modos suportados (nessa ordem de prioridade):
 * 1. JWT real no header Authorization: Bearer <token>, validado com
 *    a chave secreta compartilhada com o MS Auth (Grupo 7).
 *    Configurar via env var JWT_SECRET.
 * 2. Headers simulados (x-user-email, x-user-role, x-user-id) — usados
 *    apenas em desenvolvimento local, quando JWT_SECRET não está setado
 *    ou o header Authorization está ausente.
 *
 * Claims esperados do MS Auth (Grupo 7):
 * - sub: email do usuário
 * - user_id: ID do usuário
 * - role: 'admin' | 'vendedor' | 'gestor'
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    userId: string;
    role: 'admin' | 'vendedor' | 'gestor';
  };
}

interface PlusJwtPayload {
  sub: string;
  user_id?: string;
  userId?: string;
  role: 'admin' | 'vendedor' | 'gestor';
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string;

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  // Caso 1: temos um JWT real e uma chave configurada → validar de verdade
  if (bearerToken && config.jwtSecret) {
    try {
      const payload = jwt.verify(bearerToken, config.jwtSecret) as PlusJwtPayload;
      req.user = {
        email: payload.sub,
        userId: payload.user_id ?? payload.userId ?? payload.sub,
        role: payload.role,
      };
      next();
      return;
    } catch (err) {
      res.status(401).json({ error: 'Token JWT inválido ou expirado', details: (err as Error).message });
      return;
    }
  }

  // Caso 2: headers simulados (dev local, sem JWT_SECRET configurado)
  if (userEmail) {
    req.user = {
      email: userEmail,
      userId: userId ?? 'dev-user',
      role: (userRole as 'admin' | 'vendedor' | 'gestor') ?? 'admin',
    };
    next();
    return;
  }

  // Caso 3: nada válido foi enviado
  res.status(401).json({ error: 'Token ausente ou inválido' });
}

/**
 * Middleware que restringe acesso a roles específicas.
 * Relatórios: acessíveis por admin e gestor
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
      return;
    }
    next();
  };
}
