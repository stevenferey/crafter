import { query } from '../config/database.js';
import type {
  User,
  SafeUser,
  RegisterInput,
  UpdateProfileInput,
} from '../types/auth.types.js';

// Colonnes sécurisées à retourner (sans données sensibles)
const SAFE_USER_COLUMNS = `
  id,
  email,
  role,
  first_name,
  last_name,
  avatar_url,
  email_verified,
  google_id,
  last_login_at,
  created_at,
  updated_at
`;

// Toutes les colonnes (pour usage interne)
const ALL_USER_COLUMNS = `
  id,
  email,
  password_hash,
  role,
  first_name,
  last_name,
  avatar_url,
  email_verified,
  email_verification_token,
  email_verification_expires,
  password_reset_token,
  password_reset_expires,
  google_id,
  refresh_token_hash,
  last_login_at,
  created_at,
  updated_at
`;

/**
 * Model pour les opérations CRUD sur les utilisateurs
 */
export class UserModel {
  /**
   * Recherche un utilisateur par son ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son ID (version sécurisée)
   */
  static async findByIdSafe(id: string): Promise<SafeUser | null> {
    const result = await query<SafeUser>(
      `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son Google ID
   */
  static async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users WHERE google_id = $1`,
      [googleId]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son token de vérification email
   */
  static async findByVerificationToken(token: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users
       WHERE email_verification_token = $1
       AND email_verification_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son token de reset password
   */
  static async findByResetToken(token: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users
       WHERE password_reset_token = $1
       AND password_reset_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    return result.rows[0] || null;
  }

  /**
   * Recherche un utilisateur par son refresh token hashé
   */
  static async findByRefreshToken(tokenHash: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT ${ALL_USER_COLUMNS} FROM users WHERE refresh_token_hash = $1`,
      [tokenHash]
    );
    return result.rows[0] || null;
  }

  /**
   * Crée un nouvel utilisateur
   */
  static async create(data: RegisterInput & { password_hash: string }): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING ${ALL_USER_COLUMNS}`,
      [data.email, data.password_hash, data.first_name || null, data.last_name || null]
    );
    return result.rows[0];
  }

  /**
   * Crée un utilisateur via OAuth Google
   */
  static async createFromGoogle(data: {
    email: string;
    google_id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, google_id, first_name, last_name, avatar_url, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING ${ALL_USER_COLUMNS}`,
      [
        data.email,
        data.google_id,
        data.first_name || null,
        data.last_name || null,
        data.avatar_url || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Met à jour le profil d'un utilisateur
   */
  static async updateProfile(id: string, data: UpdateProfileInput): Promise<SafeUser | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      params.push(data.first_name || null);
      paramIndex++;
    }

    if (data.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      params.push(data.last_name || null);
      paramIndex++;
    }

    if (data.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      params.push(data.avatar_url || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findByIdSafe(id);
    }

    params.push(id);

    const result = await query<SafeUser>(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING ${SAFE_USER_COLUMNS}`,
      params
    );

    return result.rows[0] || null;
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  static async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [passwordHash, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Met à jour le token de vérification email
   */
  static async setVerificationToken(
    id: string,
    token: string,
    expires: Date
  ): Promise<boolean> {
    const result = await query(
      `UPDATE users
       SET email_verification_token = $1, email_verification_expires = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [token, expires, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Vérifie l'email d'un utilisateur
   */
  static async verifyEmail(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users
       SET email_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Met à jour le token de reset password
   */
  static async setResetToken(id: string, token: string, expires: Date): Promise<boolean> {
    const result = await query(
      `UPDATE users
       SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [token, expires, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Efface le token de reset password
   */
  static async clearResetToken(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users
       SET password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Met à jour le refresh token hashé
   */
  static async setRefreshToken(id: string, tokenHash: string | null): Promise<boolean> {
    const result = await query(
      `UPDATE users SET refresh_token_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [tokenHash, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Met à jour la date de dernière connexion
   */
  static async updateLastLogin(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Lie un compte Google à un utilisateur existant
   */
  static async linkGoogleAccount(
    id: string,
    googleId: string,
    avatarUrl?: string
  ): Promise<boolean> {
    const result = await query(
      `UPDATE users
       SET google_id = $1, avatar_url = COALESCE($2, avatar_url), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [googleId, avatarUrl || null, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Supprime un utilisateur
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Vérifie si un email existe déjà
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Convertit un User en SafeUser (supprime les données sensibles)
   */
  static toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      email_verified: user.email_verified,
      google_id: user.google_id,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
