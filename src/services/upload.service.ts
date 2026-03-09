import { env, getAccessToken } from './api';

/**
 * Upload une image de signature
 * @param file - Fichier image à uploader
 * @returns Promise avec le data URL base64 de l'image
 */
export async function uploadSignature(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('signature', file);

  const accessToken = getAccessToken();

  const response = await fetch(`${env.apiUrl}/upload/signature`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'upload de la signature");
  }

  const data = await response.json();
  return data.data.dataUrl; // Retourne le data URL base64 (ex: "data:image/png;base64,...")
}
