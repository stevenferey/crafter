import { query } from '../config/database.js';
import {
  CRA,
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
} from '../types/cra.types.js';

/**
 * Model pour les opérations CRUD sur les CRA mensuels
 */
export class CRAModel {
  /**
   * Récupère tous les CRA avec filtres optionnels
   */
  static async findAll(filters: CRAFilters = {}): Promise<CRA[]> {
    const {
      user_id,
      status,
      client,
      provider,
      year,
      month,
      limit = 50,
      offset = 0,
    } = filters;

    let queryText = `
      SELECT
        id,
        user_id,
        month,
        year,
        worked_days,
        comment,
        client_id,
        provider_id,
        status,
        client_signatory_name,
        client_signatory_title,
        client_signature_image,
        client_signature_location,
        client_use_current_date,
        provider_signatory_name,
        provider_signatory_title,
        provider_signature_image,
        provider_signature_location,
        provider_use_current_date,
        created_at,
        updated_at
      FROM cras
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    // Filtrage par utilisateur (obligatoire pour les non-admin)
    if (user_id) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (client) {
      queryText += ` AND client_id = $${paramIndex}`;
      params.push(client);
      paramIndex++;
    }

    if (provider) {
      queryText += ` AND provider_id = $${paramIndex}`;
      params.push(provider);
      paramIndex++;
    }

    if (year !== undefined) {
      queryText += ` AND year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (month !== undefined) {
      queryText += ` AND month = $${paramIndex}`;
      params.push(month);
      paramIndex++;
    }

    queryText += `
      ORDER BY year DESC, month DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query<CRA>(queryText, params);
    return result.rows;
  }

  /**
   * Récupère un CRA par son ID
   */
  static async findById(id: string, userId?: string): Promise<CRA | null> {
    let queryText = `
      SELECT
        id,
        user_id,
        month,
        year,
        worked_days,
        comment,
        client_id,
        provider_id,
        status,
        client_signatory_name,
        client_signatory_title,
        client_signature_image,
        client_signature_location,
        client_use_current_date,
        provider_signatory_name,
        provider_signatory_title,
        provider_signature_image,
        provider_signature_location,
        provider_use_current_date,
        created_at,
        updated_at
      FROM cras
      WHERE id = $1
    `;

    const params: unknown[] = [id];

    // Si userId fourni, filtrer par propriétaire (sauf admin)
    if (userId) {
      queryText += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query<CRA>(queryText, params);
    return result.rows[0] || null;
  }

  /**
   * Crée un nouveau CRA mensuel
   */
  static async create(data: CreateCRAInput): Promise<CRA> {
    const queryText = `
      INSERT INTO cras (
        user_id,
        month,
        year,
        worked_days,
        comment,
        client_id,
        provider_id,
        status,
        client_signatory_name,
        client_signatory_title,
        client_signature_image,
        client_signature_location,
        client_use_current_date,
        provider_signatory_name,
        provider_signatory_title,
        provider_signature_image,
        provider_signature_location,
        provider_use_current_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING
        id,
        user_id,
        month,
        year,
        worked_days,
        comment,
        client_id,
        provider_id,
        status,
        client_signatory_name,
        client_signatory_title,
        client_signature_image,
        client_signature_location,
        client_use_current_date,
        provider_signatory_name,
        provider_signatory_title,
        provider_signature_image,
        provider_signature_location,
        provider_use_current_date,
        created_at,
        updated_at
    `;

    const result = await query<CRA>(queryText, [
      data.user_id,
      data.month,
      data.year,
      data.worked_days,
      data.comment || null,
      data.client_id,
      data.provider_id,
      data.status || 'draft',
      data.client_signatory_name || null,
      data.client_signatory_title || null,
      data.client_signature_image || null,
      data.client_signature_location || null,
      data.client_use_current_date ?? null,
      data.provider_signatory_name || null,
      data.provider_signatory_title || null,
      data.provider_signature_image || null,
      data.provider_signature_location || null,
      data.provider_use_current_date ?? null,
    ]);

    return result.rows[0];
  }

  /**
   * Met à jour un CRA existant
   */
  static async update(id: string, data: UpdateCRAInput, userId?: string): Promise<CRA | null> {
    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.month !== undefined) {
      updates.push(`month = $${paramIndex}`);
      params.push(data.month);
      paramIndex++;
    }

    if (data.year !== undefined) {
      updates.push(`year = $${paramIndex}`);
      params.push(data.year);
      paramIndex++;
    }

    if (data.worked_days !== undefined) {
      updates.push(`worked_days = $${paramIndex}`);
      params.push(data.worked_days);
      paramIndex++;
    }

    if (data.comment !== undefined) {
      updates.push(`comment = $${paramIndex}`);
      params.push(data.comment);
      paramIndex++;
    }

    if (data.client_id !== undefined) {
      updates.push(`client_id = $${paramIndex}`);
      params.push(data.client_id);
      paramIndex++;
    }

    if (data.provider_id !== undefined) {
      updates.push(`provider_id = $${paramIndex}`);
      params.push(data.provider_id);
      paramIndex++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(data.status);
      paramIndex++;
    }

    if (data.client_signatory_name !== undefined) {
      updates.push(`client_signatory_name = $${paramIndex}`);
      params.push(data.client_signatory_name || null);
      paramIndex++;
    }

    if (data.client_signatory_title !== undefined) {
      updates.push(`client_signatory_title = $${paramIndex}`);
      params.push(data.client_signatory_title || null);
      paramIndex++;
    }

    if (data.client_signature_image !== undefined) {
      updates.push(`client_signature_image = $${paramIndex}`);
      params.push(data.client_signature_image || null);
      paramIndex++;
    }

    if (data.client_signature_location !== undefined) {
      updates.push(`client_signature_location = $${paramIndex}`);
      params.push(data.client_signature_location || null);
      paramIndex++;
    }

    if (data.client_use_current_date !== undefined) {
      updates.push(`client_use_current_date = $${paramIndex}`);
      params.push(data.client_use_current_date);
      paramIndex++;
    }

    if (data.provider_signatory_name !== undefined) {
      updates.push(`provider_signatory_name = $${paramIndex}`);
      params.push(data.provider_signatory_name || null);
      paramIndex++;
    }

    if (data.provider_signatory_title !== undefined) {
      updates.push(`provider_signatory_title = $${paramIndex}`);
      params.push(data.provider_signatory_title || null);
      paramIndex++;
    }

    if (data.provider_signature_image !== undefined) {
      updates.push(`provider_signature_image = $${paramIndex}`);
      params.push(data.provider_signature_image || null);
      paramIndex++;
    }

    if (data.provider_signature_location !== undefined) {
      updates.push(`provider_signature_location = $${paramIndex}`);
      params.push(data.provider_signature_location || null);
      paramIndex++;
    }

    if (data.provider_use_current_date !== undefined) {
      updates.push(`provider_use_current_date = $${paramIndex}`);
      params.push(data.provider_use_current_date);
      paramIndex++;
    }

    // Toujours mettre à jour updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      // Seulement updated_at, récupérer le CRA existant
      return this.findById(id, userId);
    }

    // Ajouter l'ID à la fin des paramètres
    params.push(id);

    let whereClause = `WHERE id = $${paramIndex}`;
    paramIndex++;

    // Si userId fourni, filtrer par propriétaire (sauf admin)
    if (userId) {
      whereClause += ` AND user_id = $${paramIndex}`;
      params.push(userId);
    }

    const updateQuery = `
      UPDATE cras
      SET ${updates.join(', ')}
      ${whereClause}
      RETURNING
        id,
        user_id,
        month,
        year,
        worked_days,
        comment,
        client_id,
        provider_id,
        status,
        client_signatory_name,
        client_signatory_title,
        client_signature_image,
        client_signature_location,
        client_use_current_date,
        provider_signatory_name,
        provider_signatory_title,
        provider_signature_image,
        provider_signature_location,
        provider_use_current_date,
        created_at,
        updated_at
    `;

    const result = await query<CRA>(updateQuery, params);
    return result.rows[0] || null;
  }

  /**
   * Supprime un CRA
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    let queryText = 'DELETE FROM cras WHERE id = $1';
    const params: unknown[] = [id];

    // Si userId fourni, filtrer par propriétaire (sauf admin)
    if (userId) {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await query(queryText, params);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Compte le nombre total de CRA avec filtres
   */
  static async count(filters: CRAFilters = {}): Promise<number> {
    const { user_id, status, client, provider, year, month } = filters;

    let queryText = 'SELECT COUNT(*) as count FROM cras WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    // Filtrage par utilisateur (obligatoire pour les non-admin)
    if (user_id) {
      queryText += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (client) {
      queryText += ` AND client_id = $${paramIndex}`;
      params.push(client);
      paramIndex++;
    }

    if (provider) {
      queryText += ` AND provider_id = $${paramIndex}`;
      params.push(provider);
      paramIndex++;
    }

    if (year !== undefined) {
      queryText += ` AND year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (month !== undefined) {
      queryText += ` AND month = $${paramIndex}`;
      params.push(month);
    }

    const result = await query<{ count: string }>(queryText, params);
    return parseInt(result.rows[0].count, 10);
  }
}
