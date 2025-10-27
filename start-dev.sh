#!/bin/bash

# Script de démarrage pour l'environnement de développement Crafter
# Ce script démarre Docker, initialise la base de données, et lance le backend et le frontend

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║                                           ║"
echo "║   🚀 Starting Crafter Development Mode    ║"
echo "║                                           ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Démarrer Docker Compose
log_info "Starting Docker containers (PostgreSQL + Adminer)..."
docker-compose up -d

if [ $? -ne 0 ]; then
    log_error "Failed to start Docker containers"
    exit 1
fi

log_success "Docker containers started successfully"

# Attendre que PostgreSQL soit prêt
log_info "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec cra_postgres pg_isready -U cra_user -d cra_db > /dev/null 2>&1; then
        log_success "PostgreSQL is ready"
        break
    fi

    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start in time"
        exit 1
    fi

    echo -n "."
    sleep 1
done

# Vérifier si les tables existent déjà
log_info "Checking if database tables exist..."
TABLE_EXISTS=$(docker exec cra_postgres psql -U cra_user -d cra_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='cras');")

if [ "$TABLE_EXISTS" = "f" ]; then
    log_info "Tables not found. Running database migration..."

    # Exécuter les migrations
    if docker exec -i cra_postgres psql -U cra_user -d cra_db < backend/migrations/init.sql > /dev/null 2>&1; then
        log_success "Database migrated successfully"
    else
        log_error "Failed to migrate database"
        exit 1
    fi
else
    log_warning "Database tables already exist. Skipping migration."
fi

# Vérifier si node_modules existe dans backend
if [ ! -d "backend/node_modules" ]; then
    log_info "Installing backend dependencies..."
    cd backend && npm install && cd ..
    log_success "Backend dependencies installed"
fi

# Démarrer le backend en arrière-plan
log_info "Starting backend server on port 3001..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
log_info "Waiting for backend to be ready..."
for i in {1..20}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Backend is ready"
        break
    fi

    if [ $i -eq 20 ]; then
        log_warning "Backend may not be ready yet, but continuing..."
    fi

    echo -n "."
    sleep 1
done

# Démarrer le frontend
log_info "Starting frontend server on port 5173..."
echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║                                           ║"
echo "║  ✓ Backend:  http://localhost:3001       ║"
echo "║  ✓ Frontend: http://localhost:5173       ║"
echo "║  ✓ Adminer:  http://localhost:8080       ║"
echo "║                                           ║"
echo "║  Backend logs: tail -f backend.log       ║"
echo "║                                           ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Fonction pour arrêter proprement tous les services
cleanup() {
    echo ""
    log_info "Stopping all services..."

    # Arrêter le backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # Arrêter le frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Optionnel : arrêter Docker (commenter si vous voulez garder la DB active)
    # docker-compose down

    log_success "All services stopped"
    exit 0
}

# Capturer Ctrl+C pour arrêter proprement
trap cleanup SIGINT SIGTERM

# Démarrer le frontend (au premier plan)
npm run dev
