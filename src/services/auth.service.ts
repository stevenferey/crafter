import { api, ApiResponse } from './api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
} from '@/types/auth.types';

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion avec email/mot de passe
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Échec de la connexion');
    }

    return response.data;
  },

  /**
   * Inscription
   */
  async register(data: RegisterData): Promise<{ user: User }> {
    const response = await api.post<ApiResponse<{ user: User }>>(
      '/auth/register',
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Échec de l\'inscription');
    }

    return response.data;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/logout');
  },

  /**
   * Rafraîchir les tokens
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Échec du rafraîchissement du token');
    }

    return response.data;
  },

  /**
   * Récupérer l'utilisateur courant
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Utilisateur non trouvé');
    }

    return response.data;
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.patch<ApiResponse<User>>('/auth/me', data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Échec de la mise à jour du profil');
    }

    return response.data;
  },

  /**
   * Vérifier l'email
   */
  async verifyEmail(data: VerifyEmailData): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/verify-email',
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Échec de la vérification de l\'email');
    }
  },

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerification(email: string): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/resend-verification',
      { email }
    );

    if (!response.success) {
      throw new Error(response.message || 'Échec de l\'envoi de l\'email');
    }
  },

  /**
   * Demander la réinitialisation du mot de passe
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/forgot-password',
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Échec de l\'envoi de l\'email');
    }
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await api.post<ApiResponse<void>>(
      '/auth/reset-password',
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Échec de la réinitialisation');
    }
  },

  /**
   * Obtenir l'URL d'authentification Google
   */
  getGoogleAuthUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    return `${apiUrl}/auth/google`;
  },
};
