import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuration de la connexion PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cra_db',
  user: process.env.DB_USER || 'cra_user',
  password: process.env.DB_PASSWORD || 'cra_password',
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // Temps avant qu'un client inactif soit fermé
  connectionTimeoutMillis: 2000, // Temps d'attente maximum pour une connexion
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Fonction utilitaire pour exécuter des requêtes
export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Fonction pour tester la connexion
export const testConnection = async (): Promise<boolean> => {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Fonction pour fermer la connexion proprement
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('✓ Database pool closed');
};
