import { pool, query } from '../config/database.js';
import {
  CRA,
  Activity,
  CreateCRAInput,
  UpdateCRAInput,
  CRAFilters,
} from '../types/cra.types.js';

/**
 * Model pour les opérations CRUD sur les CRA
 */
export class CRAModel {
  /**
   * Récupère tous les CRA avec filtres optionnels
   */
  static async findAll(filters: CRAFilters = {}): Promise<CRA[]> {
    const { status, client, startDate, endDate, limit = 50, offset = 0 } = filters;

    let queryText = `
      SELECT
        c.id,
        c.date,
        c.client,
        c.total_hours,
        c.status,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'cra_id', a.cra_id,
              'description', a.description,
              'hours', a.hours,
              'category', a.category,
              'created_at', a.created_at
            ) ORDER BY a.created_at
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as activities
      FROM cras c
      LEFT JOIN activities a ON c.id = a.cra_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (client) {
      queryText += ` AND c.client ILIKE $${paramIndex}`;
      params.push(`%${client}%`);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND c.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND c.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryText += `
      GROUP BY c.id, c.date, c.client, c.total_hours, c.status, c.created_at, c.updated_at
      ORDER BY c.date DESC, c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query<CRA>(queryText, params);
    return result.rows;
  }

  /**
   * Récupère un CRA par son ID
   */
  static async findById(id: string): Promise<CRA | null> {
    const queryText = `
      SELECT
        c.id,
        c.date,
        c.client,
        c.total_hours,
        c.status,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'cra_id', a.cra_id,
              'description', a.description,
              'hours', a.hours,
              'category', a.category,
              'created_at', a.created_at
            ) ORDER BY a.created_at
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as activities
      FROM cras c
      LEFT JOIN activities a ON c.id = a.cra_id
      WHERE c.id = $1
      GROUP BY c.id, c.date, c.client, c.total_hours, c.status, c.created_at, c.updated_at
    `;

    const result = await query<CRA>(queryText, [id]);
    return result.rows[0] || null;
  }

  /**
   * Crée un nouveau CRA avec ses activités
   */
  static async create(data: CreateCRAInput): Promise<CRA> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Calculer le total d'heures
      const totalHours = data.activities.reduce((sum, act) => sum + act.hours, 0);

      // Créer le CRA
      const craQuery = `
        INSERT INTO cras (date, client, total_hours, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id, date, client, total_hours, status, created_at, updated_at
      `;
      const craResult = await client.query(craQuery, [
        data.date,
        data.client,
        totalHours,
        data.status || 'draft',
      ]);

      const cra = craResult.rows[0];

      // Créer les activités
      const activities: Activity[] = [];
      for (const activity of data.activities) {
        const activityQuery = `
          INSERT INTO activities (cra_id, description, hours, category)
          VALUES ($1, $2, $3, $4)
          RETURNING id, cra_id, description, hours, category, created_at
        `;
        const activityResult = await client.query(activityQuery, [
          cra.id,
          activity.description,
          activity.hours,
          activity.category,
        ]);
        activities.push(activityResult.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...cra,
        activities,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Met à jour un CRA existant
   */
  static async update(id: string, data: UpdateCRAInput): Promise<CRA | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Construire la requête de mise à jour dynamiquement
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.date !== undefined) {
        updates.push(`date = $${paramIndex}`);
        params.push(data.date);
        paramIndex++;
      }

      if (data.client !== undefined) {
        updates.push(`client = $${paramIndex}`);
        params.push(data.client);
        paramIndex++;
      }

      if (data.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        params.push(data.status);
        paramIndex++;
      }

      // Si des activités sont fournies, supprimer les anciennes et créer les nouvelles
      if (data.activities !== undefined) {
        // Calculer le nouveau total d'heures
        const totalHours = data.activities.reduce((sum, act) => sum + act.hours, 0);
        updates.push(`total_hours = $${paramIndex}`);
        params.push(totalHours);
        paramIndex++;

        // Supprimer les anciennes activités
        await client.query('DELETE FROM activities WHERE cra_id = $1', [id]);

        // Créer les nouvelles activités
        for (const activity of data.activities) {
          await client.query(
            'INSERT INTO activities (cra_id, description, hours, category) VALUES ($1, $2, $3, $4)',
            [id, activity.description, activity.hours, activity.category]
          );
        }
      }

      // Toujours mettre à jour updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      // Ajouter l'ID à la fin des paramètres
      params.push(id);

      if (updates.length === 1) {
        // Seulement updated_at, pas besoin de mise à jour
        await client.query('COMMIT');
        return this.findById(id);
      }

      const updateQuery = `
        UPDATE cras
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, date, client, total_hours, status, created_at, updated_at
      `;

      const result = await client.query(updateQuery, params);

      await client.query('COMMIT');

      if (result.rows.length === 0) {
        return null;
      }

      // Récupérer le CRA complet avec les activités
      return this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Supprime un CRA et ses activités
   */
  static async delete(id: string): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Supprimer les activités associées
      await client.query('DELETE FROM activities WHERE cra_id = $1', [id]);

      // Supprimer le CRA
      const result = await client.query('DELETE FROM cras WHERE id = $1', [id]);

      await client.query('COMMIT');

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Compte le nombre total de CRA avec filtres
   */
  static async count(filters: CRAFilters = {}): Promise<number> {
    const { status, client, startDate, endDate } = filters;

    let queryText = 'SELECT COUNT(*) as count FROM cras WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (client) {
      queryText += ` AND client ILIKE $${paramIndex}`;
      params.push(`%${client}%`);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const result = await query<{ count: string }>(queryText, params);
    return parseInt(result.rows[0].count, 10);
  }
}
