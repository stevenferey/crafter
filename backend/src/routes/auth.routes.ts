import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// ============================================
// Routes publiques (sans authentification)
// ============================================

// Inscription
router.post('/register', AuthController.register);

// Connexion
router.post('/login', AuthController.login);

// Rafraîchir les tokens
router.post('/refresh', AuthController.refreshToken);

// Vérification email
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerification);

// Mot de passe oublié
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// ============================================
// Routes protégées (authentification requise)
// ============================================

// Déconnexion
router.post('/logout', authenticate, AuthController.logout);

// Utilisateur courant
router.get('/me', authenticate, AuthController.getCurrentUser);
router.patch('/me', authenticate, AuthController.updateProfile);

// Changer le mot de passe
router.patch('/change-password', authenticate, AuthController.changePassword);

export default router;
