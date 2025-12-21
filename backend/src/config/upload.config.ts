import multer from 'multer';
import { Request } from 'express';

// Stockage en mémoire (buffer) au lieu du disque
// Le buffer sera converti en base64 dans le controller
const storage = multer.memoryStorage();

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
