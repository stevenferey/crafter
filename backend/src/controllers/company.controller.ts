import { Request, Response } from 'express';
import { CompanyModel } from '../models/company.model.js';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
  Repertoire,
  Liste,
  Registre,
} from '../types/company.types.js';

/**
 * Helper pour obtenir le user_id à filtrer
 * Retourne undefined pour les admins (qui voient tout)
 */
function getUserIdFilter(req: Request): string | undefined {
  if (!req.user) return undefined;
  // Les admins peuvent voir toutes les sociétés
  if (req.user.role === 'admin') return undefined;
  return req.user.id;
}

/**
 * Regex pour la validation des formats français
 */
const VALIDATION_REGEX = {
  SIREN: /^\d{9}$/,
  SIRET: /^\d{14}$/,
  POSTAL_CODE: /^\d{5}$/,
  PHONE: /^\d{10}$/,
  EMAIL: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  TVA: /^FR\d{11}$/,
};

/**
 * Listes des valeurs valides pour les enums
 */
const VALID_REPERTOIRES: Repertoire[] = ['SIREN', 'SIRET'];
const VALID_LISTES: Liste[] = ['NAF', 'APE'];
const VALID_REGISTRES: Registre[] = [
  'RCS',
  'RM',
  'RCS/RM',
  'RNE',
  'RBE',
  'RSAC',
  'RNA',
  'REE',
  'RS',
  'RCC',
  'RAC',
  'RMJPM',
  'RMJLE',
  'ROVS',
  'ORIAS',
  'RAI',
  'RCT',
  'TRM',
  'LVIC',
  'STP',
  'REEP',
  'ROF',
  'IFP',
  'ROA',
  'RNROM',
  'RA',
  'RESS',
  'CNAPS',
  'RPI',
];

/**
 * Controller pour gérer les requêtes HTTP liées aux sociétés
 */
export class CompanyController {
  /**
   * Valide les données d'une société
   */
  private static validateCompanyData(
    data: Partial<CreateCompanyInput>,
    isUpdate = false,
  ): { valid: boolean; error?: string } {
    // Validation des champs obligatoires (seulement pour la création)
    if (!isUpdate) {
      if (!data.designation) {
        return { valid: false, error: 'La désignation est obligatoire' };
      }
      if (!data.address) {
        return { valid: false, error: "L'adresse est obligatoire" };
      }
      if (!data.city) {
        return { valid: false, error: 'La ville est obligatoire' };
      }
      if (!data.postal_code) {
        return { valid: false, error: 'Le code postal est obligatoire' };
      }
      if (!data.country) {
        return { valid: false, error: 'Le pays est obligatoire' };
      }
      if (!data.email) {
        return { valid: false, error: "L'email est obligatoire" };
      }
      if (!data.repertoire) {
        return { valid: false, error: 'Le répertoire est obligatoire' };
      }
      if (!data.repertoire_number) {
        return {
          valid: false,
          error: 'Le numéro de répertoire est obligatoire',
        };
      }
      if (!data.liste) {
        return { valid: false, error: "La liste d'activité est obligatoire" };
      }
      if (data.dispense === undefined) {
        return { valid: false, error: 'Le champ dispense est obligatoire' };
      }
      if (data.exemption === undefined) {
        return { valid: false, error: 'Le champ exemption est obligatoire' };
      }
    }

    // Validation du code postal
    if (
      data.postal_code &&
      !VALIDATION_REGEX.POSTAL_CODE.test(data.postal_code)
    ) {
      return {
        valid: false,
        error: 'Le code postal doit contenir exactement 5 chiffres',
      };
    }

    // Validation de l'email
    if (data.email && !VALIDATION_REGEX.EMAIL.test(data.email)) {
      return { valid: false, error: "Le format de l'email est invalide" };
    }

    // Validation du téléphone
    if (data.phone && !VALIDATION_REGEX.PHONE.test(data.phone)) {
      return {
        valid: false,
        error: 'Le téléphone doit contenir exactement 10 chiffres',
      };
    }

    // Validation du répertoire
    if (data.repertoire && !VALID_REPERTOIRES.includes(data.repertoire)) {
      return {
        valid: false,
        error: 'Le répertoire doit être SIREN ou SIRET',
      };
    }

    // Validation du numéro de répertoire selon le type
    if (data.repertoire_number && data.repertoire) {
      if (
        data.repertoire === 'SIREN' &&
        !VALIDATION_REGEX.SIREN.test(data.repertoire_number)
      ) {
        return {
          valid: false,
          error: 'Le numéro SIREN doit contenir exactement 9 chiffres',
        };
      }
      if (
        data.repertoire === 'SIRET' &&
        !VALIDATION_REGEX.SIRET.test(data.repertoire_number)
      ) {
        return {
          valid: false,
          error: 'Le numéro SIRET doit contenir exactement 14 chiffres',
        };
      }
    }

    // Validation du registre
    if (data.registre && !VALID_REGISTRES.includes(data.registre)) {
      return { valid: false, error: 'Le registre sélectionné est invalide' };
    }

    // Validation de la liste
    if (data.liste && !VALID_LISTES.includes(data.liste)) {
      return {
        valid: false,
        error: "La liste d'activité doit être NAF ou APE",
      };
    }

    // Validation du numéro de TVA
    if (data.tva_number && !VALIDATION_REGEX.TVA.test(data.tva_number)) {
      return {
        valid: false,
        error:
          'Le numéro de TVA intracommunautaire doit être au format FR suivi de 11 chiffres',
      };
    }

    return { valid: true };
  }

  /**
   * GET /api/companies
   * Récupère toutes les sociétés avec filtres optionnels
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userIdFilter = getUserIdFilter(req);

      const filters: CompanyFilters = {
        user_id: userIdFilter,
        designation: req.query.designation as string,
        city: req.query.city as string,
        repertoire: req.query.repertoire as Repertoire,
        registre: req.query.registre as Registre,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const companies = await CompanyModel.findAll(filters);
      const total = await CompanyModel.count(filters);

      res.json({
        success: true,
        data: companies,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset || 0) + companies.length < total,
        },
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch companies',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/companies/:id
   * Récupère une société spécifique par son ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userIdFilter = getUserIdFilter(req);
      const company = await CompanyModel.findById(id, userIdFilter);

      if (!company) {
        res.status(404).json({
          success: false,
          error: 'Company not found',
          message: `No company found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/companies
   * Crée une nouvelle société
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'unauthorized',
          message: 'Authentification requise',
        });
        return;
      }

      const companyData: CreateCompanyInput = {
        user_id: req.user.id,
        designation: req.body.designation,
        address: req.body.address,
        complement: req.body.complement || undefined,
        city: req.body.city,
        postal_code: req.body.postal_code,
        country: req.body.country || 'France',
        email: req.body.email,
        phone: req.body.phone || undefined,
        repertoire: req.body.repertoire || 'SIREN',
        repertoire_number: req.body.repertoire_number,
        dispense: req.body.dispense || false,
        registre: req.body.registre || undefined,
        registre_number: req.body.registre_number || undefined,
        liste: req.body.liste || 'NAF',
        code: req.body.code || undefined,
        exemption: req.body.exemption || false,
        tva_number: req.body.tva_number || undefined,
        default_signatory_name: req.body.default_signatory_name || undefined,
        default_signatory_title: req.body.default_signatory_title || undefined,
        default_signature_image: req.body.default_signature_image || undefined,
        default_signature_location:
          req.body.default_signature_location || undefined,
        default_use_current_date: req.body.default_use_current_date ?? false,
      };

      // Validation
      const validation = this.validateCompanyData(companyData, false);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: validation.error,
        });
        return;
      }

      const newCompany = await CompanyModel.create(companyData);

      res.status(201).json({
        success: true,
        data: newCompany,
        message: 'Company created successfully',
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create company',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/companies/:id
   * Met à jour une société existante
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userIdFilter = getUserIdFilter(req);
      const updateData: UpdateCompanyInput = {};

      // Construire les données de mise à jour à partir du body
      if (req.body.designation !== undefined)
        updateData.designation = req.body.designation;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.complement !== undefined)
        updateData.complement = req.body.complement || null;
      if (req.body.city !== undefined) updateData.city = req.body.city;
      if (req.body.postal_code !== undefined)
        updateData.postal_code = req.body.postal_code;
      if (req.body.country !== undefined) updateData.country = req.body.country;
      if (req.body.email !== undefined) updateData.email = req.body.email;
      if (req.body.phone !== undefined)
        updateData.phone = req.body.phone || null;
      if (req.body.repertoire !== undefined)
        updateData.repertoire = req.body.repertoire;
      if (req.body.repertoire_number !== undefined)
        updateData.repertoire_number = req.body.repertoire_number;
      if (req.body.dispense !== undefined)
        updateData.dispense = req.body.dispense;
      if (req.body.registre !== undefined)
        updateData.registre = req.body.registre || null;
      if (req.body.registre_number !== undefined)
        updateData.registre_number = req.body.registre_number || null;
      if (req.body.liste !== undefined) updateData.liste = req.body.liste;
      if (req.body.code !== undefined) updateData.code = req.body.code || null;
      if (req.body.exemption !== undefined)
        updateData.exemption = req.body.exemption;
      if (req.body.tva_number !== undefined)
        updateData.tva_number = req.body.tva_number || null;
      if (req.body.default_signatory_name !== undefined)
        updateData.default_signatory_name =
          req.body.default_signatory_name || null;
      if (req.body.default_signatory_title !== undefined)
        updateData.default_signatory_title =
          req.body.default_signatory_title || null;
      if (req.body.default_signature_image !== undefined)
        updateData.default_signature_image =
          req.body.default_signature_image || null;
      if (req.body.default_signature_location !== undefined)
        updateData.default_signature_location =
          req.body.default_signature_location || null;
      if (req.body.default_use_current_date !== undefined)
        updateData.default_use_current_date = req.body.default_use_current_date;

      // Validation
      const validation = this.validateCompanyData(updateData, true);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: validation.error,
        });
        return;
      }

      const updatedCompany = await CompanyModel.update(id, updateData, userIdFilter);

      if (!updatedCompany) {
        res.status(404).json({
          success: false,
          error: 'Company not found',
          message: `No company found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        data: updatedCompany,
        message: 'Company updated successfully',
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update company',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/companies/:id
   * Supprime une société
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userIdFilter = getUserIdFilter(req);
      const deleted = await CompanyModel.delete(id, userIdFilter);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Company not found',
          message: `No company found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting company:', error);

      // Gérer l'erreur si la société est utilisée dans des CRA
      if (
        error instanceof Error &&
        error.message.includes('est utilisée dans')
      ) {
        res.status(400).json({
          success: false,
          error: 'Company in use',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete company',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
