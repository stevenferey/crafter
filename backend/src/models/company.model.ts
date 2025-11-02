import { pool, query } from '../config/database.js';
import {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
} from '../types/company.types.js';

/**
 * Model pour les opérations CRUD sur les sociétés
 */
export class CompanyModel {
  /**
   * Récupère toutes les sociétés avec filtres optionnels
   */
  static async findAll(filters: CompanyFilters = {}): Promise<Company[]> {
    const {
      designation,
      city,
      repertoire,
      registre,
      limit = 50,
      offset = 0,
    } = filters;

    let queryText = `
      SELECT
        id,
        designation,
        address,
        complement,
        city,
        postal_code,
        country,
        email,
        phone,
        repertoire,
        repertoire_number,
        dispense,
        registre,
        registre_number,
        liste,
        code,
        exemption,
        tva_number,
        created_at,
        updated_at
      FROM companies
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (designation) {
      queryText += ` AND designation ILIKE $${paramIndex}`;
      params.push(`%${designation}%`);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (repertoire) {
      queryText += ` AND repertoire = $${paramIndex}`;
      params.push(repertoire);
      paramIndex++;
    }

    if (registre) {
      queryText += ` AND registre = $${paramIndex}`;
      params.push(registre);
      paramIndex++;
    }

    queryText += `
      ORDER BY designation ASC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query<Company>(queryText, params);
    return result.rows;
  }

  /**
   * Récupère une société par son ID
   */
  static async findById(id: string): Promise<Company | null> {
    const queryText = `
      SELECT
        id,
        designation,
        address,
        complement,
        city,
        postal_code,
        country,
        email,
        phone,
        repertoire,
        repertoire_number,
        dispense,
        registre,
        registre_number,
        liste,
        code,
        exemption,
        tva_number,
        created_at,
        updated_at
      FROM companies
      WHERE id = $1
    `;

    const result = await query<Company>(queryText, [id]);
    return result.rows[0] || null;
  }

  /**
   * Crée une nouvelle société
   */
  static async create(data: CreateCompanyInput): Promise<Company> {
    const queryText = `
      INSERT INTO companies (
        designation,
        address,
        complement,
        city,
        postal_code,
        country,
        email,
        phone,
        repertoire,
        repertoire_number,
        dispense,
        registre,
        registre_number,
        liste,
        code,
        exemption,
        tva_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING
        id,
        designation,
        address,
        complement,
        city,
        postal_code,
        country,
        email,
        phone,
        repertoire,
        repertoire_number,
        dispense,
        registre,
        registre_number,
        liste,
        code,
        exemption,
        tva_number,
        created_at,
        updated_at
    `;

    const params = [
      data.designation,
      data.address,
      data.complement || null,
      data.city,
      data.postal_code,
      data.country,
      data.email,
      data.phone || null,
      data.repertoire,
      data.repertoire_number,
      data.dispense,
      data.registre || null,
      data.registre_number || null,
      data.liste,
      data.code || null,
      data.exemption,
      data.tva_number || null,
    ];

    const result = await query<Company>(queryText, params);
    return result.rows[0];
  }

  /**
   * Met à jour une société existante
   */
  static async update(
    id: string,
    data: UpdateCompanyInput
  ): Promise<Company | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Construire la requête de mise à jour dynamiquement
      const updates: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (data.designation !== undefined) {
        updates.push(`designation = $${paramIndex}`);
        params.push(data.designation);
        paramIndex++;
      }

      if (data.address !== undefined) {
        updates.push(`address = $${paramIndex}`);
        params.push(data.address);
        paramIndex++;
      }

      if (data.complement !== undefined) {
        updates.push(`complement = $${paramIndex}`);
        params.push(data.complement || null);
        paramIndex++;
      }

      if (data.city !== undefined) {
        updates.push(`city = $${paramIndex}`);
        params.push(data.city);
        paramIndex++;
      }

      if (data.postal_code !== undefined) {
        updates.push(`postal_code = $${paramIndex}`);
        params.push(data.postal_code);
        paramIndex++;
      }

      if (data.country !== undefined) {
        updates.push(`country = $${paramIndex}`);
        params.push(data.country);
        paramIndex++;
      }

      if (data.email !== undefined) {
        updates.push(`email = $${paramIndex}`);
        params.push(data.email);
        paramIndex++;
      }

      if (data.phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        params.push(data.phone || null);
        paramIndex++;
      }

      if (data.repertoire !== undefined) {
        updates.push(`repertoire = $${paramIndex}`);
        params.push(data.repertoire);
        paramIndex++;
      }

      if (data.repertoire_number !== undefined) {
        updates.push(`repertoire_number = $${paramIndex}`);
        params.push(data.repertoire_number);
        paramIndex++;
      }

      if (data.dispense !== undefined) {
        updates.push(`dispense = $${paramIndex}`);
        params.push(data.dispense);
        paramIndex++;
      }

      if (data.registre !== undefined) {
        updates.push(`registre = $${paramIndex}`);
        params.push(data.registre || null);
        paramIndex++;
      }

      if (data.registre_number !== undefined) {
        updates.push(`registre_number = $${paramIndex}`);
        params.push(data.registre_number || null);
        paramIndex++;
      }

      if (data.liste !== undefined) {
        updates.push(`liste = $${paramIndex}`);
        params.push(data.liste);
        paramIndex++;
      }

      if (data.code !== undefined) {
        updates.push(`code = $${paramIndex}`);
        params.push(data.code || null);
        paramIndex++;
      }

      if (data.exemption !== undefined) {
        updates.push(`exemption = $${paramIndex}`);
        params.push(data.exemption);
        paramIndex++;
      }

      if (data.tva_number !== undefined) {
        updates.push(`tva_number = $${paramIndex}`);
        params.push(data.tva_number || null);
        paramIndex++;
      }

      // Toujours mettre à jour updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updates.length === 1) {
        // Seulement updated_at, pas besoin de mise à jour
        await client.query('COMMIT');
        return this.findById(id);
      }

      // Ajouter l'ID à la fin des paramètres
      params.push(id);

      const updateQuery = `
        UPDATE companies
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING
          id,
          designation,
          address,
          complement,
          city,
          postal_code,
          country,
          email,
          phone,
          repertoire,
          repertoire_number,
          dispense,
          registre,
          registre_number,
          liste,
          code,
          exemption,
          tva_number,
          created_at,
          updated_at
      `;

      const result = await client.query<Company>(updateQuery, params);

      await client.query('COMMIT');

      return result.rows[0] || null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Supprime une société
   * Retourne une erreur si la société est utilisée dans des CRA
   */
  static async delete(id: string): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Vérifier si la société est utilisée dans des CRA
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM cras
        WHERE client_id = $1 OR provider_id = $1
      `;
      const checkResult = await client.query<{ count: string }>(checkQuery, [
        id,
      ]);
      const count = parseInt(checkResult.rows[0].count, 10);

      if (count > 0) {
        throw new Error(
          `Cette société est utilisée dans ${count} CRA(s) et ne peut pas être supprimée`
        );
      }

      // Supprimer la société
      const result = await client.query('DELETE FROM companies WHERE id = $1', [
        id,
      ]);

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
   * Compte le nombre total de sociétés avec filtres
   */
  static async count(filters: CompanyFilters = {}): Promise<number> {
    const { designation, city, repertoire, registre } = filters;

    let queryText = 'SELECT COUNT(*) as count FROM companies WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (designation) {
      queryText += ` AND designation ILIKE $${paramIndex}`;
      params.push(`%${designation}%`);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (repertoire) {
      queryText += ` AND repertoire = $${paramIndex}`;
      params.push(repertoire);
      paramIndex++;
    }

    if (registre) {
      queryText += ` AND registre = $${paramIndex}`;
      params.push(registre);
      paramIndex++;
    }

    const result = await query<{ count: string }>(queryText, params);
    return parseInt(result.rows[0].count, 10);
  }
}
