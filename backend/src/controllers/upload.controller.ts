import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

/**
 * Upload une signature et retourne le chemin du fichier
 * POST /api/upload/signature
 */
export const uploadSignatureImage = async (req: Request, res: Response): Promise<void> => {
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

    // Construire le chemin relatif pour stocker en BDD
    const relativePath = `/uploads/signatures/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: relativePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Erreur lors de l\'upload de la signature',
    });
  }
};

/**
 * Supprime une signature
 * DELETE /api/upload/signature/:filename
 */
export const deleteSignatureImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    // Validation du filename pour éviter directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Nom de fichier invalide',
      });
      return;
    }

    // Construire le chemin complet
    const filePath = path.join(
      __dirname,
      '../../uploads/signatures',
      filename
    );

    // Vérifier que le fichier existe
    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Fichier non trouvé',
      });
      return;
    }

    // Supprimer le fichier
    await fs.unlink(filePath);

    res.status(200).json({
      success: true,
      message: 'Signature supprimée avec succès',
    });
  } catch (error) {
    console.error('Error deleting signature:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Erreur lors de la suppression de la signature',
    });
  }
};
