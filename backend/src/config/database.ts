import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// PostgreSQL DATE (OID 1082) est sémantiquement une date civile sans timezone.
// Par défaut, node-pg le convertit en Date en heure locale, qui devient décalé
// d'un jour à la sérialisation JSON UTC (ex. stocké 2026-01-31 → renvoyé
// "2026-01-30T23:00:00.000Z" pour un process en Europe/Paris). On préfère
// renvoyer la chaîne YYYY-MM-DD telle quelle pour éviter ce décalage.
types.setTypeParser(1082, (val: string) => val);

// Configuration de la connexion PostgreSQL
// Supporte DATABASE_URL (Railway/production) ou variables séparées (dev local)
export const pool = new Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'cra_db',
        user: process.env.DB_USER || 'cra_user',
        password: process.env.DB_PASSWORD || 'cra_password',
      }),
  // SSL requis en production
  // Set DB_SSL_REJECT_UNAUTHORIZED=false only for providers with self-signed certs (e.g. Railway)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
export const query = async <T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
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
