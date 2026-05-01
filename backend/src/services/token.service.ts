import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt.config.js';
import type { TokenPayload } from '../types/auth.types.js';

/**
 * Service de gestion des tokens JWT
 */
export class TokenService {
  /**
   * Génère un access token (courte durée)
   */
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.accessExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, jwtConfig.accessSecret, options);
  }

  /**
   * Génère un refresh token (longue durée)
   */
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.refreshExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, jwtConfig.refreshSecret, options);
  }

  /**
   * Vérifie et décode un access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.accessSecret) as TokenPayload;
  }

  /**
   * Vérifie et décode un refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
  }

  /**
   * Génère un token aléatoire sécurisé (pour vérification email, reset password)
   */
  static generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash un token avec SHA256 (pour stockage sécurisé en base)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Génère les deux tokens (access + refresh)
   */
  static generateTokenPair(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Calcule la date d'expiration pour un token de vérification (24h)
   */
  static getVerificationTokenExpiry(): Date {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  /**
   * Calcule la date d'expiration pour un token de reset (1h)
   */
  static getResetTokenExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000);
  }
}
