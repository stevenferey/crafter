import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, closePool } from './config/database.js';
import craRoutes from './routes/cra.routes.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/cras', craRoutes);

// Route de santé / health check
app.get('/api/health', async (req: Request, res: Response) => {
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

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
      console.error('Make sure PostgreSQL is running and the credentials are correct');
      process.exit(1);
    }

    console.log('✓ Database connection successful');

    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║                                               ║');
      console.log(`║  🚀 Server running on http://localhost:${PORT}  ║`);
      console.log('║                                               ║');
      console.log('║  📚 API Documentation:                        ║');
      console.log(`║     GET    /api/health                        ║`);
      console.log(`║     GET    /api/cras                          ║`);
      console.log(`║     GET    /api/cras/:id                      ║`);
      console.log(`║     POST   /api/cras                          ║`);
      console.log(`║     PUT    /api/cras/:id                      ║`);
      console.log(`║     DELETE /api/cras/:id                      ║`);
      console.log('║                                               ║');
      console.log('╚═══════════════════════════════════════════════╝');
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
