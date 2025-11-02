import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';

const router = Router();

/**
 * Routes pour les sociétés
 * Base path: /api/companies
 */

// GET /api/companies - Liste toutes les sociétés avec filtres optionnels
router.get('/', (req, res) => CompanyController.getAll(req, res));

// GET /api/companies/:id - Récupère une société spécifique
router.get('/:id', (req, res) => CompanyController.getById(req, res));

// POST /api/companies - Crée une nouvelle société
router.post('/', (req, res) => CompanyController.create(req, res));

// PUT /api/companies/:id - Met à jour une société existante
router.put('/:id', (req, res) => CompanyController.update(req, res));

// DELETE /api/companies/:id - Supprime une société
router.delete('/:id', (req, res) => CompanyController.delete(req, res));

export default router;
