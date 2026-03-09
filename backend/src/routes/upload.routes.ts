import { Router } from 'express';
import { uploadSignature } from '../config/upload.config.js';
import { uploadSignatureImage } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/upload/signature
 * Upload une image de signature
 * Body: multipart/form-data avec champ 'signature'
 * Retourne: data URL base64 à stocker directement en BDD
 */
router.post(
  '/signature',
  authenticate,
  uploadSignature.single('signature'),
  uploadSignatureImage,
);

export default router;
