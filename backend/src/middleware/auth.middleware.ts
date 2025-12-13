import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service.js';
import { UserModel } from '../models/user.model.js';

/**
 * Middleware d'authentification obligatoire
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'Token d\'authentification requis',
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = TokenService.verifyAccessToken(token);
      const user = await UserModel.findById(payload.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'unauthorized',
          message: 'Utilisateur non trouvé',
        });
        return;
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch {
      res.status(401).json({
        success: false,
        error: 'invalid_token',
        message: 'Token invalide ou expiré',
      });
    }
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Erreur serveur lors de l\'authentification',
    });
  }
};

/**
 * Middleware d'authentification optionnelle
 * Tente de récupérer l'utilisateur si un token est présent, mais ne bloque pas si absent
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = TokenService.verifyAccessToken(token);
        const user = await UserModel.findById(payload.userId);

        if (user) {
          req.user = user;
        }
      } catch {
        // Token invalide, on continue sans utilisateur
      }
    }

    next();
  } catch (error) {
    console.error('[Optional Auth Middleware] Error:', error);
    next();
  }
};

/**
 * Middleware pour vérifier que l'email de l'utilisateur est vérifié
 */
export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'unauthorized',
      message: 'Authentification requise',
    });
    return;
  }

  if (!req.user.email_verified) {
    res.status(403).json({
      success: false,
      error: 'email_not_verified',
      message: 'Veuillez vérifier votre adresse email',
    });
    return;
  }

  next();
};
