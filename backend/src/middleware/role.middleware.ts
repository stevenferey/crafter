import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types/auth.types.js';

/**
 * Middleware factory pour vérifier les rôles
 * @param roles - Liste des rôles autorisés
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'Authentification requise',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'forbidden',
        message: 'Permissions insuffisantes',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware pour les routes admin uniquement
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware pour les routes utilisateur (tous les rôles connectés)
 */
export const requireUser = requireRole('user', 'admin');

/**
 * Middleware pour vérifier la propriété d'une ressource
 * @param getResourceUserId - Fonction pour extraire le user_id de la ressource
 */
export const requireOwnership = (
  getResourceUserId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'Authentification requise',
      });
      return;
    }

    // Les admins peuvent accéder à tout
    if (req.user.role === 'admin') {
      next();
      return;
    }

    try {
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        res.status(404).json({
          success: false,
          error: 'not_found',
          message: 'Ressource non trouvée',
        });
        return;
      }

      if (resourceUserId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'forbidden',
          message: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[Ownership Middleware] Error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la vérification des permissions',
      });
    }
  };
};
