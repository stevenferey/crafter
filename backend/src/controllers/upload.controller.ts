import { Request, Response } from 'express';

/**
 * Upload une signature et retourne le data URL base64
 * POST /api/upload/signature
 */
export const uploadSignatureImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Vérifier qu'un fichier a été uploadé
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Aucun fichier fourni',
      });
      return;
    }

    // Convertir le buffer en base64
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    res.status(200).json({
      success: true,
      data: {
        dataUrl,
        size: req.file.size,
        mimetype: mimeType,
      },
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: "Erreur lors de l'upload de la signature",
    });
  }
};
