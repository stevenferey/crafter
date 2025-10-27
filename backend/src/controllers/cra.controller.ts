import { Request, Response } from 'express';
import { CRAModel } from '../models/cra.model.js';
import { CreateCRAInput, UpdateCRAInput, CRAFilters } from '../types/cra.types.js';

/**
 * Controller pour gérer les requêtes HTTP liées aux CRA
 */
export class CRAController {
  /**
   * GET /api/cras
   * Récupère tous les CRA avec filtres optionnels
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: CRAFilters = {
        status: req.query.status as string,
        client: req.query.client as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
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
      const { id } = req.params;
      const cra = await CRAModel.findById(id);

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
   * Crée un nouveau CRA
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Validation basique
      const { date, client, activities } = req.body;

      if (!date || !client || !activities || !Array.isArray(activities)) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'date, client, and activities (array) are required',
        });
        return;
      }

      if (activities.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          message: 'At least one activity is required',
        });
        return;
      }

      // Valider chaque activité
      for (const activity of activities) {
        if (!activity.description || typeof activity.hours !== 'number' || !activity.category) {
          res.status(400).json({
            success: false,
            error: 'Invalid activity',
            message: 'Each activity must have description, hours (number), and category',
          });
          return;
        }

        if (activity.hours <= 0 || activity.hours > 24) {
          res.status(400).json({
            success: false,
            error: 'Invalid hours',
            message: 'Hours must be between 0 and 24',
          });
          return;
        }
      }

      const craData: CreateCRAInput = {
        date,
        client,
        activities,
        status: req.body.status || 'draft',
      };

      const newCRA = await CRAModel.create(craData);

      res.status(201).json({
        success: true,
        data: newCRA,
        message: 'CRA created successfully',
      });
    } catch (error) {
      console.error('Error creating CRA:', error);
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
      const updateData: UpdateCRAInput = {};

      // Construire les données de mise à jour à partir du body
      if (req.body.date !== undefined) updateData.date = req.body.date;
      if (req.body.client !== undefined) updateData.client = req.body.client;
      if (req.body.status !== undefined) updateData.status = req.body.status;
      if (req.body.activities !== undefined) {
        // Valider les activités si présentes
        if (!Array.isArray(req.body.activities)) {
          res.status(400).json({
            success: false,
            error: 'Invalid input',
            message: 'activities must be an array',
          });
          return;
        }

        for (const activity of req.body.activities) {
          if (!activity.description || typeof activity.hours !== 'number' || !activity.category) {
            res.status(400).json({
              success: false,
              error: 'Invalid activity',
              message: 'Each activity must have description, hours (number), and category',
            });
            return;
          }

          if (activity.hours <= 0 || activity.hours > 24) {
            res.status(400).json({
              success: false,
              error: 'Invalid hours',
              message: 'Hours must be between 0 and 24',
            });
            return;
          }
        }

        updateData.activities = req.body.activities;
      }

      const updatedCRA = await CRAModel.update(id, updateData);

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
      const { id } = req.params;
      const deleted = await CRAModel.delete(id);

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
