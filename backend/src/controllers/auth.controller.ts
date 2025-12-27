import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { TokenService } from '../services/token.service.js';
import { EmailService } from '../services/email.service.js';
import { getRefreshTokenMaxAge } from '../config/jwt.config.js';
import type {
  RegisterInput,
  LoginInput,
  TokenPayload,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../types/auth.types.js';

// Configuration du cookie refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: getRefreshTokenMaxAge(),
  path: '/api/auth',
};

// Regex pour validation
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Controller pour l'authentification
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, first_name, last_name } = req.body as RegisterInput;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Email et mot de passe requis',
        });
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Format d\'email invalide',
        });
        return;
      }

      if (password.length < PASSWORD_MIN_LENGTH) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
        });
        return;
      }

      // Vérifier si l'email existe déjà
      if (await UserModel.emailExists(email)) {
        res.status(409).json({
          success: false,
          error: 'email_exists',
          message: 'Un compte existe déjà avec cet email',
        });
        return;
      }

      // Hasher le mot de passe
      const password_hash = await bcrypt.hash(password, 12);

      // Créer l'utilisateur
      const user = await UserModel.create({
        email,
        password,
        password_hash,
        first_name,
        last_name,
      });

      // Générer et sauvegarder le token de vérification
      const verificationToken = TokenService.generateRandomToken();
      const tokenHash = TokenService.hashToken(verificationToken);
      const tokenExpires = TokenService.getVerificationTokenExpiry();

      await UserModel.setVerificationToken(user.id, tokenHash, tokenExpires);

      // Envoyer l'email de vérification
      await EmailService.sendVerificationEmail(user.email, verificationToken, user.first_name || undefined);

      console.log(`[Auth] User registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès. Veuillez vérifier votre email.',
        data: {
          user: UserModel.toSafeUser(user),
        },
      });
    } catch (error) {
      console.error('[Auth] Register error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de l\'inscription',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Email et mot de passe requis',
        });
        return;
      }

      // Trouver l'utilisateur
      const user = await UserModel.findByEmail(email);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'invalid_credentials',
          message: 'Email ou mot de passe incorrect',
        });
        return;
      }

      // Vérifier si l'utilisateur a un mot de passe
      if (!user.password_hash) {
        res.status(401).json({
          success: false,
          error: 'no_password',
          message: 'Ce compte n\'a pas de mot de passe configuré. Veuillez réinitialiser votre mot de passe.',
        });
        return;
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'invalid_credentials',
          message: 'Email ou mot de passe incorrect',
        });
        return;
      }

      // Vérifier si l'email est vérifié
      if (!user.email_verified) {
        res.status(403).json({
          success: false,
          error: 'email_not_verified',
          message: 'Veuillez vérifier votre adresse email avant de vous connecter',
        });
        return;
      }

      // Générer les tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken } = TokenService.generateTokenPair(tokenPayload);

      // Sauvegarder le refresh token hashé
      const refreshTokenHash = TokenService.hashToken(refreshToken);
      await UserModel.setRefreshToken(user.id, refreshTokenHash);

      // Mettre à jour la date de dernière connexion
      await UserModel.updateLastLogin(user.id);

      // Définir le cookie refresh token
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      console.log(`[Auth] User logged in: ${user.email}`);

      res.json({
        success: true,
        data: {
          user: UserModel.toSafeUser(user),
          accessToken,
        },
      });
    } catch (error) {
      console.error('[Auth] Login error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la connexion',
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Déconnexion de l'utilisateur
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        // Supprimer le refresh token de la base
        await UserModel.setRefreshToken(req.user.id, null);
        console.log(`[Auth] User logged out: ${req.user.email}`);
      }

      // Supprimer le cookie
      res.clearCookie('refreshToken', { path: '/api/auth' });

      res.json({
        success: true,
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la déconnexion',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Rafraîchir les tokens
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'no_refresh_token',
          message: 'Token de rafraîchissement manquant',
        });
        return;
      }

      // Vérifier le refresh token
      let payload: TokenPayload;
      try {
        payload = TokenService.verifyRefreshToken(refreshToken);
      } catch {
        res.clearCookie('refreshToken', { path: '/api/auth' });
        res.status(401).json({
          success: false,
          error: 'invalid_refresh_token',
          message: 'Token de rafraîchissement invalide',
        });
        return;
      }

      // Vérifier que le token hashé correspond à celui en base
      const refreshTokenHash = TokenService.hashToken(refreshToken);
      const user = await UserModel.findByRefreshToken(refreshTokenHash);

      if (!user || user.id !== payload.userId) {
        res.clearCookie('refreshToken', { path: '/api/auth' });
        res.status(401).json({
          success: false,
          error: 'invalid_refresh_token',
          message: 'Token de rafraîchissement invalide ou révoqué',
        });
        return;
      }

      // Générer de nouveaux tokens (rotation)
      const newTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        TokenService.generateTokenPair(newTokenPayload);

      // Sauvegarder le nouveau refresh token
      const newRefreshTokenHash = TokenService.hashToken(newRefreshToken);
      await UserModel.setRefreshToken(user.id, newRefreshTokenHash);

      // Définir le nouveau cookie
      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user: UserModel.toSafeUser(user),
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error('[Auth] Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors du rafraîchissement du token',
      });
    }
  }

  /**
   * POST /api/auth/verify-email
   * Vérifier l'email avec le token
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Token requis',
        });
        return;
      }

      // Hasher le token pour le comparer
      const tokenHash = TokenService.hashToken(token);
      const user = await UserModel.findByVerificationToken(tokenHash);

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'invalid_token',
          message: 'Token invalide ou expiré',
        });
        return;
      }

      // Vérifier l'email
      await UserModel.verifyEmail(user.id);

      // Envoyer l'email de bienvenue
      await EmailService.sendWelcomeEmail(user.email, user.first_name || undefined);

      console.log(`[Auth] Email verified: ${user.email}`);

      res.json({
        success: true,
        message: 'Email vérifié avec succès',
      });
    } catch (error) {
      console.error('[Auth] Verify email error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la vérification de l\'email',
      });
    }
  }

  /**
   * POST /api/auth/resend-verification
   * Renvoyer l'email de vérification
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Email requis',
        });
        return;
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        // Ne pas révéler si l'email existe ou non
        res.json({
          success: true,
          message: 'Si un compte existe avec cet email, un email de vérification a été envoyé.',
        });
        return;
      }

      if (user.email_verified) {
        res.status(400).json({
          success: false,
          error: 'already_verified',
          message: 'Cet email est déjà vérifié',
        });
        return;
      }

      // Générer un nouveau token
      const verificationToken = TokenService.generateRandomToken();
      const tokenHash = TokenService.hashToken(verificationToken);
      const tokenExpires = TokenService.getVerificationTokenExpiry();

      await UserModel.setVerificationToken(user.id, tokenHash, tokenExpires);
      await EmailService.sendVerificationEmail(user.email, verificationToken, user.first_name || undefined);

      res.json({
        success: true,
        message: 'Email de vérification envoyé',
      });
    } catch (error) {
      console.error('[Auth] Resend verification error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Demander la réinitialisation du mot de passe
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Email requis',
        });
        return;
      }

      const user = await UserModel.findByEmail(email);

      // Toujours retourner le même message pour ne pas révéler si l'email existe
      const successMessage = 'Si un compte existe avec cet email, un email de réinitialisation a été envoyé.';

      if (!user) {
        res.json({ success: true, message: successMessage });
        return;
      }

      // Vérifier si l'utilisateur a un mot de passe
      if (!user.password_hash) {
        res.json({ success: true, message: successMessage });
        return;
      }

      // Générer le token de reset
      const resetToken = TokenService.generateRandomToken();
      const tokenHash = TokenService.hashToken(resetToken);
      const tokenExpires = TokenService.getResetTokenExpiry();

      await UserModel.setResetToken(user.id, tokenHash, tokenExpires);
      await EmailService.sendPasswordResetEmail(user.email, resetToken, user.first_name || undefined);

      console.log(`[Auth] Password reset requested: ${user.email}`);

      res.json({ success: true, message: successMessage });
    } catch (error) {
      console.error('[Auth] Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Réinitialiser le mot de passe avec le token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Token et nouveau mot de passe requis',
        });
        return;
      }

      if (password.length < PASSWORD_MIN_LENGTH) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
        });
        return;
      }

      // Trouver l'utilisateur par le token
      const tokenHash = TokenService.hashToken(token);
      const user = await UserModel.findByResetToken(tokenHash);

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'invalid_token',
          message: 'Token invalide ou expiré',
        });
        return;
      }

      // Hasher le nouveau mot de passe
      const passwordHash = await bcrypt.hash(password, 12);

      // Mettre à jour le mot de passe et effacer le token
      await UserModel.updatePassword(user.id, passwordHash);
      await UserModel.clearResetToken(user.id);

      // Invalider tous les refresh tokens existants
      await UserModel.setRefreshToken(user.id, null);

      console.log(`[Auth] Password reset successful: ${user.email}`);

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la réinitialisation du mot de passe',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Récupérer l'utilisateur connecté
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'unauthorized',
          message: 'Non authentifié',
        });
        return;
      }

      res.json({
        success: true,
        data: UserModel.toSafeUser(req.user),
      });
    } catch (error) {
      console.error('[Auth] Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur serveur',
      });
    }
  }

  /**
   * PATCH /api/auth/me
   * Mettre à jour le profil de l'utilisateur connecté
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'unauthorized',
          message: 'Non authentifié',
        });
        return;
      }

      const { first_name, last_name, avatar_url } = req.body as UpdateProfileInput;

      const updatedUser = await UserModel.updateProfile(req.user.id, {
        first_name,
        last_name,
        avatar_url,
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'not_found',
          message: 'Utilisateur non trouvé',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors de la mise à jour du profil',
      });
    }
  }

  /**
   * PATCH /api/auth/change-password
   * Changer le mot de passe de l'utilisateur connecté
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'unauthorized',
          message: 'Non authentifié',
        });
        return;
      }

      const { currentPassword, newPassword } = req.body as ChangePasswordInput;

      // Validation
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: 'Mot de passe actuel et nouveau mot de passe requis',
        });
        return;
      }

      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        res.status(400).json({
          success: false,
          error: 'validation_error',
          message: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
        });
        return;
      }

      // Vérifier que l'utilisateur a un mot de passe
      if (!req.user.password_hash) {
        res.status(400).json({
          success: false,
          error: 'no_password',
          message: "Ce compte n'a pas de mot de passe configuré",
        });
        return;
      }

      // Vérifier le mot de passe actuel
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        req.user.password_hash
      );

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'invalid_password',
          message: 'Mot de passe actuel incorrect',
        });
        return;
      }

      // Hasher le nouveau mot de passe
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      await UserModel.updatePassword(req.user.id, newPasswordHash);

      // Invalider tous les refresh tokens (force re-login)
      await UserModel.setRefreshToken(req.user.id, null);

      console.log(`[Auth] Password changed: ${req.user.email}`);

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès',
      });
    } catch (error) {
      console.error('[Auth] Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Erreur lors du changement de mot de passe',
      });
    }
  }
}
