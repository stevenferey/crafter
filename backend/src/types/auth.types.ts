// Types pour l'authentification

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  refresh_token_hash?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Utilisateur sans données sensibles (pour les réponses API)
export type SafeUser = Omit<
  User,
  | 'password_hash'
  | 'refresh_token_hash'
  | 'email_verification_token'
  | 'email_verification_expires'
  | 'password_reset_token'
  | 'password_reset_expires'
>;

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
}

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

