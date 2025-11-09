import { Router } from 'express';
import { uploadSignature } from '../config/upload.config.js';
import {
  uploadSignatureImage,
  deleteSignatureImage,
} from '../controllers/upload.controller.js';

const router = Router();

/**
 * POST /api/upload/signature
 * Upload une image de signature
 * Body: multipart/form-data avec champ 'signature'
 */
router.post(
  '/signature',
  uploadSignature.single('signature'),
  uploadSignatureImage
);

/**
 * DELETE /api/upload/signature/:filename
 * Supprime une image de signature
 */
router.delete('/signature/:filename', deleteSignatureImage);

export default router;
