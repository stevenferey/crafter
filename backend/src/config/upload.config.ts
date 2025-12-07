import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtenir __dirname dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dossier de destination pour les uploads
const UPLOAD_DIR = path.join(__dirname, '../../uploads/signatures');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Générer un nom de fichier unique avec UUID + extension d'origine
    const uniqueId = crypto.randomUUID();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  },
});

// Filtre pour accepter uniquement les images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Vérifier le type MIME
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Format de fichier invalide. Seuls les fichiers PNG et JPEG sont acceptés.',
      ),
    );
  }
};

// Configuration de multer
export const uploadSignature = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB maximum
  },
});

// Export du dossier d'upload pour usage dans server.ts
export { UPLOAD_DIR };
