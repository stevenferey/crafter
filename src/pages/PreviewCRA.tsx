import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Button, StatusBadge, Spinner } from '@/components/ui';
import { type CRAStatus } from '@/constants/cra.constants';
import { formatMonthYear } from '@/lib/monthUtils';
import { useCRA } from '@/hooks/useCRA';
import { useCompanyStore } from '@/stores/company.store';
import { CRAPDFDocument } from '@/components/pdf';
import type { Company } from '@/types/company.types';

export function PreviewCRA() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { cra: selectedCRA, isLoading, error } = useCRA(id);
  const companies = useCompanyStore((state) => state.companies);
  const fetchCompanies = useCompanyStore((state) => state.fetchCompanies);
  const [isExporting, setIsExporting] = useState(false);

  // Charger les sociétés au montage
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Récupérer les objets Company complets
  const getCompany = useCallback(
    (companyId: string): Company | undefined => {
      return companies.find((c) => c.id === companyId);
    },
    [companies],
  );

  const clientCompany = selectedCRA
    ? getCompany(selectedCRA.client_id)
    : undefined;
  const providerCompany = selectedCRA
    ? getCompany(selectedCRA.provider_id)
    : undefined;

  // Fonction helper pour obtenir le nom d'une société
  const getCompanyName = (companyId: string) => {
    const company = getCompany(companyId);
    return company?.designation || 'N/A';
  };

  const handleExportPDF = async () => {
    if (!selectedCRA || !clientCompany || !providerCompany) return;

    setIsExporting(true);
    try {
      const doc = (
        <CRAPDFDocument
          cra={selectedCRA}
          clientCompany={clientCompany}
          providerCompany={providerCompany}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      // Créer un nom de fichier descriptif : CRA-Prestataire-Client-Mois-Année.pdf
      const monthYear = formatMonthYear(selectedCRA.month, selectedCRA.year);
      const filename =
        `CRA-${providerCompany.designation}-${clientCompany.designation}-${monthYear}.pdf`
          .replace(/\s+/g, '-')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Supprime les accents

      // Déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
      alert("Une erreur est survenue lors de l'export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Loader pendant le chargement
  if (isLoading && !selectedCRA) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
              Chargement du CRA...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le CRA n'existe pas
  if (error || (!isLoading && !selectedCRA)) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                CRA introuvable
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error ||
                  "Le CRA demandé n'existe pas ou n'a pas pu être chargé."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/dashboard')}
              >
                Retour au dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCRA) return null;

  // Attendre que les companies soient chargées
  if (!clientCompany || !providerCompany) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
              Chargement des informations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-[rgb(var(--color-text))]"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-[rgb(var(--color-text))]">
            CRA #{id?.slice(0, 8)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">
                Prévisualisation du CRA
              </h1>
              <StatusBadge status={selectedCRA.status as CRAStatus} />
            </div>
            <p className="text-[rgb(var(--color-text-secondary))] mt-1">
              {formatMonthYear(selectedCRA.month, selectedCRA.year)} -{' '}
              {getCompanyName(selectedCRA.provider_id)} →{' '}
              {getCompanyName(selectedCRA.client_id)}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/cra/${id}/edit`)}
            >
              Éditer
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Export en cours...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Exporter PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="bg-[rgb(var(--color-surface))] rounded-lg border border-[rgb(var(--color-border))] shadow-sm overflow-hidden">
        <PDFViewer
          width="100%"
          height={1200}
          showToolbar={true}
          className="border-0"
        >
          <CRAPDFDocument
            cra={selectedCRA}
            clientCompany={clientCompany}
            providerCompany={providerCompany}
          />
        </PDFViewer>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Retour au dashboard
        </Button>
      </div>
    </div>
  );
}
