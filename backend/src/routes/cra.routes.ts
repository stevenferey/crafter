import { Router } from 'express';
import { CRAController } from '../controllers/cra.controller.js';

const router = Router();

/**
 * Routes pour les CRA
 * Base path: /api/cras
 */

// GET /api/cras - Liste tous les CRA avec filtres optionnels
router.get('/', CRAController.getAll);

// GET /api/cras/:id - Récupère un CRA spécifique
router.get('/:id', CRAController.getById);

// POST /api/cras - Crée un nouveau CRA
router.post('/', CRAController.create);

// PUT /api/cras/:id - Met à jour un CRA existant
router.put('/:id', CRAController.update);

// DELETE /api/cras/:id - Supprime un CRA
router.delete('/:id', CRAController.delete);

export default router;
