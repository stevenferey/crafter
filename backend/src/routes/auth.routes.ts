import { Router } from 'express';
import passport from 'passport';
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
// Google OAuth
// ============================================

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
  }),
  AuthController.googleCallback
);

// ============================================
// Routes protégées (authentification requise)
// ============================================

// Déconnexion
router.post('/logout', authenticate, AuthController.logout);

// Utilisateur courant
router.get('/me', authenticate, AuthController.getCurrentUser);
router.patch('/me', authenticate, AuthController.updateProfile);

export default router;
