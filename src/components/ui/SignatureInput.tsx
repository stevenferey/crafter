import { useState, useRef, ChangeEvent } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { uploadSignature } from '@/services/upload.service';
import { SignatureData } from '@/types/cra.types';

export interface SignatureInputProps {
  label: string;
  value: Partial<SignatureData>;
  onChange: (signature: Partial<SignatureData>) => void;
  defaultSignature?: Partial<SignatureData>;
  error?: string;
  disabled?: boolean;
}

/**
 * Composant pour saisir une signature complète (image + nom + titre)
 * Permet l'upload d'image, la saisie de texte et l'utilisation d'une signature par défaut
 */
export function SignatureInput({
  label,
  value,
  onChange,
  defaultSignature,
  error,
  disabled = false,
}: SignatureInputProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setUploadError('Format invalide. Seuls PNG et JPEG sont acceptés.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Fichier trop volumineux. Maximum 2MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const path = await uploadSignature(file);
      onChange({
        ...value,
        signatureImage: path,
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erreur lors de l'upload",
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange({
      signatoryName: '',
      signatoryTitle: '',
      signatureImage: '',
      signatureLocation: '',
      useCurrentDate: false,
    });
    setUploadError(null);
  };

  const handleUseDefault = () => {
    if (defaultSignature) {
      onChange({
        signatoryName: defaultSignature.signatoryName || '',
        signatoryTitle: defaultSignature.signatoryTitle || '',
        signatureImage: defaultSignature.signatureImage || '',
        signatureLocation: defaultSignature.signatureLocation || '',
        useCurrentDate: defaultSignature.useCurrentDate ?? false,
      });
    }
  };

  const getImageUrl = (imageData?: string) => {
    if (!imageData) return null;
    // Les signatures sont maintenant stockées en base64 (data URL)
    // ou en URL complète (http/https) pour rétrocompatibilité
    return imageData;
  };

  const hasValue =
    value.signatoryName ||
    value.signatoryTitle ||
    value.signatureImage ||
    value.signatureLocation ||
    value.useCurrentDate;
  const hasDefault =
    defaultSignature?.signatoryName ||
    defaultSignature?.signatoryTitle ||
    defaultSignature?.signatureImage ||
    defaultSignature?.signatureLocation ||
    defaultSignature?.useCurrentDate;

  return (
    <div className="flex flex-col gap-4 p-4 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[rgb(var(--color-text))]">
          {label}
        </h3>
        <div className="flex gap-2">
          {hasDefault && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleUseDefault}
              disabled={disabled}
            >
              Utiliser signature par défaut
            </Button>
          )}
          {hasValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Nom du signataire */}
      <Input
        label="Nom du signataire"
        type="text"
        value={value.signatoryName || ''}
        onChange={(e) => onChange({ ...value, signatoryName: e.target.value })}
        placeholder="ex: Jean Dupont"
        disabled={disabled}
        fullWidth
      />

      {/* Titre du signataire */}
      <Input
        label="Titre / Fonction"
        type="text"
        value={value.signatoryTitle || ''}
        onChange={(e) => onChange({ ...value, signatoryTitle: e.target.value })}
        placeholder="ex: Directeur Général"
        disabled={disabled}
        fullWidth
      />

      {/* Lieu de signature */}
      <Input
        label="Lieu de signature"
        type="text"
        value={value.signatureLocation || ''}
        onChange={(e) =>
          onChange({ ...value, signatureLocation: e.target.value })
        }
        placeholder="ex: MONTPELLIER"
        helperText="Ville pour la mention « Fait à ... »"
        disabled={disabled}
        fullWidth
      />

      {/* Utiliser la date du jour */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value.useCurrentDate || false}
          onChange={(e) =>
            onChange({ ...value, useCurrentDate: e.target.checked })
          }
          disabled={disabled}
          className="w-4 h-4 rounded border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
        />
        <span className="text-sm text-[rgb(var(--color-text))]">
          Utiliser la date du jour à la génération du PDF
        </span>
      </label>

      {/* Upload d'image */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-[rgb(var(--color-text))]">
          Image de signature
        </label>

        {/* Preview de l'image */}
        {value.signatureImage && (
          <div className="relative w-full max-w-xs p-4 border border-[rgb(var(--color-border))] rounded-lg bg-white">
            <img
              src={getImageUrl(value.signatureImage) || ''}
              alt="Signature"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Bouton d'upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading
              ? 'Upload en cours...'
              : value.signatureImage
                ? "Changer l'image"
                : 'Choisir une image'}
          </Button>
          <p className="mt-1 text-xs text-[rgb(var(--color-text-muted))]">
            PNG ou JPEG, max 2MB
          </p>
        </div>

        {/* Erreur d'upload */}
        {uploadError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {uploadError}
          </p>
        )}
      </div>

      {/* Erreur globale */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
