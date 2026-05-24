import { Request, Response } from 'express';
import { CRAModel } from '../models/cra.model.js';
import {
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
} from '../types/cra.types.js';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valide qu'une valeur est une date ISO YYYY-MM-DD valide, ou null/undefined.
 * Retourne true si OK, false sinon.
 */
function isValidIsoDateOrNullish(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (typeof value !== 'string') return false;
  if (!ISO_DATE_REGEX.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Helper pour obtenir le user_id à filtrer
 * Retourne undefined pour les admins (qui voient tout)
 */
function getUserIdFilter(req: Request): string | undefined {
  if (!req.user) return undefined;
  // Les admins peuvent voir tous les CRA
  if (req.user.role === 'admin') return undefined;
  return req.user.id;
}

/**
 * Controller pour gérer les requêtes HTTP liées aux CRA mensuels
 */
export class CRAController {
  /**
   * GET /api/cras
   * Récupère tous les CRA avec filtres optionnels
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userIdFilter = getUserIdFilter(req);

      const filters: CRAFilters = {
        user_id: userIdFilter,
        status: req.query.status as string,
        client: req.query.client as string,
        provider: req.query.provider as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month
          ? parseInt(req.query.month as string)
          : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const cras = await CRAModel.findAll(filters);
      const total = await CRAModel.count(filters);

      res.json({
        success: true,
        data: cras,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (filters.offset || 0) + cras.length < total,
        },
      });
    } catch (error) {
      console.error('Error fetching CRAs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch CRAs',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/cras/:id
   * Récupère un CRA spécifique par son ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userIdFilter = getUserIdFilter(req);
      const cra = await CRAModel.findById(id, userIdFilter);

      if (!cra) {
        res.status(404).json({
          success: false,
          error: 'CRA not found',
          message: `No CRA found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        data: cra,
      });
    } catch (error) {
      console.error('Error fetching CRA:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch CRA',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/cras
   * Crée un nouveau CRA mensuel
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

      // Validation basique
      const { month, year, worked_days, client_id, provider_id } = req.body;

      if (!month || !year || !worked_days || !client_id || !provider_id) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message:
            'month, year, worked_days, client_id, and provider_id are required',
        });
        return;
      }

      // Validation: month entre 1 et 12
      if (typeof month !== 'number' || month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          error: 'Invalid month',
          message: 'Month must be a number between 1 and 12',
        });
        return;
      }

      // Validation: year valide
      if (typeof year !== 'number' || year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          error: 'Invalid year',
          message: 'Year must be a number between 2000 and 2100',
        });
        return;
      }

      // Validation: worked_days est un tableau
      if (!Array.isArray(worked_days)) {
        res.status(400).json({
          success: false,
          error: 'Invalid worked_days',
          message: 'worked_days must be an array of numbers',
        });
        return;
      }

      // Validation: au moins un jour travaillé
      if (worked_days.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid worked_days',
          message: 'At least one worked day is required',
        });
        return;
      }

      // Validation: client et prestataire doivent être différents
      if (client_id === provider_id) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'Le client et le prestataire doivent être différents',
        });
        return;
      }

      if (
        !isValidIsoDateOrNullish(req.body.client_signature_date) ||
        !isValidIsoDateOrNullish(req.body.provider_signature_date)
      ) {
        res.status(400).json({
          success: false,
          error: 'Invalid signature date',
          message: 'La date de signature doit être au format YYYY-MM-DD',
        });
        return;
      }

      const craData: CreateCRAInput = {
        user_id: req.user.id,
        month,
        year,
        worked_days,
        comment: req.body.comment,
        client_id,
        provider_id,
        status: req.body.status || 'draft',
        client_signatory_name: req.body.client_signatory_name || undefined,
        client_signatory_title: req.body.client_signatory_title || undefined,
        client_signature_image: req.body.client_signature_image || undefined,
        client_signature_location:
          req.body.client_signature_location || undefined,
        client_use_current_date: req.body.client_use_current_date ?? undefined,
        client_signature_date: req.body.client_signature_date || undefined,
        provider_signatory_name: req.body.provider_signatory_name || undefined,
        provider_signatory_title:
          req.body.provider_signatory_title || undefined,
        provider_signature_image:
          req.body.provider_signature_image || undefined,
        provider_signature_location:
          req.body.provider_signature_location || undefined,
        provider_use_current_date:
          req.body.provider_use_current_date ?? undefined,
        provider_signature_date: req.body.provider_signature_date || undefined,
      };

      const newCRA = await CRAModel.create(craData);

      res.status(201).json({
        success: true,
        data: newCRA,
        message: 'CRA created successfully',
      });
    } catch (error) {
      console.error('Error creating CRA:', error);

      // Gérer l'erreur de contrainte unique (code PostgreSQL 23505)
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        res.status(409).json({
          success: false,
          error: 'Duplicate CRA',
          message:
            'Un CRA existe déjà pour ce mois, cette année et cette combinaison client/prestataire',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create CRA',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/cras/:id
   * Met à jour un CRA existant
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userIdFilter = getUserIdFilter(req);
      const updateData: UpdateCRAInput = {};

      // Validation: si on met à jour client_id et provider_id, ils doivent être différents
      if (
        req.body.client_id !== undefined &&
        req.body.provider_id !== undefined &&
        req.body.client_id === req.body.provider_id
      ) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'Le client et le prestataire doivent être différents',
        });
        return;
      }

      // Validation du mois si présent
      if (req.body.month !== undefined) {
        if (
          typeof req.body.month !== 'number' ||
          req.body.month < 1 ||
          req.body.month > 12
        ) {
          res.status(400).json({
            success: false,
            error: 'Invalid month',
            message: 'Month must be a number between 1 and 12',
          });
          return;
        }
        updateData.month = req.body.month;
      }

      // Validation de l'année si présente
      if (req.body.year !== undefined) {
        if (
          typeof req.body.year !== 'number' ||
          req.body.year < 2000 ||
          req.body.year > 2100
        ) {
          res.status(400).json({
            success: false,
            error: 'Invalid year',
            message: 'Year must be a number between 2000 and 2100',
          });
          return;
        }
        updateData.year = req.body.year;
      }

      // Validation des jours travaillés si présents
      if (req.body.worked_days !== undefined) {
        if (!Array.isArray(req.body.worked_days)) {
          res.status(400).json({
            success: false,
            error: 'Invalid worked_days',
            message: 'worked_days must be an array of numbers',
          });
          return;
        }
        updateData.worked_days = req.body.worked_days;
      }

      // Construire les données de mise à jour à partir du body
      if (req.body.comment !== undefined) updateData.comment = req.body.comment;
      if (req.body.client_id !== undefined)
        updateData.client_id = req.body.client_id;
      if (req.body.provider_id !== undefined)
        updateData.provider_id = req.body.provider_id;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      // Signatures - accepter null et undefined
      if (req.body.client_signatory_name !== undefined)
        updateData.client_signatory_name =
          req.body.client_signatory_name || null;
      if (req.body.client_signatory_title !== undefined)
        updateData.client_signatory_title =
          req.body.client_signatory_title || null;
      if (req.body.client_signature_image !== undefined)
        updateData.client_signature_image =
          req.body.client_signature_image || null;
      if (req.body.provider_signatory_name !== undefined)
        updateData.provider_signatory_name =
          req.body.provider_signatory_name || null;
      if (req.body.provider_signatory_title !== undefined)
        updateData.provider_signatory_title =
          req.body.provider_signatory_title || null;
      if (req.body.provider_signature_image !== undefined)
        updateData.provider_signature_image =
          req.body.provider_signature_image || null;
      if (req.body.client_signature_location !== undefined)
        updateData.client_signature_location =
          req.body.client_signature_location || null;
      if (req.body.client_use_current_date !== undefined)
        updateData.client_use_current_date = req.body.client_use_current_date;
      if (req.body.client_signature_date !== undefined) {
        if (!isValidIsoDateOrNullish(req.body.client_signature_date)) {
          res.status(400).json({
            success: false,
            error: 'Invalid signature date',
            message:
              'La date de signature client doit être au format YYYY-MM-DD',
          });
          return;
        }
        updateData.client_signature_date =
          req.body.client_signature_date || null;
      }
      if (req.body.provider_signature_location !== undefined)
        updateData.provider_signature_location =
          req.body.provider_signature_location || null;
      if (req.body.provider_use_current_date !== undefined)
        updateData.provider_use_current_date =
          req.body.provider_use_current_date;
      if (req.body.provider_signature_date !== undefined) {
        if (!isValidIsoDateOrNullish(req.body.provider_signature_date)) {
          res.status(400).json({
            success: false,
            error: 'Invalid signature date',
            message:
              'La date de signature prestataire doit être au format YYYY-MM-DD',
          });
          return;
        }
        updateData.provider_signature_date =
          req.body.provider_signature_date || null;
      }

      const updatedCRA = await CRAModel.update(
        id as string,
        updateData,
        userIdFilter,
      );

      if (!updatedCRA) {
        res.status(404).json({
          success: false,
          error: 'CRA not found',
          message: `No CRA found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        data: updatedCRA,
        message: 'CRA updated successfully',
      });
    } catch (error) {
      console.error('Error updating CRA:', error);

      // Gérer l'erreur de contrainte unique (code PostgreSQL 23505)
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        res.status(409).json({
          success: false,
          error: 'Duplicate CRA',
          message:
            'Un CRA existe déjà pour ce mois, cette année et cette combinaison client/prestataire',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update CRA',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/cras/:id
   * Supprime un CRA
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userIdFilter = getUserIdFilter(req);
      const deleted = await CRAModel.delete(id, userIdFilter);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'CRA not found',
          message: `No CRA found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        message: 'CRA deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting CRA:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete CRA',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
