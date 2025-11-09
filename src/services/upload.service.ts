import { env } from './api';

/**
 * Upload une image de signature
 * @param file - Fichier image à uploader
 * @returns Promise avec le chemin de l'image uploadée
 */
export async function uploadSignature(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('signature', file);

  const response = await fetch(`${env.apiUrl}/upload/signature`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'upload de la signature');
  }

  const data = await response.json();
  return data.data.path; // Retourne le chemin relatif (ex: "/uploads/signatures/abc123.png")
}

/**
 * Supprime une image de signature
 * @param filename - Nom du fichier à supprimer
 */
export async function deleteSignature(filename: string): Promise<void> {
  const response = await fetch(`${env.apiUrl}/upload/signature/${filename}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la suppression de la signature');
  }
}
