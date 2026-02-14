import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { testConnection, closePool } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import craRoutes from './routes/cra.routes.js';
import companyRoutes from './routes/company.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

// Middleware pour parser le JSON et les cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Note: Les uploads sont maintenant stockés en base64 dans PostgreSQL
// Plus besoin de servir les fichiers statiques

// Middleware de logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cras', craRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/upload', uploadRoutes);

// Route de santé / health check
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbConnected = await testConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Middleware de gestion des erreurs (Express exige 4 paramètres)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    console.log('Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('✗ Failed to connect to database');
      console.error(
        'Make sure PostgreSQL is running and the credentials are correct',
      );
      process.exit(1);
    }

    console.log('✓ Database connection successful');

    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════╗');
      console.log('║                                                   ║');
      console.log(`║  🚀 Server running on http://localhost:${PORT}      ║`);
      console.log('║                                                   ║');
      console.log('║  📚 API Documentation:                            ║');
      console.log(`║     GET    /api/health                            ║`);
      console.log('║                                                   ║');
      console.log('║  Auth:                                            ║');
      console.log(`║     POST   /api/auth/register                     ║`);
      console.log(`║     POST   /api/auth/login                        ║`);
      console.log(`║     POST   /api/auth/logout                       ║`);
      console.log(`║     POST   /api/auth/refresh                      ║`);
      console.log(`║     GET    /api/auth/me                           ║`);
      console.log('║                                                   ║');
      console.log('║  CRAs:                                            ║');
      console.log(`║     GET    /api/cras                              ║`);
      console.log(`║     GET    /api/cras/:id                          ║`);
      console.log(`║     POST   /api/cras                              ║`);
      console.log(`║     PUT    /api/cras/:id                          ║`);
      console.log(`║     DELETE /api/cras/:id                          ║`);
      console.log('║                                                   ║');
      console.log('║  Companies:                                       ║');
      console.log(`║     GET    /api/companies                         ║`);
      console.log(`║     GET    /api/companies/:id                     ║`);
      console.log(`║     POST   /api/companies                         ║`);
      console.log(`║     PUT    /api/companies/:id                     ║`);
      console.log(`║     DELETE /api/companies/:id                     ║`);
      console.log('║                                                   ║');
      console.log('║  Upload:                                          ║');
      console.log(`║     POST   /api/upload/signature                  ║`);
      console.log(`║     DELETE /api/upload/signature/:filename        ║`);
      console.log('║                                                   ║');
      console.log('╚═══════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await closePool();
  process.exit(0);
});

// Démarrer le serveur
startServer();
